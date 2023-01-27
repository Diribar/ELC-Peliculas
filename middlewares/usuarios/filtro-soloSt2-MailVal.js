"use strict";
module.exports = (req, res, next) => {
	// Variables
	let usuario = req.session.usuario;
	// Redirecciona si el usuario está en alguna de esta situaciones:
	// - Sin login
	// - En un status distinto a 'mail_validado'
	if (!usuario || !usuario.status_registro.mail_validado) return res.redirect("/usuarios/redireccionar");

	// Fin
	next();
};
