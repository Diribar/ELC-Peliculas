"use strict";
module.exports = async (req, res, next) => {
	// Redirecciona si el usuario no está en el status esperado

	// Variables
	const usuario = req.session.usuario;
	const reqPath = req.path;
	const statusEsperado =
		reqPath == "/editables"
			? usuario.status_registro.mail_validado
			: reqPath == "/bienvenido" || reqPath == "/identidad"
			? usuario.status_registro.editables
			: reqPath == "/validacion-en-proceso"
			? usuario.status_registro.ident_a_validar
			: reqPath == "/logout"
			? true
			: false;

	// Fin
	if (!usuario || !statusEsperado) return res.redirect("/usuarios/garantiza-login-y-completo");
	else next();
};
