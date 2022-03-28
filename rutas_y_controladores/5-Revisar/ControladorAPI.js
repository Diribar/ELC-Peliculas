"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/BD/Genericas");
const BD_especificas = require("../../funciones/BD/Especificas");
const especificas = require("../../funciones/Varias/Especificas");

// *********** Controlador ***********
module.exports = {
	liberarSalir: async (req, res) => {
		let {entidad, id} = req.query;
		// Liberar y salir
		let datos = {captura_activa: 0};
		await BD_genericas.actualizarPorId(entidad, id, datos);
		return res.json();
	},

	aprobarAlta: async (req, res) => {
		let {entidad, id} = req.query;
		// Obtener el status que corresponde a "Alta-aprobada"
		let statusAltaAprob = await BD_genericas.obtenerPorCampo("status_registro_ent", "alta_aprob", 1).then(
			(n) => n.id
		);
		// Cambiar el status a 'Alta-aprobada'
		// Dejar la marca del usuario y fecha en que esto se realizó
		let datos = {
			status_registro_id: statusAltaAprob,
			alta_analizada_por_id: req.session.usuario.id,
			alta_analizada_en: especificas.ahora(),
		};
		await BD_genericas.actualizarPorId(entidad, id, datos);
		// Fin
		return res.json();
	},

	aprobarAvatar: async (req, res) => {
		// Variables
		let {entidad, id: prodID, edicion_id} = req.query;
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "status_registro");
		let prodEditado = await BD_genericas.obtenerPorId("productos_edic", edicion_id);
		let userID = req.session.usuario.id;
		// Si el avatar original es un archivo, eliminarlo
		let avatar = prodOriginal.avatar;
		if (avatar.slice(0, 4) != "http") {
			let ruta = prodOriginal.status_registro.alta_aprob
				? "/imagenes/3-ProdRevisar/"
				: "/imagenes/2-Productos/";
			especificas.borrarArchivo(ruta, avatar);
		}
		// Actualizar la BD_original con:
		// El nuevo avatar
		// Los datos de la edición (fecha,id)
		// Los datos de la revisión (fecha,id)
		let datos = {
			avatar: prodEditado.avatar,
			editado_por_id: prodEditado.editado_por_id,
			editado_en: prodEditado.editado_en,
			edic_analizada_por_id: userID,
			edic_analizada_en: especificas.ahora(),
		};
		await BD_genericas.actualizarPorId(entidad, prodID, datos);
		prodOriginal = {...prodOriginal, ...datos};
		// Mover el nuevo avatar a la carpeta definitiva
		especificas.moverImagenCarpetaDefinitiva(prodEditado.avatar, "3-ProdRevisar", "2-Productos");
		// Actualizar la BD_edicion quitándole el campo 'avatar'
		await BD_genericas.actualizarPorId("productos_edic", edicion_id, {avatar: null});
		return res.json();
	},

	rechazarAvatar: async (req, res) => {},

	inactivar: async (req, res) => {
		// Obtener las variables
		let {entidad, id, motivo_id} = req.query;
		// Averiguar el id del status
		let inactivar = await BD_genericas.obtenerPorCampo("status_registro_ent", "inactivar", true).then(
			(n) => n.id
		);
		let datos;
		// Actualizar el status en la entidad
		datos = {
			alta_analizada_en: especificas.ahora(),
			alta_analizada_por_id: req.session.usuario.id,
			status_registro_id: inactivar,
			captura_activa: 0,
		};
		BD_genericas.actualizarPorId(entidad, id, datos);
		let creado_por_id = await BD_genericas.obtenerPorId(entidad, id).then((n) => n.creado_por_id);
		// Agregar el registro de borrados
		datos = {
			elc_id: id,
			elc_entidad: entidad,
			usuario_implicado_id: creado_por_id,
			evaluado_por_usuario_id: req.session.usuario.id,
			motivo_id: motivo_id,
			duracion: 0,
			status_registro_id: inactivar,
		};
		BD_genericas.agregarRegistro("registros_borrados", datos);
		return res.json();
	},
};
