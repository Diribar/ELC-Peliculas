"use strict";
module.exports = (req, res, next) => {
	// Reenvíos por cookies
	if (req.cookies && req.cookies.intentosLogin > intentosCookies) return res.redirect("/usuarios/login/suspendido");

	// Reenvíos x BD
	let login, usuario;
	if (req.session && req.session.login) login = req.session.login;
	if (login && login.usuario) usuario = login.usuario;
	if (usuario && usuario.intentosLogin > intentos_BD) return res.redirect("/usuarios/login/suspendido");

	// Fin
	next();
};
