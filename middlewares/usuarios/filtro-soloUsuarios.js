"use strict";
module.exports = (req, res, next) => {
	// Variables
	let usuario = req.session.usuario;
	// Redirecciona si el usuario está sin login
	if (!usuario) return res.redirect("/usuarios/garantiza-login-y-completo");

	// Fin
	next();
};
