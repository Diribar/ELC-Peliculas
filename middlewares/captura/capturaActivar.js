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
	let ahora = funciones.ahora().setSeconds(0); // Descarta los segundos en el horario de captura
	const haceDosHoras = funciones.nuevoHorario(-2, ahora);
	let capturado_en = registro.capturado_en;
	capturado_en ? capturado_en.setSeconds(0) : (capturado_en = 0);
	let horarioFinal = funciones.nuevoHorario(1, capturado_en);
	horarioFinal = funciones.horarioTexto(horarioFinal);

	// No se debe capturar si se cumplen estas 2 condiciones:
	// 	1. El registro está en status "creado"
	//	2. Se quiere acceder desde una vista que no es de revisión (ej: Detalle)
	if (!registro.status_registro.creado|| urlBase == "/revision") {
		// Activa la entidad y el usuario
		let datos = {captura_activa: true, capturado_por_id: userID};
		// Fija la nueva hora de captura si corresponde
		if (registro.capturado_por_id != userID || registro.capturado_en < haceDosHoras)
			datos.capturado_en = ahora;
		// CAPTURA DEL REGISTRO
		await BD_genericas.actualizarPorId(entidad, prodID, datos);
	}

	// Continuar
	next();
};
