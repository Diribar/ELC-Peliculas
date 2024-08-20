"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {comentario} = req.body;
	let informacion;

	// Problemas
	if (!comentario)
		informacion = {
			mensajes: ["Necesitamos que nos des un comentario"],
			iconos: [variables.vistaEntendido(req.session.urlAnterior)],
		};

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
