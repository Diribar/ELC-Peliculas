"use strict";
const variables = require("../../funciones/1-Procesos/Variables");

// *********** Controlador ***********
module.exports = {
	institucional: (req, res) => {
		// Variables
		const url = req.path.slice(1)
		const vars = variables.opcsInstitucional[url];

		// Fin
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			...vars,
		});
	},
};
