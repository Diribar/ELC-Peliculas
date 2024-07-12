"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "";
	const id = req.query.id;
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaEntendido = variables.vistaEntendido(req.session.urlSinEntidadId);
	let informacion;

	// PROBLEMA 1: No existe el ID
	if (!id) informacion = {mensajes: ["Falta el dato del 'ID'"], iconos: [vistaAnterior]};

	// PROBLEMA 2: ID inválido
	const registro = await baseDeDatos.obtienePorId(entidad, id);
	if (!registro) informacion = {mensajes: ["Registro no encontrado"], iconos: [vistaEntendido]};

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
