"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad;
	const prodID = req.query.id;
	const userID = req.session.usuario.id;
	const ahora = funciones.ahora();
	const haceDosHoras = funciones.haceDosHoras();
	// Variables - Registro
	const registro = await BD_genericas.obtenerPorId(entidad, prodID);

	// Captura
	// SOLUCIÓN 1: activa la entidad si no lo está, de lo contrario no hace nada
	if (
		!registro.capturado_en ||
		!registro.captura_activa ||
		registro.capturado_por_id != userID ||
		registro.capturado_en < haceDosHoras
	) {
		let datos = {captura_activa: true};
		// SOLUCIÓN 2: cambia de usuario si estaba capturado por otro
		if (registro.capturado_por_id != userID) datos.capturado_por_id = userID;
		// SOLUCIÓN 3: fija la nueva hora de captura si corresponde
		if (registro.capturado_por_id != userID || registro.capturado_en < haceDosHoras)
			datos.capturado_en = ahora;
		// CAPTURA DEL REGISTRO
		await BD_genericas.actualizarPorId(entidad, prodID, datos);
	}

	// Continuar
	next();
};
