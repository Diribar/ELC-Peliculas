"use strict";

module.exports = async (req, res, next) => {
	// Acciones si no se reconoce la url
	let informacion = {
		mensajes: [variables.urlDesconocida],
		iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
	};

	// Fin
	return res.status(404).render("CMP-0Estructura", {informacion});
};
