"use strict";

// *********** Controlador ***********
module.exports = {
	home: (req, res) => {
		let tema = "miscelaneas";
		let codigo = "inicio";
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Inicio",
		});
	},

	nosotros: (req, res) => {
		let tema = "miscelaneas";
		let codigo = "nosotros";
		return res.render("Home", {
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
