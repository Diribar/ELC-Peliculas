"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/BD/Genericas");
const BD_especificas = require("../../funciones/BD/Especificas");
const especificas = require("../../funciones/Varias/Especificas");

// *********** Controlador ***********
module.exports = {
	// Todas las vistas de Revisar
	liberarSalir: async (req, res) => {
		let {entidad, id} = req.query;
		// Liberar y salir
		let datos = {captura_activa: 0};
		await BD_genericas.actualizarPorId(entidad, id, datos);
		return res.json();
	},

	// Revisar el alta
	aprobarAlta: async (req, res) => {
		let {entidad, id} = req.query;
		// Averiguar el id del status
		let statusAltaAprob = await BD_genericas.obtenerPorCampo(
			"status_registro_ent",
			"alta_aprob",
			true
		).then((n) => n.id);
		// Cambiar el status, dejar la marca del usuario y fecha en que esto se realizó
		let datos = {
			status_registro_id: statusAltaAprob,
			alta_analizada_por_id: req.session.usuario.id,
			alta_analizada_en: especificas.ahora(),
		};
		await BD_genericas.actualizarPorId(entidad, id, datos);
		// Fin
		return res.json();
	},
	rechazarAlta: async (req, res) => {
		// Obtener las variables
		let {entidad, id, motivo_id} = req.query;
		// Averiguar el id del status
		let statusInactivar = await BD_genericas.obtenerPorCampo(
			"status_registro_ent",
			"inactivar",
			true
		).then((n) => n.id);
		// Cambiar el status, dejar la marca del usuario y fecha en que esto se realizó
		let datos = {
			status_registro_id: statusInactivar,
			alta_analizada_por_id: req.session.usuario.id,
			alta_analizada_en: especificas.ahora(),
			captura_activa: 0,
		};
		BD_genericas.actualizarPorId(entidad, id, datos);
		let producto = await BD_genericas.obtenerPorId(entidad, id);
		// Agregar el registro de borrados
		datos = {
			elc_entidad: entidad,
			elc_id: id,
			campo: "alta-producto",
			motivo_id: motivo_id,
			duracion: 0, // porque todavía lo tiene que analizar un segundo revisor
			input_por_id: producto.creado_por_id,
			input_en: producto.creado_en,
			evaluado_por_id: producto.alta_analizada_por_id,
			evaluado_en: producto.alta_analizada_en,
		};
		BD_genericas.agregarRegistro("inputs_rech", datos);
		return res.json();
	},
	// Revisar el avatar
	aprobarAvatar: async (req, res) => {
		// Variables
		let {entidad, id: prodID, edicion_id} = req.query;
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "status_registro");
		let prodEditado = await BD_genericas.obtenerPorId("productos_edic", edicion_id);
		let userID = req.session.usuario.id;
		let datos;
		// Si el avatar original es un archivo, eliminarlo
		let avatar = prodOriginal.avatar;
		if (avatar.slice(0, 4) != "http") {
			let ruta = prodOriginal.status_registro.alta_aprob
				? "/imagenes/3-ProdRevisar/"
				: "/imagenes/2-Productos/";
			especificas.borrarArchivo(ruta, avatar);
		}
		// Actualizar la BD_original con:
		// 	- El nuevo avatar
		// 	- Los datos de la edición (fecha, usuario)
		// 	- Los datos de la revisión (fecha, usuario)
		datos = {
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
		// Actualizar la BD 'productos_edic' quitándole el campo 'avatar'
		await BD_genericas.actualizarPorId("productos_edic", edicion_id, {avatar: null});
		// Agregar un registro en la BD 'inputs_aprob'
		datos = {
			elc_entidad: entidad,
			elc_id: id,
			campo: "avatar",
			input_por_id: datos.editado_por_id,
			input_en: datos.editado_en,
			evaluado_por_id: datos.edic_analizada_por_id,
			evaluado_en: datos.edic_analizada_en,
		};
		await BD_genericas.agregarRegistro("inputs_aprob", datos);
		return res.json();
	},

	rechazarAvatar: async (req, res) => {
		// Variables
		let {entidad, id: prodID, edicion_id} = req.query;
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "status_registro");
		let prodEditado = await BD_genericas.obtenerPorId("productos_edic", edicion_id);
		let userID = req.session.usuario.id;
		let datos;
		// Eliminar el avatar editado
		especificas.borrarArchivo("/imagenes/3-ProdRevisar/", prodEditado.avatar);
		// Si el avatar original es un url, convertirlo a archivo en la 

		let avatar = prodOriginal.avatar;
		if (avatar.slice(0, 4) != "http") {
			let ruta = prodOriginal.status_registro.alta_aprob
				? "/imagenes/3-ProdRevisar/"
				: "/imagenes/2-Productos/";
			especificas.borrarArchivo(ruta, avatar);
		}

	},
};
