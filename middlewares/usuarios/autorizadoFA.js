"use strict";
// Requires
const BD_especificas = require("../../funciones/BD/Especificas");

module.exports = (req, res, next) => {
	if (!BD_especificas.obtenerAutorizadoFA(req.session.usuario.id)) {
		return res.redirect("/producto/agregar/palabras-clave");
	}
	next();
};
