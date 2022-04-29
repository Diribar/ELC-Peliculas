"use strict";
// Requires
const especificas = require("../../funciones/4-Compartidas/Especificas");

module.exports = (req, res, next) => {
	if (!req.session.usuario) {
		return res.redirect("/usuarios/login");
	}
	next();
};