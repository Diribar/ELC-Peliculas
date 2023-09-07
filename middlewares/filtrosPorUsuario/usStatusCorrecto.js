"use strict";
// Requires
const comp = require("../../funciones/2-Procesos/Compartidas");

module.exports = async (req, res, next) => {
	// Variables
	const usuario = req.session.usuario;
	const {ruta} = comp.reqBasePathUrl(req);
	const statusEsperado =
		ruta == "/editables"
			? usuario.statusRegistro.codigo == "mailValidado"
			: ruta == "/bienvenido" || ruta == "/identidad"
			? usuario.statusRegistro.codigo == "registrado"
			: ruta == "/validacion-en-proceso"
			? usuario.statusRegistro.codigo == "identPendValidar"
			: ruta == "/logout"
			? true
			: false;

	// Fin
	if (!usuario || !statusEsperado) return res.redirect("/usuarios/garantiza-login-y-completo");
	else next();
};
