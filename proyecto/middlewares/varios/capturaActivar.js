"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "";
	const entId = req.query.id;
	const userID = req.session.usuario.id;
	const registro = await baseDeDatos.obtienePorId(entidad, entId);
	const {baseUrl} = comp.reqBasePathUrl(req);
	const ahora = comp.fechaHora.ahora().setSeconds(0); // Descarta los segundos en el horario de captura
	const haceUnaHora = comp.fechaHora.nuevoHorario(-1, ahora);

	// Si está recién creado y se lo quiere usar en una vista distinta a 'revisión', no se captura
	if (registro.statusRegistro_id == creado_id && registro.creadoEn >= haceUnaHora && baseUrl != "/revision") next(); // en status "creado" está reservado para el creador durante 1 hora, sin captura

	// Averigua si el usuario ya lo tiene capturado
	const haceDosHoras = comp.fechaHora.nuevoHorario(-2, ahora);
	const condicStd = {entidad, entidad_id: entId};
	const condicion = {...condicStd, capturadoPor_id: userID, capturadoEn: {[Op.gte]: haceDosHoras}}; // está capturado por el usuario desde hace menos de 2 horas
	const captura = await baseDeDatos.obtienePorCondicion("capturas", condicion);

	// Acciones si no lo tiene capturado
	if (!captura) {
		// Variables
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const capturadoPor_id = userID;
		const capturadoEn = ahora;
		const activa = true;
		const datos = {...condicStd, familia, capturadoPor_id, capturadoEn, activa};

		// Captura
		await baseDeDatos.agregaRegistro("capturas", datos);
	}

	// Fin
	next();
};
