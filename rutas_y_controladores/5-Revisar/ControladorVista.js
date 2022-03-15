// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/ValidarRCLV");
let BD_varias = require("../../funciones/BD/varias");
let procesar = require("../../funciones/Prod-RUD/1-Procesar");

// *********** Controlador ***********
module.exports = {
	home: (req, res) => {
		tema = "revision";
		codigo = "inicio";
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Inicio",
		});
	},

};
