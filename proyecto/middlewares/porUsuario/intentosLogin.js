"use strict";
module.exports = (req, res, next) => {
	// Reenvíos por cookies
	if (req.cookies && req.cookies.intentosLogin && req.cookies.intentosLogin >= maxIntentosCookies)
		return res.redirect("/usuarios/login/suspendido");

	// Reenvíos x BD
	let login, usuario;
	if (req.session && req.session.login) login = req.session.login;
	if (login && login.usuario) usuario = login.usuario;
	if (usuario && usuario.intentosLogin && usuario.intentosLogin >= maxIntentosBD)
		return res.redirect("/usuarios/login/suspendido");

	// Fin
	return next();
};
