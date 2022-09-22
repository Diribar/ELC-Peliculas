"use strict";
module.exports = (req, res, next) => {
	// Variables
	let usuario = req.session.usuario;
	let url = req.originalUrl;
	// Redirecciona si el usuario está:
	// 1. Sin login
	// 2. En status 'mail_a_validar' y en una ruta incorrecta
	// 3. En status 'mail_validado' y en una ruta incorrecta
	if (
		!url.startsWith("/usuarios/pre-logout") &&
		!url.startsWith("/usuarios/logout") &&
		((!usuario && !url.startsWith("/usuarios/login")) ||
			(usuario.status_registro.mail_a_validar && !url.startsWith("/usuarios/login")) ||
			(usuario.status_registro.mail_validado && !url.startsWith("/usuarios/datos-editables")))
	)
		return res.redirect("/usuarios/redireccionar");

	// Fin
	next();
};
