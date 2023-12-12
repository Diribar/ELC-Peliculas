"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const usuario_id = req.session.usuario ? req.session.usuario.id : null;
	if (!usuario_id) return next();

	// Otras variables
	const entidad = req.query.entidad;
	const entidad_id = req.query.id;
	const condicion = {usuario_id, entidad, entidad_id};

	// Elimina el registro que tenga el usuario para el producto
	BD_genericas.eliminaTodosPorCondicion("misConsultas", condicion).then(() =>
		// Agrega un registro del usuario para el producto
		BD_genericas.agregaRegistro("misConsultas", condicion)
	);

	// Fin
	next();
};
