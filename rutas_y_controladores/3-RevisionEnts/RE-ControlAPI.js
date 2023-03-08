"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./RE-Procesos");

// *********** Controlador ***********
module.exports = {
	// Productos y RCLV
	obtieneMotivoGenerico: (req, res) => {
		let motivoGenerico_id = edic_motivos_rech.find((n) => n.info_erronea).id;
		return res.json(motivoGenerico_id);
	},
	edicAprobRech: async (req, res) => {
		// Variables
		const {entidad, id: entID, edicion_id: edicID, campo, aprob, motivo_id} = req.query;
		const nombreEdic = comp.obtieneNombreEdicionDesdeEntidad(entidad);
		const revID = req.session.usuario.id;

		// Obtiene el registro editado
		let include = comp.obtieneTodosLosCamposInclude(entidad);
		let edicion = await BD_genericas.obtienePorIdConInclude(nombreEdic, edicID, include);
		// Si no existe la edición, interrumpe el flujo
		if (!edicion) return res.json({OK: false, mensaje: "No se encuentra la edición"});
		// Si no existe el campo a analizar, interrumpe el flujo
		if (edicion[campo] === null) return res.json({OK: false, mensaje: "El campo no está pendiente para procesar"});

		// Obtiene la versión original con include
		let original = await BD_genericas.obtienePorIdConInclude(entidad, entID, [...include, "status_registro"]);

		// PROCESOS COMUNES A TODOS LOS CAMPOS
		let statusAprob;
		[edicion, statusAprob] = await procesos.edicion.edicAprobRech({
			entidad,
			original,
			edicion,
			revID,
			campo,
			aprob,
			motivo_id,
		});

		// Fin
		return res.json({OK: true, quedanCampos: !!edicion, statusAprob});
	},
	// Links
	linkAltaBaja: async (req, res) => {
		// Variables
		const {entidad: prodEntidad, id: prodID, url, aprob, motivo_id} = req.query;
		const entidad = "links";

		// PROBLEMAS
		// Averigua si existe el dato del 'url'
		if (!url) return res.json({mensaje: "Falta el 'url' del link", reload: true});
		// Se obtiene el status original del link
		let original = await BD_genericas.obtienePorCamposConInclude(entidad, {url}, ["status_registro", "tipo"]);
		const id = original.id;
		// El link no existe en la BD
		if (!original) return res.json({mensaje: "El link no existe en la base de datos", reload: true});
		// El link existe y tiene un status 'estable'
		if (original.status_registro.gr_estables) return res.json({mensaje: "En este status no se puede procesar", reload: true});

		// Variables de status
		const creado = original.status_registro.creado;
		const creadoAprob = original.status_registro.creado_aprob;
		const inactivar = original.status_registro.inactivar;
		const recuperar = original.status_registro.recuperar;

		// Más variables
		const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);
		const revID = req.session.usuario.id;
		const ahora = comp.ahora();
		const alta_analizada_en = ahora;
		const status_registro_id = aprob ? aprobado_id : inactivo_id;
		const decisAprob = !creadoAprob ? (aprob && (creado || recuperar)) || (!aprob && inactivar) : "";
		const campoDecision = petitFamilia + (decisAprob ? "_aprob" : "_rech");

		// Arma los datos
		let datos = {
			status_registro_id,
			alta_analizada_por_id: revID,
			alta_analizada_en,
			sugerido_por_id: revID,
			sugerido_en: alta_analizada_en,
		};
		if (creado) datos.lead_time_creacion = comp.obtieneLeadTime(original.creado_en, alta_analizada_en);
		if (!aprob) datos.motivo_id = motivo_id;
		// return res.json({});

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// 2. Agrega un registro en el historial_cambios_de_status
		let datosHist;
		let sugerido_por_id = creado ? original.creado_por_id : original.sugerido_por_id;
		(() => {
			datosHist = {
				entidad_id: id,
				entidad,
				sugerido_por_id,
				sugerido_en: creado ? original.creado_en : original.sugerido_en,
				analizado_por_id: revID,
				analizado_en: ahora,
				status_original_id: original.status_registro_id,
				status_final_id: status_registro_id,
				aprobado: decisAprob,
			};
			if (!aprob && !inactivar) {
				datosHist.motivo_id = motivo_id;
				datosHist.motivo = altas_motivos_rech.find((n) => n.id == motivo_id);
				datosHist.duracion = Number(datosHist.motivo.duracion);
			}
			return;
		})();
		BD_genericas.agregaRegistro("historial_cambios_de_status", datosHist);

		// 3. Aumenta el valor de links_aprob/rech en el registro del usuario
		if (!creadoAprob) BD_genericas.aumentaElValorDeUnCampo("usuarios", sugerido_por_id, campoDecision, 1);

		// 4. Penaliza al usuario si corresponde
		if (!creadoAprob && datosHist.duracion) comp.usuarioPenalizAcum(sugerido_por_id, datosHist.motivo, petitFamilia);

		// 5. Actualiza los productos, en los campos 'castellano', 'links_gratuitos' y 'links_general'
		procsCRUD.cambioDeStatus(entidad, {...original, status_registro_id});

		// Se recarga la vista
		return res.json({mensaje: "Status actualizado", reload: true});
	},
};
