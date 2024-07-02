"use strict";

module.exports = async (req, res, next) => {
	// Acciones si no se reconoce la url
	let informacion = {
		mensajes: [variables.urlDesconocida],
		iconos: [variables.vistaAnterior(req.session.urlActual), variables.vistaInicio], // se usa actual porque no llegó a cambiar el session
	};
	console.log(9);

	// Fin
	return res.status(404).render("CMP-0Estructura", {informacion});
};
