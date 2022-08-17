"use strict";
// ************ Requires ************
const funciones = require("../../funciones/3-Procesos/Compartidas");

// *********** Controlador ***********
module.exports = {
	// Vistas de vistas - Institucional
	home: (req, res) => {
		let tema = "miscelaneas";
		let codigo = "inicio";
		return res.render("IN0-Estructura", {
			tema,
			codigo,
			titulo: "Inicio",
		});
	},
	quienesSomos: (req, res) => {
		let tema = "miscelaneas";
		let codigo = "quienes-somos";
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Quiénes somos",
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
		let {destino, entidad, id} = req.query;
		// Si es 'tablero', ir a tablero
		if (destino == "tablero") destino = "/revision/tablero-de-control";
		if (destino == "prodDetalle") destino = "/producto/detalle/?entidad=" + entidad + "&id=" + id;
		if (!destino) destino = "/";
		// Redireccionar a la vista que corresponda
		return res.redirect(destino);
	},
};
