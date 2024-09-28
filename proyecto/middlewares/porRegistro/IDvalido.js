"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {id} = req.params;
	const entidad = req.params.entidad ? req.params.entidad : req.baseUrl.slice(1);
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaEntendido = variables.vistaEntendido(req.session.urlSinParametros);
	let informacion;

	// PROBLEMA 1: No existe el ID
	if (!id) informacion = {mensajes: ["Falta el dato del 'ID'"], iconos: [vistaAnterior]};

	// PROBLEMA 2: ID inválido
	if (!informacion) {
		const registro = await baseDeDatos.obtienePorId(entidad, id);
		if (!registro) informacion = {mensajes: ["Registro no encontrado"], iconos: [vistaEntendido]};
	}

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
