"use strict";
module.exports = (req, res, next) => {
	// Variables
	let login, usuario;

	// Reenvíos por cookies
	if (req.cookies && req.cookies.intsDatosPer > 2) return res.redirect("/olvido-contrasena/suspendido");

	// Reenvíos x BD
	if (req.session && req.session.login) login = req.session.login;
	if (login && login.usuario) usuario = login.usuario;
	if (usuario && usuario.intsDatosPer > 3) return res.redirect("/olvido-contrasena/suspendido");

	// Fin
	next();
};
