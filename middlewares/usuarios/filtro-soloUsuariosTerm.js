"use strict";
module.exports = (req, res, next) => {
	// Variables
	let usuario = req.session.usuario;
	let url = req.originalUrl;
	// Redirecciona si el usuario está:
	// 1. Sin login
	// 2. En status 'mail_a_validar'
	// 3. En status 'mail_validado' y en una ruta incorrecta
	if (!usuario || usuario.status_registro.mail_a_validar || usuario.status_registro.mail_validado)
		return res.redirect("/usuarios/redireccionar");

	// Fin
	next();
};
