"use strict";
// Requires
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Acciones si no se reconoce la url
	let informacion = {
		mensajes: [variables.urlDesconocida],
		iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
	};
	res.status(404).render("CMP-0Estructura", {informacion});

	// Continuar
	next();
};
