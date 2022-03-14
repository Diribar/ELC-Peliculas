// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/ValidarRCLV");
let BD_varias = require("../../funciones/BD/varias");
let procesar = require("../../funciones/Prod-RUD/1-Procesar");

// *********** Controlador ***********
module.exports = {
	home: (req, res) => {
		tema = "miscelaneas";
		codigo = "inicio";
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Inicio",
		});
	},

	nosotros: (req, res) => {
		tema = "miscelaneas";
		codigo = "nosotros";
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
