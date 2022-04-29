"use strict";
// Requires
const funciones = require("../../funciones/4-Compartidas/Funciones");

module.exports = (req, res, next) => {
	if (!req.session.usuario) {
		return res.redirect("/usuarios/login");
	}
	next();
};