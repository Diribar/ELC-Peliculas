"use strict";
module.exports = (req, res, next) => {
	// Reenvíos por cookies
	if (req.cookies && req.cookies.intentos_Login > intentosCookies) return res.redirect("/usuario/login/suspendido");

	// Reenvíos x BD
	let login, usuario;
	if (req.session && req.session.login) login = req.session.login;
	if (login && login.usuario) usuario = login.usuario;
	if (usuario && usuario.intentos_Login > intentos_BD) return res.redirect("/usuario/login/suspendido");

	// Fin
	next();
};
