"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad;
	const prodID = req.query.id;
	const userID = req.session.usuario.id;
	const registro = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "status_registro");
	const urlBase = req.baseUrl;
	// Variables - De tiempo
	const ahora = funciones.ahora();
	const haceDosHoras = funciones.nuevoHorario(-2, ahora);
	let capturado_en = registro.capturado_en;
	capturado_en ? capturado_en.setSeconds(0) : (capturado_en = 0);
	let horarioFinal = funciones.nuevoHorario(1, capturado_en);
	horarioFinal = funciones.horarioTexto(horarioFinal);

	// Captura
	// SOLUCIÓN 1: activa la entidad si no lo está, de lo contrario no hace nada
	if (
		(!registro.capturado_en ||
			!registro.captura_activa ||
			registro.capturado_por_id != userID ||
			registro.capturado_en < haceDosHoras) &&
		(!registro.status_registro.gr_pend_aprob || urlBase != "/producto_rud")
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
