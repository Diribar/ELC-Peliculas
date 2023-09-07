"use strict";
// Requires
const comp = require("../../funciones/2-Procesos/Compartidas");

module.exports = async (req, res, next) => {
	// Variables
	const usuario = req.session.usuario;
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
	if (!usuario || !statusEsperado) return res.redirect("/usuarios/garantiza-login-y-completo");
	else next();
};
