"use strict";
module.exports = (req, res, next) => {
	// Variables
	let usuario = req.session.usuario;
	let url = req.originalUrl;
	// Redirecciona si el usuario está sin login
	if (!usuario) return res.redirect("/usuarios/redireccionar");

	// Fin
	next();
};
