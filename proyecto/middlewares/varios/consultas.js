"use strict";
// Variables
const procesos = require("../../rutas_y_contrs/5-Consultas/CN-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const configCons = req.query;

	// Si la configuración está en la url, toma el valor y redirige para eliminarla
	if (Object.keys(configCons).length) {
		// Acciones varias
		const feedback = await procesos.varios.configCons_url(req, res);
		if (feedback == "loginNeces") return res.redirect("/usuarios/login");

		const ruta = req.protocol + "://" + req.headers.host + req.baseUrl;
		return res.redirect(ruta);
	}

	// Si 'session' está inactiva y existe 'cookie', activa 'session' con 'cookie'
	if (!req.session.configCons && req.cookies.configCons) req.session.configCons = req.cookies.configCons;

	// Fin
	return next();
};
