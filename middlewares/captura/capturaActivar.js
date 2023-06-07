"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad
		? req.query.entidad
		: req.originalUrl.startsWith("/revision/usuarios")
		? "usuarios"
		: "";
	const prodID = req.query.id;
	const userID = req.session.usuario.id;
	const registro = await BD_genericas.obtienePorIdConInclude(entidad, prodID, "statusRegistro");
	const urlBase = req.baseUrl;
	// Variables - De tiempo
	let ahora = comp.fechaHora.ahora().setSeconds(0); // Descarta los segundos en el horario de captura
	const haceDosHoras = comp.fechaHora.nuevoHorario(-2, ahora);
	let capturadoEn = registro.capturadoEn;
	capturadoEn ? capturadoEn.setSeconds(0) : (capturadoEn = 0);
	let horarioFinal = comp.fechaHora.nuevoHorario(1, capturadoEn);
	horarioFinal = comp.fechaHora.fechaHorario(horarioFinal);

	// Se debe capturar únicamente si se cumple alguna de estas 2 condiciones:
	// 	1. El registro no está en status "creado" (en status "creado" está reservado para el creador durante 1 hora, sin captura)
	//	2. Se quiere acceder desde una vista de revisión
	if (!registro.statusRegistro.creado || urlBase == "/revision") {
		// Activa la entidad y el usuario
		let datos = {capturaActiva: true, capturadoPor_id: userID};
		// Fija la nueva hora de captura si corresponde
		if (registro.capturadoPor_id != userID || registro.capturadoEn < haceDosHoras)
			datos.capturadoEn = ahora;
		// CAPTURA DEL REGISTRO
		await BD_genericas.actualizaPorId(entidad, prodID, datos);
	}

	// Continuar
	next();
};
