"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const valida = require("./PR-FN-Validar");

// *********** Controlador ***********
module.exports = {
	// Detalle
	obtieneCalificaciones: async (req, res) => {
		let {entidad, id: prodID, detalle} = req.query;
		let userID = req.session.usuario ? req.session.usuario.id : "";
		let datos;
		let calificaciones = [];
		// Datos generales
		datos = await BD_genericas.obtienePorId(entidad, prodID).then((n) =>
			n.fe_valores != null &&
			n.entretiene != null &&
			n.calidad_tecnica != null &&
			n.calificacion != null
				? [n.fe_valores / 100, n.entretiene / 100, n.calidad_tecnica / 100, n.calificacion / 100]
				: ""
		);
		if (datos) {
			let calificacionGral = {encabezado: "Gral.", valores: datos};
			calificaciones.push(calificacionGral);
		}
		// Datos particulares
		if (detalle) {
			let producto_id = comp.obtieneEntidad_idDesdeEntidad(entidad);
			datos = await BD_genericas.obtienePorCampos("cal_registros", {
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
	validaEdicion: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		// Averigua los errores solamente para esos campos
		let errores = await valida.consolidado(campos, req.query);
		// Devuelve el resultado
		return res.json(errores);
	},
	obtieneVersionesProd: async (req, res) => {
		let {entidad: producto, id: prodID} = req.query;
		let userID = req.session.usuario.id;
		// Obtiene los datos ORIGINALES y EDITADOS del producto
		let [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion(producto, prodID, userID);
		// Enviar los datos
		return res.json([prodOrig, prodEdic]);
	},
	eliminaEdicG: async (req, res) => {
		// Obtiene los datos identificatorios del producto
		let producto = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;

		// Obtiene los datos ORIGINALES y EDITADOS del producto
		let [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion(producto, prodID, userID);
		// No se puede eliminar la edición de un producto con status "gr_creado" y fue creado por el usuario
		let condicion = !prodOrig.status_registro.gr_creado || prodOrig.creado_por_id != userID;

		if (condicion && prodEdic) {
			if (prodEdic.avatar)
				comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/", prodEdic.avatar);
			BD_genericas.eliminaPorId("prods_edicion", prodEdic.id);
		}
		// Terminar
		return res.json();
	},
	enviarAReqSession: async (req, res) => {
		if (req.query.avatar) delete req.query.avatar;
		req.session.edicProd = req.query;
		res.cookie("edicProd", req.query, {maxAge: unDia});
		return res.json();
	},
};
