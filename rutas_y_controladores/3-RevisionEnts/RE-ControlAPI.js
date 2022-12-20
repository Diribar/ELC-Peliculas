"use strict";
// ************ Requires *************
const path = require("path");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procesos = require("./RE-Procesos");

// *********** Controlador ***********
module.exports = {
	// Productos
	edic_AprobRech: async (req, res) => {
		// Variables
		const {entidad, id: entID, edicion_id: edicID, campo} = req.query;
		// Obtiene el registro editado
		let familia = comp.obtieneFamiliaEnPlural(entidad);
		let includesEdic = comp.includes(familia);
		let nombreEdic = (familia == "productos" ? "prods" : "rclvs") + "_edicion";
		let regEdic = await BD_genericas.obtienePorIdConInclude(nombreEdic, edicID, includesEdic);
		let quedanCampos, statusAprob;
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
		[, , quedanCampos, statusAprob] = await procesos.prodEdicGuardar_Gral(req, regOrig, regEdic);
		// Fin
		return res.json({OK: true, quedanCampos, statusAprob});
	},
	prodEdic_ConvierteUrlEnArchivo: async (req, res) => {
		// Variables
		let {entidad, id, url} = req.query;
		let avatar = Date.now() + path.extname(url);
		let rutaYnombre = "./publico/imagenes/3-Productos/" + avatar;
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
	linkAlta: async (req, res) => {
		// Variables
		const {prodEntidad, prodID, url} = req.query;
		const aprobado = req.query.aprob == "true";
		const userID = req.session.usuario.id;
		const st_aprobado = status_registro.find((n) => n.aprobado).id;
		const st_inactivo = status_registro.find((n) => n.inactivo).id;
		const ahora = comp.ahora();
		let datos, motivo;
		// Averigua si existe el dato del 'url'
		if (!url) return res.json({mensaje: "Falta el 'url' del link", reload: true});
		// Se obtiene el status original del link
		let link = await BD_genericas.obtienePorCamposConInclude("links", {url}, "status_registro");
		// El link no existe en la BD
		if (!link) return res.json({mensaje: "El link no existe en la base de datos", reload: true});
		// El link existe y no tiene status 'creado' o 'provisorio'
		let creado = link.status_registro.creado;
		let inactivar = link.status_registro.inactivar;
		let recuperar = link.status_registro.recuperar;
		let gr_provisorios = inactivar || recuperar;
		if (!creado && !gr_provisorios)
			return res.json({mensaje: "En este status no se puede procesar", reload: true});
		// USUARIO - Actualización de link_aprob / link_rech
		let campo = "link_" + (aprobado ? "aprob" : "rech");
		let sugerido_por_id = creado ? link.creado_por_id : link.sugerido_por_id;
		BD_genericas.aumentaElValorDeUnCampo("usuarios", sugerido_por_id, campo, 1);
		// USUARIO - Verifica la penalidad - sólo para 'creado/recuperar' + 'rechazado'
		if (!aprobado) {
			motivo_id = creado ? req.query.motivo_id : gr_provisorios ? link.motivo_id : null;
			if (creado || recuperar) {
				motivo = await BD_genericas.obtienePorId("altas_motivos_rech", motivo_id);
				comp.usuario_aumentaPenalizacAcum(sugerido_por_id, motivo);
			}
		}
		// LINK - Pasa a status aprobado/rechazado

		datos = {status_registro_id: aprobado ? st_aprobado : st_inactivo};
		if (creado) {
			// Datos para el link
			datos.alta_analizada_por_id = userID;
			datos.alta_analizada_en = comp.ahora();
			datos.lead_time_creacion = 1;
			if (!aprobado) {
				datos.sugerido_por_id = userID;
				datos.sugerido_en = ahora;
				datos.motivo_id = motivo_id;
			}
		}
		await BD_genericas.actualizaPorId("links", link.id, datos);
		// HISTORIAL DE CAMBIOS DE STATUS - Se agrega un registro
		let duracion = motivo ? motivo.duracion : 0;
		datos = {
			link_id: link.id,
			sugerido_por_id,
			sugerido_en: creado ? link.creado_en : link.sugerido_en,
			analizado_por_id: userID,
			analizado_en: ahora,
			status_original_id: link.status_registro_id,
			status_final_id: aprobado ? st_aprobado : st_inactivo,
			aprobado,
			motivo_id,
			duracion,
		};
		BD_genericas.agregaRegistro("historial_cambios_de_status", datos);
		// PRODUCTO - Actualizar si tiene links gratuitos
		if (aprobado) procesos.links_prodCampoLG_OK(prodEntidad, prodID);
		// Se recarga la vista
		return res.json({mensaje: "Status actualizado", reload: true});
	},
	linkEdic: async (req, res) => {
		// Variables
		const {prodEntidad, prodID, edicion_id: edicID, campo} = req.query;
		const edicAprob = req.query.aprob == "true";
		const decision = edicAprob ? "edics_aprob" : "edics_rech";
		const userID = req.session.usuario.id;
		let datos;
		// Obtiene el registro editado
		let linkEdic = await BD_genericas.obtienePorId("links_edicion", edicID);
		// Verificación: averigua si existe la edición y el campo a analizar
		let condicion = linkEdic && !linkEdic[campo];
		if (!linkEdic || condicion) return res.json({mensaje: "false", reload: true});
		// Obtiene los campos 'consecuencia'
		let campos = procesos.obtieneCamposLinkEdic(edicAprob, linkEdicion, campo);
		// Si la edición fue aprobada, actualiza el registro 'original' *******************
		let linkID = linkEdic.link_id;
		let linkOrig = {id: linkID};
		if (edicAprob) linkOrig = await procesos.actualizaOriginal(linkOrig, linkEdic, campos, userID);
		// Actualizaciones en el USUARIO
		await procesos.edic_AccionesAdic(req, linkOrig, linkEdic);
		// Limpia las ediciones
		await linksEdic_LimpiarEdiciones(linkOrig);
		// Actualiza si el producto tiene links gratuitos
		if (edicAprob) procesos.links_prodCampoLG_OK(prodEntidad, prodID, campo);
		// Se recarga la vista
		return res.json({mensaje: "Campo eliminado de la edición", reload: true});
	},
};
