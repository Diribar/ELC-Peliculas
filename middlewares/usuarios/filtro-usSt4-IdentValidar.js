"use strict";
module.exports = (req, res, next) => {
	// Variables
	let usuario = req.session.usuario;
	// Redirecciona si el usuario está en alguna de esta situaciones:
	// - Sin login
	// - En un status distinto a 'ident_a_validar'
	
	// Fin
	if (!usuario || !usuario.status_registro.ident_a_validar)  res.redirect("/usuarios/garantiza-login-y-completo");
	else next();
};