"use strict";
module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	// Redireccionar si el usuario no está logueado o no completó la validación de mail
	if (!usuario || usuario.status_registro.mail_a_validar) return res.redirect("/usuarios/login");
	// Rutinas si el usuario no completó su alta
	let url = req.originalUrl;
	if (
		(url.startsWith("/usuarios/login") &&usuario.status_registro.mail_validado) ||
		(url.startsWith("/usuarios/datos-editables") && usuario.status_registro.editables) ||
		(url.startsWith("/usuarios/documento") && usuario.status_registro.ident_a_validar)
	)
		return res.redirect("/usuarios/redireccionar");

	// Fin
	next();
};
