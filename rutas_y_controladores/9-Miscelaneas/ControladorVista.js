"use strict";

// *********** Controlador ***********
module.exports = {
	home: (req, res) => {
		let tema = "miscelaneas";
		let codigo = "inicio";
		return res.render("0-InicioEstructura", {
			tema,
			codigo,
			titulo: "Inicio",
		});
	},

	nosotros: (req, res) => {
		let tema = "miscelaneas";
		let codigo = "nosotros";
		return res.render("0-VistaEstandar", {
			tema,
			codigo,
			titulo: "Quiénes somos",
		});
	},

	session: (req, res) => {
		return res.send(req.session);
	},

	cookies: (req, res) => {
		return res.send(req.cookies);
	},
};
