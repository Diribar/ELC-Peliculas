"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	let informacion;
	let respuesta = {
		mensajes: ["No tenemos esa dirección de url en nuestro sitio"],
		iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
	};
	// Averigua si hay un error de opción
	if (!informacion) {
		var opcion = menuOpciones.find((n) => n.url == req.params.codigo);
		if (!opcion) informacion = respuesta;
	}
	// Averigua la subopción
	if (!informacion) {
		let seEligioUnaSubOpcion = "/" + opcion.url != req.path;
		let subOpcion = seEligioUnaSubOpcion
			? menusSubOpciones[opcion.url].find((n) => n.url == req.params.subOpcion)
			: true;
		if (!subOpcion) informacion = respuesta;
	}
	// Validar que la url sea de alguna opción o sub-opción válida
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Continuar
	next();
};
