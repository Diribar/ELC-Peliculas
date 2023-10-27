"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const usuario = req.session.usuario;
	if (!usuario) return res.redirect("/usuarios/garantiza-login-y-completo");

	// Obtiene el statusEsperado
	const {ruta} = comp.reqBasePathUrl(req);
	const statusEsperado =
		ruta == "/editables"
			? usuario.statusRegistro_id == stMailValidado_id
			: ruta == "/bienvenido" || ruta == "/identidad"
			? usuario.statusRegistro_id == stUsRegistrado_id
			: ruta == "/validacion-en-proceso"
			? usuario.statusRegistro_id == stIdentPendValidar_id
			: ruta == "/logout"
			? true
			: false;

	// Fin
	if (!statusEsperado) return res.redirect("/usuarios/garantiza-login-y-completo");
	else next();
};
