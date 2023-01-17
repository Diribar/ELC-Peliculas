"use strict";
// Definir variables
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	consultasSinLayout: (req, res) => {
		delete req.session.opcionesElegidas;
		res.redirect("./listado");
	},
	consultasConLayout: (req, res) => {
		// Variables
		let layoutElegido = req.path.replace("/", "");
		if (!req.session.opcionesElegidas) req.session.opcionesElegidas = {};
		req.session.opcionesElegidas.layout = layoutElegido;
		let opcionesElegidas = req.session.opcionesElegidas;
		let ordenElegido = opcionesElegidas ? opcionesElegidas.orden : "";

		// Va a la vista
		res.render("CMP-0Estructura", {
			tema: "consultas",
			titulo: "Consulta de Películas",
			// Elecciones
			layoutElegido,
			opcionesElegidas,
			ordenElegido,
			// Bases de datos
			layouts: variables.layouts,
			opcionesOrden: variables.opcionesOrden,
		});
	},
};
