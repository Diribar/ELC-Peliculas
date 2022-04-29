"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");

module.exports = (req, res, next) => {
	if (!req.session.usuario) {
		return res.redirect("/usuarios/login");
	}
	next();
};