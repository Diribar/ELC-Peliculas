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
		return res.render("0-VistaEstandar", {
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
	inactivar: async (req, res) => {
		// Variables
		let {entidad, id: prodID, url} = req.query;
		let userID = req.session.usuario.id;
		// Inactivar
		await funciones.inactivarCaptura(entidad, prodID, userID);
		// Redireccionar a la vista anterior
		return res.redirect(url);
	},
};
