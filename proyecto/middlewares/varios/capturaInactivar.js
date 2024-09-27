"use strict";

module.exports = async (req, res, next) => {
	if (!req.session.usuario) return next();

	// Variables - Generales
	const {entidad, id} = req.params;
	const capturadoPor_id = req.session.usuario.id;

	// Inactiva el registro
	const condicion = {entidad, entidad_id: id, capturadoPor_id};
	await baseDeDatos.actualizaPorCondicion("capturas", condicion, {activa: false});

	// Fin
	return next();
};
