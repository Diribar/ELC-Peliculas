"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const link_id = req.query.link_id;
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	let informacion;

	// PROBLEMA 1: No existe el ID
	if (!link_id) informacion = {mensajes: ["Falta el dato del 'ID'"], iconos: [vistaAnterior]};

	// PROBLEMA 2: ID inválido
	const registro = await BD_genericas.obtienePorId("links", link_id);
	if (!registro) informacion = {mensajes: ["No tenemos ese link"], iconos: [vistaAnterior]};

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
