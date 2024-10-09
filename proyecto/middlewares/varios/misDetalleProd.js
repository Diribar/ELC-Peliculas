"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const usuario_id = req.session.usuario ? req.session.usuario.id : null;
	if (!usuario_id) return next();

	// Otras variables
	const entidad = comp.obtieneEntidadDesdeUrl(req);
	const {id: entidad_id} = req.query;
	const condicion = {usuario_id, entidad, entidad_id};

	// Agrega el registro
	baseDeDatos
		.eliminaPorCondicion("misConsultas", condicion) // Elimina el registro que tenga el usuario para el producto
		.then(() => baseDeDatos.agregaRegistro("misConsultas", condicion)); // Agrega un registro del usuario para el producto

	// Fin
	return next();
};
