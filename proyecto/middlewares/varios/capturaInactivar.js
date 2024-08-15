"use strict";

module.exports = async (req, res, next) => {
	if (!req.session.usuario) next();

	// Variables - Generales
	const capturadoPor_id = req.session.usuario.id;
	const entidad = req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "";
	const id = req.query.id;

	// Inactiva el registro
	const condicion = {entidad, entidad_id: id, capturadoPor_id};
	await baseDeDatos.actualizaTodosPorCondicion("capturas", condicion, {activa: false});

	// Fin
	next();
};
