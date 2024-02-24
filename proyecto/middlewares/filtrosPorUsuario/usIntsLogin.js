"use strict";
module.exports = (req, res, next) => {
	// Reenvíos por cookies
	if (req.cookies && req.cookies.intsLogin > intsLogins_PC) return res.redirect("/usuario/login/suspendido");

	// Reenvíos x BD
	let login, usuario;
	if (req.cookies && req.cookies.login) login = req.cookies.login;
	if (login && login.usuario) usuario = login.usuario;
	if (usuario && usuario.intsLogin > instLogins_BD) return res.redirect("/usuario/login/suspendido");

	// Fin
	next();
};
