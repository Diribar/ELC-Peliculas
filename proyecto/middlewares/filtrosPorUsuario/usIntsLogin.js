"use strict";
module.exports = (req, res, next) => {
	// Variables
	let login, usuario;

	// Reenvíos por cookies
	if (req.cookies && req.cookies.intsLogin > 2) return res.redirect("/usuario/login/suspendido");

	// Reenvíos x BD
	if (req.cookies && req.cookies.login) login = req.cookies.login;
	if (login && login.usuario) usuario = login.usuario;
	if (usuario && usuario.intsLogin && usuario.intsLogin > 3) return res.redirect("/usuario/login/suspendido");

	// Fin
	next();
};
