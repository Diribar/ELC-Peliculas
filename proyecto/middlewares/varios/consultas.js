"use strict";
// Variables
const procesos = require("../../rutas_y_controladores/5-Consultas/CN-Procesos");

module.exports = async (req, res, next) => {
	// Si la configuración está en la url, toma el valor y redirige para eliminarla
	const configCons = req.query;
	if (Object.keys(configCons).length) {
		procesos.varios.configCons_url(req, res);
		const ruta = req.protocol + "://" + req.headers.host + req.baseUrl;
		return res.redirect(ruta);
	}

	// Activa session con cookie
	if (!req.session.configCons && req.cookies.configCons) req.session.configCons = req.cookies.configCons;

	// Continuar
	next();
};
