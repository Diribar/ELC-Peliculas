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
			: ruta == "/editables-bienvenido"
			? usuario.statusRegistro_id == stEditables_id
			: ruta == "/perennes-bienvenido"
			? usuario.statusRegistro_id == stPerennes_id
			: ruta == "/logout"
			? true
			: false;

	// Fin
	if (!statusEsperado) return res.redirect("/usuarios/garantiza-login-y-completo");
	else next();
};
