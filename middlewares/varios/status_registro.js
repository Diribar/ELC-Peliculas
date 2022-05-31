"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");

module.exports = async(req, res, next) => {
	if (!req.session.status_registro) req.session.status_registro = await BD_genericas.obtenerTodos("status_registro","orden")

	// Continuar
	next();
};
