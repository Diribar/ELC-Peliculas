"use strict";
module.exports = (req, res, next) => {
	// Variables
	let usuario = req.session.usuario;
	let url = req.originalUrl;

	// Redirecciona si el usuario está sin login o sin completar
	if (!usuario || !usuario.completado_en) return res.redirect("/usuarios/garantiza-login-y-completo");

	// Fin
	next();
};
