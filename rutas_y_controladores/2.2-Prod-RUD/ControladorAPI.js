"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const procesar = require("../../funciones/3-Procesos/3-RUD");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const validar = require("../../funciones/4-Validaciones/RUD");

// *********** Controlador ***********
module.exports = {
	// Detalle
	obtenerCalificaciones: async (req, res) => {
		let {entidad, id: prodID, detalle} = req.query;
		let userID = req.session.usuario.id;
		let datos;
		let calificaciones = [];
		// Datos generales
		datos = await BD_genericas.obtenerPorId(entidad, prodID).then((n) =>
			n.fe_valores != null
				? [n.fe_valores / 100, n.entretiene / 100, n.calidad_tecnica / 100, n.calificacion / 100]
				: ""
		);
		if (datos) {
			let calificacionGral = {encabezado: "Gral.", valores: datos};
			calificaciones.push(calificacionGral);
		}
		// Datos particulares
		if (detalle) {
			let producto_id = funciones.obtenerEntidad_id(entidad);
			datos = await BD_genericas.obtenerPorCampos("cal_registros", {
				usuario_id: userID,
				[producto_id]: prodID,
			}).then((n) =>
				n
					? [n.fe_valores / 100, n.entretiene / 100, n.calidad_tecnica / 100, n.calificacion / 100]
					: ""
			);
			if (datos) {
				let calificacionUsuario = {encabezado: "Tuya", valores: datos};
				calificaciones.push(calificacionUsuario);
			}
		}
		return res.json(calificaciones);
	},

	// Edición del Producto
	validarEdicion: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		// Averigua los errores solamente para esos campos
		let errores = await validar.edicion(campos, req.query);
		// Devuelve el resultado
		return res.json(errores);
	},
	obtenerVersionesDelProducto: async (req, res) => {
		let {entidad, id: prodID} = req.query;
		let userID = req.session.usuario.id;
		// Obtener los datos ORIGINALES y EDITADOS del producto
		let [prodOriginal, prodEditado] = await procesar.obtenerVersionesDelProducto(entidad, prodID, userID);
		// Enviar los datos
		return res.json([prodOriginal, prodEditado]);
	},
	enviarAReqSession: async (req, res) => {
		if (req.query.avatar) delete req.query.avatar;
		req.session.edicion = req.query;
		return res.json();
	},
	obtenerDeReqSession: async (req, res) => {
		let {entidad, id: prodID} = req.query;
		let prodSession =
			req.session.edicion && req.session.edicion.entidad == entidad && req.session.edicion.id == prodID
				? req.session.edicion
				: "";
		return res.json(prodSession);
	},
};
