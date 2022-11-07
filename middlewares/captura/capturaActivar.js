"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad
		? req.query.entidad
		: req.originalUrl.startsWith("/revision/usuarios")
		? "usuarios"
		: "";
	const prodID = req.query.id;
	const userID = req.session.usuario.id;
	const registro = await BD_genericas.obtienePorIdConInclude(entidad, prodID, "status_registro");
	const urlBase = req.baseUrl;
	// Variables - De tiempo
	let ahora = comp.ahora().setSeconds(0); // Descarta los segundos en el horario de captura
	const haceDosHoras = comp.nuevoHorario(-2, ahora);
	let capturado_en = registro.capturado_en;
	capturado_en ? capturado_en.setSeconds(0) : (capturado_en = 0);
	let horarioFinal = comp.nuevoHorario(1, capturado_en);
	horarioFinal = comp.fechaHorarioTexto(horarioFinal);

	// Se debe capturar únicamente si se cumple alguna de estas 2 condiciones:
	// 	1. El registro no está en status "creado" (en status "creado" está reservado para el creador durante 1 hora, sin captura)
	//	2. Se quiere acceder desde una vista de revisión
	if (!registro.status_registro.creado || urlBase == "/revision") {
		// Activa la entidad y el usuario
		let datos = {captura_activa: true, capturado_por_id: userID};
		// Fija la nueva hora de captura si corresponde
		if (registro.capturado_por_id != userID || registro.capturado_en < haceDosHoras)
			datos.capturado_en = ahora;
		// CAPTURA DEL REGISTRO
		await BD_genericas.actualizaPorId(entidad, prodID, datos);
	}

	// Continuar
	next();
};
