"use strict";
// ************ Requires *************
const path = require("path");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procesos = require("./Procesos");

// *********** Controlador ***********
module.exports = {
	// Productos
	prodEdic: async (req, res) => {
		// Variables
		const {entidad, id, edicion_id: edicID, campo} = req.query;
		const edicAprob = req.query.aprob == "true";
		const userID = req.session.usuario.id;
		// Obtiene el registro editado
		let includes = [
			"en_castellano",
			"en_color",
			"idioma_original",
			"categoria",
			"subcategoria",
			"publico_sugerido",
			"personaje",
			"hecho",
			"valor",
		];
		let prodEdic = await BD_genericas.obtienePorIdConInclude("prods_edicion", edicID, includes);
		// Verificación: averigua si existe la edición y el campo a analizar
		let condicion1 = campo == "avatar" && prodEdic && !prodEdic.avatar_archivo;
		let condicion2 = campo != "avatar" && prodEdic && !prodEdic[campo];
		if (!prodEdic || condicion1 || condicion2) return res.json("false");
		// Obtiene el producto original
		let prodOrig, statusOrigAprob;
		let datos = [entidad, id, includes, edicAprob, prodEdic, campo];
		[prodOrig, prodEdic, statusOrigAprob] = await procesos.obtieneProdOrig(...datos);
		// Si la edición fue aprobada, actualiza el registro 'original' *******************
		datos = {[campo]: prodEdic[campo]};
		if (edicAprob) prodOrig = await procesos.actualizaOriginal(prodOrig, prodEdic, datos, userID);
		// Actualizaciones en el USUARIO
		await procesos.edic_AccionesAdic(req, prodOrig, prodEdic);
		// Limpia la edición y cambia el status del producto si corresponde
		let [quedanCampos, , statusAprob] = await procesos.prodEdic_feedback(prodOrig, prodEdic);
		// Actualiza en RCLVs el campo 'prods_aprob', si corresponde
		procesos.RCLV_productosAprob(prodOrig, campo, edicAprob, statusOrigAprob, statusAprob);
		// Fin
		return res.json([quedanCampos, statusAprob]);
	},
	prodGuardaAvatar: async (req, res) => {
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
			// Actualiza la ruta para enviar al Front-End
			rutaYnombre = rutaYnombre.slice(rutaYnombre.indexOf("/imagenes"));
			console.log(rutaYnombre);
		}
		// Fin
		return res.json([resultado, rutaYnombre]);
	},
	// Links
	linkAlta: async (req, res) => {
		// Variables
		const {prodEntidad, prodID, url, motivo_id} = req.query;
		const creadoAprob = req.query.aprob == "true";
		const userID = req.session.usuario.id;
		const st_aprobado = status_registro.find((n) => n.aprobado).id;
		const st_inactivo = status_registro.find((n) => n.inactivo).id;
		const ahora = comp.ahora();
		let datos;
		// Averigua si no existe el 'url'
		if (!url) return res.json({mensaje: "Falta el 'url' del link", reload: true});
		// Se obtiene el status original del link
		let link = await BD_genericas.obtienePorCamposConInclude("links", {url}, ["status_registro"]);
		// El link no existe en la BD
		if (!link) return res.json({mensaje: "El link no existe en la base de datos", reload: true});
		// El link existe y no tiene status 'creado' o 'provisorio'
		let creado = link.status_registro.creado;
		let inactivar = link.status_registro.inactivar;
		let recuperar = link.status_registro.recuperar;
		let gr_provisorios = inactivar || recuperar;
		if (!creado && !gr_provisorios)
			return res.json({mensaje: "En este status no se puede procesos", reload: true});
		// Variables
		let decision = (!inactivar && creadoAprob) || (inactivar && !creadoAprob); // Obtiene si la decisión valida al sugerido
		let sugerido_por_id = creado ? link.creado_por_id : link.sugerido_por_id;
		motivo_id = !creado || !creadoAprob ? (creado ? motivo_id : link.motivo_id) : null;
		// USUARIO - Actualizaciones
		let campo = "link_" + (decision ? "aprob" : "rech");
		BD_genericas.aumentaElValorDeUnCampo("usuarios", sugerido_por_id, campo, 1);
		// USUARIO - Verifica la penalidad - sólo para 'creado/recuperar' + 'rechazado'
		if (!inactivar && !creadoAprob) {
			var motivo = await BD_genericas.obtienePorId("altas_motivos_rech", motivo_id);
			procesos.usuario_Penalizar(sugerido_por_id, motivo);
		}
		// LINK - Pasa a status aprobado/rechazado -
		datos = {status_registro_id: creadoAprob ? st_aprobado : st_inactivo};
		if (creado) {
			// Datos para el link
			datos.alta_analizada_por_id = userID;
			datos.alta_analizada_en = comp.ahora();
			datos.lead_time_creacion = 1;
			if (!creadoAprob) {
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
			status_final_id: creadoAprob ? st_aprobado : st_inactivo,
			aprobado: decision,
			motivo_id,
			duracion,
		};
		BD_genericas.agregarRegistro("historial_cambios_de_status", datos);
		// PRODUCTO - Actualizar si tiene links gratuitos
		if (creadoAprob) procesos.links_prodCampoLG_OK(prodEntidad, prodID);
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
