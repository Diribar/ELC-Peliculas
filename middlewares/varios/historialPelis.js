"use strict";
// Requires
const BD_genericas = require("../../funciones/1-BD/Genericas");

module.exports = async (req, res, next) => {
	// Variables
	const usuario_id = req.session.usuario ? req.session.usuario.id : null;
	const entidad = req.query.entidad;
	const entidad_id = req.query.id;
	const condicion = {usuario_id, entidad, entidad_id};

	// Si el usuario no está logueado, interrumpe la función
	if (!usuario_id) return next();

	// Elimina el registro que tenga el usuario para el producto
	BD_genericas.eliminaTodosPorCondicion("historialPelis", condicion).then(() =>
		BD_genericas.agregaRegistro("historialPelis", condicion)
	);

	// Agrega un registro del usuario para el producto

	// Fin
	next();
};
