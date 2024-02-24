"use strict";
module.exports = (req, res, next) => {
	// Variables
	let login, usuario;

	// Reenvíos por cookies
	if (req.cookies && req.cookies.intsLogin > intsLogins_PC) return res.redirect("/usuario/login/suspendido");
	if (req.cookies && req.cookies.intsDatosPer > intsDatosPer_PC) return res.redirect("/usuario/olvido-contrasena/suspendido");

	// Reenvíos x BD - sólo si existe la cookie de 'olvidoContr'
	if (req.cookies && req.cookies.olvidoContr) {
		if (req.cookies && req.cookies.login) login = req.cookies.login;
		if (!login) return res.redirect("/usuario/login"); // debe existir la cookie de login
		if (login && login.usuario) usuario = login.usuario;
		if (usuario && usuario.intsDatosPer && usuario.intsDatosPer > intsDatosPer_BD)
			return res.redirect("/usuario/olvido-contrasena/suspendido");
	}

	// Fin
	next();
};
