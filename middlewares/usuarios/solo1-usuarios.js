"use strict";
module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	// Redireccionar si el usuario no está logueado
	if (!usuario) return res.redirect("/usuarios/login");

	next();
};
