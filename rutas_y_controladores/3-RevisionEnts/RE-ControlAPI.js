"use strict";
// ************ Requires *************
const path = require("path");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./RE-Procesos");

// *********** Controlador ***********
module.exports = {
	// Productos
	edic_AprobRech: async (req, res) => {
		// Variables
		const {entidad, id: entID, edicion_id: edicID, campo} = req.query;
		const familia = comp.obtieneFamiliaEnPlural(entidad);
		const nombreEdic = (familia == "productos" ? "prods" : familia) + "_edicion";
		let quedanCampos, statusAprob;

		// Obtiene el registro editado
		let includesEdic = comp.obtieneTodosLosCamposInclude(entidad);
		let regEdic = await BD_genericas.obtienePorIdConInclude(nombreEdic, edicID, includesEdic);
		// Si no existe la edición, interrumpe el flujo
		if (!regEdic) return res.json({OK: false, mensaje: "No se encuentra la edición"});
		// Si no existe el campo a analizar, interrumpe el flujo
		if (!regEdic[campo]) return res.json({OK: false, mensaje: "El campo ya se había procesado"});

		// Obtiene la versión original con includes
		let includesOrig = [...includesEdic, "status_registro"];
		let regOrig = await BD_genericas.obtienePorIdConInclude(entidad, entID, includesOrig);

		// Acciones si el campo es avatar
		if (campo == "avatar") regEdic = await procesos.prodEdicGuardar_Avatar(req, regOrig, regEdic);

		// Tareas adicionales
		[, , quedanCampos, statusAprob] = await procesos.guardaEdicRev(req, regOrig, regEdic);
		// Fin
		return res.json({OK: true, quedanCampos, statusAprob});
	},
	prodEdic_ConvierteUrlEnArchivo: async (req, res) => {
		// Variables
		let {entidad, id, url} = req.query;
		let avatar = Date.now() + path.extname(url);
		let rutaYnombre = "./publico/imagenes/2-Avatar-Prods-Final/" + avatar;
		// Realiza y obtiene el resultado de la descarga
		let resultado = await comp.descarga(url, rutaYnombre);
		// Acciones si el resultado es OK
		if (resultado == "OK") {
			// Actualiza el campo avatar en el registro original
			BD_genericas.actualizaPorId(entidad, id, {avatar});
			// Actualiza la ruta para actualizar el 'src' en la vista
			rutaYnombre = rutaYnombre.slice(rutaYnombre.indexOf("/imagenes"));
		}
		// Fin
		return res.json([resultado, rutaYnombre]);
	},
	// Links
	linkAltaBaja: async (req, res) => {
		// Variables
		const {prodEntidad, prodID, url} = req.query;
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
		const gr_provisorios = inactivar || recuperar;
		if (!creado && !gr_provisorios)
			return res.json({mensaje: "En este status no se puede procesar", reload: true});

		// Decisión sobre el sugerido
		const decisAprob = (prodAprob && (creado || recuperar)) || (!prodAprob && inactivar);

		// USUARIO - Actualización de links_aprob / links_rech
		let campo = "links_" + (decisAprob ? "aprob" : "rech");
		let sugerido_por_id = creado ? link.creado_por_id : link.sugerido_por_id;
		BD_genericas.aumentaElValorDeUnCampo("usuarios", sugerido_por_id, campo, 1);
		// USUARIO - Verifica la penalidad cuando se rechaza el link sugerido
		if (!decisAprob && (creado || recuperar)) {
			motivo_id = req.query.motivo_id;
			motivo = await BD_genericas.obtienePorId("altas_motivos_rech", motivo_id);
			comp.usuarioAumentaPenaliz(sugerido_por_id, motivo, "links");
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
		await procsCRUD.cambioDeStatus("links", link.id, datos);

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
