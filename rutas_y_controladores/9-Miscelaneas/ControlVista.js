"use strict";
const variables = require("../../funciones/3-Procesos/Variables");

// *********** Controlador ***********
module.exports = {
	// Vistas de vistas - Institucional
	home: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			codigo: "inicio",
			titulo: "Inicio",
			opciones: variables.opcionesInicio,
		});
	},
	quienesSomos: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			codigo: "quienes-somos",
			titulo: "Quiénes somos",
		});
	},
	copyright: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			codigo: "copyright",
			titulo: "Nuestra Política sobre DA",
		});
	},
	perfilProductos: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			codigo: "perfil-productos",
			titulo: "Perfil de Películas",
		});
	},

	// Session y Cookies
	session: (req, res) => {
		return res.send(req.session);
	},
	cookies: (req, res) => {
		return res.send(req.cookies);
	},

	// Miscelaneas
	redireccionar: async (req, res) => {
		// Variables
		let {origen, prodEntidad, prodID, entidad, id} = req.query;
		// Si es 'tablero', ir a tablero
		if (origen == "DP") origen = "/producto/agregar/datos-personalizados";
		if (origen == "ED") origen = "/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID;
		if (origen == "DT_RCLV") origen = "/rclv/detalle/?entidad=" + entidad + "&id=" + id;
		if (origen == "tableroUs") origen = "/revision/usuarios/tablero-de-control";
		if (origen == "tableroEnts") origen = "/revision/tablero-de-control";
		if (!origen) origen = "/";
		// Redireccionar a la vista que corresponda
		return res.redirect(origen);
		// Ya no se usa...
		// if (origen == "DTP") origen = "/producto/detalle/?entidad=" + prodEntidad + "&id=" + prodID;
	},
};
