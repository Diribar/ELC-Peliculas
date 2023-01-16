"use strict";
// Definir variables
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	home: (req, res) => {
		res.redirect("./listado");
	},
	consultas: (req, res) => {
		console.log(10, req.path.replace("/", ""));
		// Va a la vista
		res.render("CMP-0Estructura", {
			tema: "consultas",
			titulo: "Consulta de Películas",
			layoutElegido: req.path.replace("/", ""),
			layouts: variables.layouts,
			orden: variables.opcionesOrden,
		});
	},
};
