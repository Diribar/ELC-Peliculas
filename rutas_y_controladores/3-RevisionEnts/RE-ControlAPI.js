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
		let motivoGenerico_id = motivos_rech_edic.find((n) => n.info_erronea).id;
		return res.json(motivoGenerico_id);
	},
	edicAprobRech: async (req, res) => {
		// Variables
		let {entidad, id: entID, edicion_id: edicID, campo, aprob, motivo_id} = req.query; // Tiene que ser 'let' por el 'entID'
		const nombreEdic = comp.obtieneNombreEdicionDesdeEntidad(entidad);
		const revID = req.session.usuario.id;

		// Obtiene el registro editado
		let include = comp.obtieneTodosLosCamposInclude(entidad);
		let edicion = await BD_genericas.obtienePorIdConInclude(nombreEdic, edicID, include);

		// PROBLEMAS
		// 1. No existe la edición
		if (!edicion) return res.json({mensaje: "No se encuentra la edición"});
		// 2. No existe el campo a analizar
		if (edicion[campo] === null) return res.json({mensaje: "El campo no está pendiente para procesar"});
		// 3. Rechazado sin motivo
		if (!aprob && !motivo_id) return res.json({mensaje: "Falta especificar el motivo del rechazo"});

		// Si la entidad es un link, obtiene su id
		if (entidad == "links") entID = edicion.link_id;
		// Obtiene la versión original con include
		let original = await BD_genericas.obtienePorIdConInclude(entidad, entID, [...include, "status_registro"]);

		// PROCESOS COMUNES A TODOS LOS CAMPOS
		let prodStatusAprob;
		const objeto = {entidad, original, edicion, revID, campo, aprob, motivo_id};
		[edicion, prodStatusAprob] = await procesos.edicion.edicAprobRech(objeto);

		// Fin
		return res.json({OK: true, quedanCampos: !!edicion, statusAprob: prodStatusAprob});
	},
	// Links
	linkAltaBaja: async (req, res) => {
		// Variables
		const {prodEntidad, prodID, url, IN, aprob, motivo_id} = req.query;
		const entidad = "links";

		// PROBLEMAS
		// Averigua si existe el dato del 'url'
		if (!url) return res.json({mensaje: "Falta el 'url' del link", reload: true});
		// Se obtiene el status original del link
		let original = await BD_genericas.obtienePorCondicionConInclude(entidad, {url}, ["status_registro", "tipo"]);
		const id = original.id;
		// El link no existe en la BD
		if (!original) return res.json({mensaje: "El link no existe en la base de datos", reload: true});
		// El link existe y tiene un status 'estable'
		if (original.status_registro.gr_estables) return res.json({mensaje: "En este status no se puede procesar", reload: true});

		// Variables de status
		const creado = original.status_registro.creado;
		const inactivar = original.status_registro.inactivar;
		const recuperar = original.status_registro.recuperar;

		// Más variables
		const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);
		const revID = req.session.usuario.id;
		const ahora = comp.ahora();
		const alta_revisada_en = ahora;
		const status_registro_id = IN == "SI" ? aprobado_id : inactivo_id;
		const decisAprob = aprob == "SI";
		const campoDecision = petitFamilia + (decisAprob ? "_aprob" : "_rech");

		// Arma los datos
		let datos = {
			status_registro_id,
			sugerido_por_id: revID,
			sugerido_en: alta_revisada_en,
		};
		if (creado) {
			datos.alta_revisada_por_id = revID;
			datos.alta_revisada_en = alta_revisada_en;
			datos.lead_time_creacion = comp.obtieneLeadTime(original.creado_en, alta_revisada_en);
		}
		if (aprob != "SI" && IN != "SI") datos.motivo_id = motivo_id ? motivo_id : original.motivo_id;

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// 2. Agrega un registro en el historial_cambios_de_status
		let datosHist;
		let sugerido_por_id = original.sugerido_por_id;
		(() => {
			datosHist = {
				entidad_id: id,
				entidad,
				sugerido_por_id,
				sugerido_en: creado ? original.creado_en : original.sugerido_en,
				revisado_por_id: revID,
				revisado_en: ahora,
				status_original_id: original.status_registro_id,
				status_final_id: status_registro_id,
				aprobado: decisAprob,
			};
			if (datos.motivo_id) {
				datosHist.motivo_id = datos.motivo_id;
				datosHist.motivo = motivos_rech_altas.find((n) => n.id == motivo_id);
				datosHist.duracion = Number(datosHist.motivo.duracion);
			}
			return;
		})();
		// return res.json({});
		BD_genericas.agregaRegistro("historial_cambios_de_status", datosHist);

		// 3. Aumenta el valor de links_aprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", sugerido_por_id, campoDecision, 1);

		// 4. Penaliza al usuario si corresponde
		if (datosHist.motivo) comp.usuarioPenalizAcum(sugerido_por_id, datosHist.motivo, petitFamilia);

		// 5. Actualiza los productos, en los campos 'castellano', 'links_gratuitos' y 'links_general'
		procsCRUD.cambioDeStatus(entidad, {...original, status_registro_id});

		// Se recarga la vista
		return res.json({mensaje: "Status actualizado", reload: true});
	},
};
