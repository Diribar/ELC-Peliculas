"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
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
			n.feValores != null && n.entretiene != null && n.calidadTecnica != null && n.calificacion != null
				? [n.feValores / 100, n.entretiene / 100, n.calidadTecnica / 100, n.calificacion / 100]
				: ""
		);
		if (datos) {
			let calificacionGral = {encabezado: "Gral.", valores: datos};
			calificaciones.push(calificacionGral);
		}
		// Datos particulares
		if (detalle) {
			let campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			datos = await BD_genericas.obtienePorCondicion("cal_registros", {
				usuario_id: userID,
				[campo_id]: prodID,
			}).then((n) => (n ? [n.feValores / 100, n.entretiene / 100, n.calidadTecnica / 100, n.calificacion / 100] : ""));
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
		req.query.epoca = req.session.usuario.rolUsuario.revisorEnts;
		req.query.publico = req.session.usuario.rolUsuario.revisorEnts;
		let errores = await valida.consolidado({campos, datos: req.query});

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
	eliminaEdicN: async (req, res) => {
		// Elimina Session y Cookies
		if (req.session.edicProd) delete req.session.edicProd;
		if (req.cookies.edicProd) res.clearCookie("edicProd");

		// Terminar
		return res.json();
	},
	eliminaEdicG: async (req, res) => {
		// Obtiene los datos identificatorios del producto
		let producto = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;

		// Obtiene los datos ORIGINALES y EDITADOS del producto
		let [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion(producto, prodID, userID);
		// No se puede eliminar la edición de un producto con status "gr_creado" y fue creado por el usuario
		let condicion = !prodOrig.statusRegistro.gr_creado || prodOrig.creadoPor_id != userID;

		if (condicion && prodEdic) {
			if (prodEdic.avatar) comp.gestionArchivos.elimina("./publico/imagenes/2-Productos/Revisar/", prodEdic.avatar);
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
