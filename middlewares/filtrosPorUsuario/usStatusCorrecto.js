"use strict";
module.exports = async (req, res, next) => {
	// Redirecciona si el usuario no está en el status esperado

	// Variables
	const usuario = req.session.usuario;
	const reqPath = req.path;
	const statusEsperado =
		reqPath == "/editables"
			? usuario.statusRegistro.mail_validado
			: reqPath == "/bienvenido" || reqPath == "/identidad"
			? usuario.statusRegistro.editables
			: reqPath == "/validacion-en-proceso"
			? usuario.statusRegistro.ident_a_validar
			: reqPath == "/logout"
			? true
			: false;

	// Fin
	if (!usuario || !statusEsperado) return res.redirect("/usuarios/garantiza-login-y-completo");
	else next();
};
