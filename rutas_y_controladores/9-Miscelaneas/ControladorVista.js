"use strict";
// ************ Requires ************
const funciones = require("../../funciones/3-Procesos/Compartidas");

// *********** Controlador ***********
module.exports = {
	// Vistas de vistas - Institucional
	home: (req, res) => {
		let tema = "miscelaneas";
		let codigo = "inicio";
		return res.render("0-InicioEstructura", {
			tema,
			codigo,
			titulo: "Inicio",
		});
	},
	quienesSomos: (req, res) => {
		let tema = "miscelaneas";
		let codigo = "quienes-somos";
		return res.render("0-Estructura-Gral", {
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
		let {destino} = req.query;
		// Si es 'tablero', ir a tablero
		if (destino == "tablero") destino = "/revision/tablero-de-control";
		else destino = "/";
		// Redireccionar a la vista que corresponda
		return res.redirect(destino);
	},
};
