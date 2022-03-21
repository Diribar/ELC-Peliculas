"use strict";
let BD_especificas = require("../../funciones/BD/especificas");

module.exports = (req, res, next) => {
	if (!BD_especificas.obtenerAutorizadoFA(req.session.usuario.id)) {
		return res.redirect("/producto/agregar/palabras-clave");
	}
	next();
};
