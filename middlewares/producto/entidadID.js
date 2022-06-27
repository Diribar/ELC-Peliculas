"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad;
	const prodID = req.query.id;
	let informacion;
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);

	// PROBLEMA 1: No existe el ID
	// Verificar los datos
	if (!prodID) informacion = {mensajes: ["Falta el dato del 'ID'"], iconos: [vistaAnterior]};
	// PROBLEMA 2: Registro no encontrado
	const registro = await BD_genericas.obtenerPorId(entidad, prodID);
	if (!registro) informacion = {mensajes: ["Registro no encontrado"], iconos: [vistaAnterior]};

	// Conclusiones
	if (informacion) return res.render("Errores", {informacion});
	else next();
};
