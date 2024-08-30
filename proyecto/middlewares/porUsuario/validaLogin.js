"use strict";
// Variables
const procesos = require("../../rutas_y_contrs/1.1-Usuarios/US-FN-Procesos");
const valida = require("../../rutas_y_contrs/1.1-Usuarios/US-FN-Validar");

module.exports = async (req, res, next) => {
	// Variables
	const datos = req.body;
	const {errores, usuario} = await valida.login(datos);

	// Acciones si hay errores de credenciales
	if (errores.hay) {
		// intentosLogin - cookie
		const intentosLogin = req.cookies && req.cookies.intentosLogin ? req.cookies.intentosLogin + 1 : 1;
		if (intentosLogin <= maxIntentosCookies) res.cookie("intentosLogin", intentosLogin, {maxAge: unDia});
		const intentosPendsCookie = Math.max(0, maxIntentosCookies - intentosLogin);

		// intentosLogin - usuario
		let intentosPendsBD = maxIntentosBD;
		if (usuario && errores.contr_BD) {
			intentosLogin = usuario.intentosLogin + 1;
			if (intentosLogin <= maxIntentosBD) baseDeDatos.actualizaPorId("usuarios", usuario.id, {intentosLogin});
			intentosPendsBD = Math.max(0, maxIntentosBD - intentosLogin);
		}

		// Convierte el resultado en texto
		const intentosPendsCons = Math.min(intentosPendsCookie, intentosPendsBD);
		errores.credenciales = procesos.comentarios.credsInvalidas.login + "<br>Intentos disponibles: " + intentosPendsCons;

		// session - guarda la info
		req.session.login = {datos, errores, usuario};

		// Redirecciona
		return res.redirect("/usuarios/login");
	}

	// Fin
	return next();
};
