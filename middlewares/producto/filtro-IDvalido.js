"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad
		? req.query.entidad
		: req.originalUrl.startsWith("/revision/usuarios")
		? "usuarios"
		: "";
	const id = req.query.id;
	let informacion;
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);

	// PROBLEMA 1: No existe el ID
	// Verificar los datos
	if (!id) informacion = {mensajes: ["Falta el dato del 'ID'"], iconos: [vistaAnterior]};

	// PROBLEMA 2: ID inválido
	const registro = await BD_genericas.obtienePorId(entidad, id);
	if (!registro) informacion = {mensajes: ["Registro no encontrado"], iconos: [vistaAnterior]};

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
