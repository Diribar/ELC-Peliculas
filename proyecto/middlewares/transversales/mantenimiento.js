"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Acciones si no se reconoce la url
	let informacion = {
		mensajes: [
			"Estamos trabajando en mejoras para nuestro sitio.",
			"Te pedimos disculpas por el inconveniente.",
			"Esperamos terminarlo en unos pocos minutos.",
		],
		iconos: [],
	};

	// Fin
	return res.status(404).render("CMP-0Estructura", {informacion});
};
