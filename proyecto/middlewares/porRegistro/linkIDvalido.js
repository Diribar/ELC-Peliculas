"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {link_id} = req.query;
	const urlSinParametros = variables.vistaEntendido(req.session.urlSinParametros);
	let informacion;

	// PROBLEMA 1: No existe el ID
	if (!link_id) informacion = {mensajes: ["Falta el dato del 'ID'"], iconos: [urlSinParametros]};

	// PROBLEMA 2: ID inválido
	const registro = await baseDeDatos.obtienePorId("links", link_id);
	if (!registro) informacion = {mensajes: ["No tenemos ese link"], iconos: [urlSinParametros]};

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
