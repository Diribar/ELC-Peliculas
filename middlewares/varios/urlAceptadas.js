"use strict";
// Requires
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	let layoutElegido = req.path.replace("/", "");

	// Acciones si la opción elegida no existe
	if (!variables.layouts.find((n) => n.url == layoutElegido)) {
		let informacion = {
			mensajes: ["No tenemos esa dirección de url en nuestro si"],
			iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
		};
		return res.render("CMP-0Estructura", {informacion});
	}

	// Continuar
	next();
};
