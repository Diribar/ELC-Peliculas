"use strict";
module.exports = (req, res, next) => {
	// Redireccionar si el usuario no está logueado
	if (!req.session.usuario) return res.redirect("/usuarios/login");

	next();
};
