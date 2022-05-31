"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");

module.exports = (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad;
	const prodID = req.query.id;
	const userID = req.session.usuario.id;

	// Funciones --------------------------------------------------------
	funciones.inactivarCaptura(entidad, prodID, userID);

	// Fin
	next();
};
