"use strict";

module.exports = async (req, res, next) => {
	// Acciones si no se reconoce la url
	let informacion = {
		mensajes: [variables.urlDesconocida],
		iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio], // se usa actual porque no llegó a cambiar el session
	};

	// Fin
	return res.status(404).render("CMP-0Estructura", {informacion});
};
