"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "";
	const entId = req.query.id;
	const userId = req.session.usuario.id;
	const registro = await baseDeDatos.obtienePorId(entidad, entId);
	const {baseUrl} = comp.reqBasePathUrl(req);
	const ahora = comp.fechaHora.ahora();
	const haceUnaHora = comp.fechaHora.nuevoHorario(-1, ahora);

	// Si está recién creado y se lo quiere usar en una vista distinta a 'revisión', no se captura
	if (registro.statusRegistro_id == creado_id && registro.creadoEn >= haceUnaHora && baseUrl != "/revision") return next(); // en status "creado" está reservado para el creador durante 1 hora, sin captura

	// Averigua si el usuario ya lo tiene capturado
	const haceDosHoras = comp.fechaHora.nuevoHorario(-2, ahora);
	const condicStd = {entidad, entidad_id: entId};
	const condicion = {...condicStd, capturadoPor_id: userId, capturadoEn: {[Op.gte]: haceDosHoras}}; // está capturado por el usuario desde hace menos de 2 horas
	const captura = await baseDeDatos.obtienePorCondicion("capturas", condicion);

	// Acciones si existe una captura
	const activa = true;
	if (captura) baseDeDatos.actualizaPorId("capturas", captura.id, {activa});
	// Acciones si no existe
	else {
		// Variables
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const capturadoPor_id = userId;
		const datos = {...condicStd, familia, capturadoPor_id};

		// Captura
		await baseDeDatos.agregaRegistro("capturas", datos);
	}

	// Fin
	return next();
};
