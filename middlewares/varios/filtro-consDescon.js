"use strict";
// Requires
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	let layoutElegido = req.path.replace("/", "");

	// Acciones si no se reconoce la consulta elegida
	if (!variables.layouts.find((n) => n.url == layoutElegido)) {
		let informacion = {
			mensajes: [variables.urlDesconocida],
			iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
		};
		return res.render("CMP-0Estructura", {informacion});
	}

	// Continuar
	next();
};
