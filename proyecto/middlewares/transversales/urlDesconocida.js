"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Acciones si no se reconoce la url
	const informacion = {
		mensajes: ["No tenemos esa dirección en nuestro sistema"],
		iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
	};

	// Fin
	return res.status(404).render("CMP-0Estructura", {informacion});
};
