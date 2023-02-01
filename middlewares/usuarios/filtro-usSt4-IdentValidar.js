"use strict";
module.exports = (req, res, next) => {
	// Variables
	let usuario = req.session.usuario;
	// Redirecciona si el usuario está en alguna de esta situaciones:
	// - Sin login
	// - En un status distinto a 'ident_a_validar'
	if (!usuario || !usuario.status_registro.ident_a_validar) return res.redirect("/usuarios/garantiza-login-y-completo");

	// Fin
	next();
};