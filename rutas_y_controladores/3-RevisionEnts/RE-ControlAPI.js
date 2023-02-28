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
		let statusAprob = false;
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
		const {url} = req.query;
		const prodAprob = req.query.aprob == "SI";
		const userID = req.session.usuario.id;
		const ahora = comp.ahora();
		let datos, motivo, motivo_id;
		// Averigua si existe el dato del 'url'
		if (!url) return res.json({mensaje: "Falta el 'url' del link", reload: true});
		// Se obtiene el status original del link
		let link = await BD_genericas.obtienePorCamposConInclude("links", {url}, ["status_registro", "tipo"]);
		// El link no existe en la BD
		if (!link) return res.json({mensaje: "El link no existe en la base de datos", reload: true});
		// El link existe y no tiene status 'creado' o 'provisorio'
		const creado = link.status_registro.creado;
		const inactivar = link.status_registro.inactivar;
		const recuperar = link.status_registro.recuperar;
		const gr_provisorios = creado || inactivar || recuperar;
		if (!gr_provisorios) return res.json({mensaje: "En este status no se puede procesar", reload: true});

		// Decisión sobre el sugerido
		const decisAprob = (prodAprob && (creado || recuperar)) || (!prodAprob && inactivar);

		// USUARIO - Actualización de links_aprob / links_rech
		let campo = "links_" + (decisAprob ? "aprob" : "rech");
		let sugerido_por_id = creado ? link.creado_por_id : link.sugerido_por_id;
		BD_genericas.aumentaElValorDeUnCampo("usuarios", sugerido_por_id, campo, 1);
		// USUARIO - Verifica la penalidad cuando se rechaza el link sugerido
		if (!decisAprob && (creado || recuperar)) {
			motivo_id = req.query.motivo_id;
			motivo = altas_motivos_rech.find((n) => n.id == motivo_id);
			comp.usuarioPenalizAcum(sugerido_por_id, motivo, "links");
		}

		// LINK - Pasa a status aprobado/rechazado
		datos = {status_registro_id: prodAprob ? aprobado_id : inactivo_id};
		if (creado) {
			// Datos para el link
			datos.alta_analizada_por_id = userID;
			datos.alta_analizada_en = ahora;
			datos.lead_time_creacion = comp.obtieneLeadTime(link.creado_en, ahora);
			if (!prodAprob) datos.motivo_id = motivo_id;
		}
		await BD_genericas.actualizaPorId("links", link.id, datos);
		link = {...link, ...datos};
		procsCRUD.cambioDeStatus("links", link);

		// HISTORIAL DE CAMBIOS DE STATUS - Se agrega un registro
		let duracion = !prodAprob ? motivo.duracion : 0;
		datos = {
			entidad_id: link.id,
			entidad: "links",
			motivo_id,
			sugerido_por_id,
			sugerido_en: creado ? link.creado_en : link.sugerido_en,
			analizado_por_id: userID,
			analizado_en: ahora,
			status_original_id: link.status_registro_id,
			status_final_id: prodAprob ? aprobado_id : inactivo_id,
			aprobado: prodAprob,
			duracion,
		};
		BD_genericas.agregaRegistro("historial_cambios_de_status", datos);

		// Se recarga la vista
		return res.json({mensaje: "Status actualizado", reload: true});
	},
};
