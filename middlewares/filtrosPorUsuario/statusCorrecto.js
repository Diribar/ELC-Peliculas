"use strict";
module.exports = async (req, res, next) => {
	// Redirecciona si el usuario no está logueado o en el status esperado

	// Variables
	const usuario = req.session.usuario;
	const baseUrl = req.baseUrl;
	const statusEsperado =
		baseUrl == "/editables"
			? usuario.status_registro.mail_validado
			: baseUrl == "/bienvenido" || baseUrl == "/identidad"
			? usuario.status_registro.editables
			: baseUrl == "/validacion-en-proceso"
			? usuario.status_registro.ident_a_validar
			: true;

	// Fin
	if (!usuario || !statusEsperado) return res.redirect("/usuarios/garantiza-login-y-completo");
	else next();
};
