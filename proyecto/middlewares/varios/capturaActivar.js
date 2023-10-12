"use strict";

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "";
	const entID = req.query.id;
	const userID = req.session.usuario.id;
	const registro = await BD_genericas.obtienePorId(entidad, entID);
	const {baseUrl} = comp.reqBasePathUrl(req);
	// Variables - De tiempo
	let ahora = comp.fechaHora.ahora().setSeconds(0); // Descarta los segundos en el horario de captura
	const haceUnaHora = comp.fechaHora.nuevoHorario(-1, ahora);
	const haceDosHoras = comp.fechaHora.nuevoHorario(-2, ahora);
	let capturadoEn = registro.capturadoEn;
	capturadoEn ? capturadoEn.setSeconds(0) : (capturadoEn = 0);
	let horarioFinal = comp.fechaHora.nuevoHorario(1, capturadoEn);
	horarioFinal = comp.fechaHora.fechaHorario(horarioFinal);

	// Se debe capturar únicamente si se cumple alguna de estas 2 condiciones:
	if (
		(registro.statusRegistro_id != creado_id || registro.creadoEn < haceUnaHora || baseUrl == "/revision") && // el registro no está en status "creado" (en status "creado" está reservado para el creador durante 1 hora, sin captura), o ya pasó una hora, o se quiere acceder desde una vista de revisión
		(registro.capturadoPor_id != userID || registro.capturadoEn < haceDosHoras) // No está capturado por el usuario o lo está desde hace más de 2 horas
	) {
		const datos = {capturaActiva: true, capturadoPor_id: userID, capturadoEn: ahora};
		await BD_genericas.actualizaPorId(entidad, entID, datos);
	}

	// Continuar
	next();
};
