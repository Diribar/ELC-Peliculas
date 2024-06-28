"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const usuario_id = req.session.usuario ? req.session.usuario.id : null;
	if (!usuario_id) return next();

	// Otras variables
	const {entidad, id: entidad_id} = req.query;
	const condicion = {usuario_id, entidad, entidad_id};

	// Elimina el registro que tenga el usuario para el producto
	baseDeDatos.eliminaTodosPorCondicion("misConsultas", condicion).then(() =>
		// Agrega un registro del usuario para el producto
		baseDeDatos.agregaRegistro("misConsultas", condicion)
	);

	// Fin
	next();
};
