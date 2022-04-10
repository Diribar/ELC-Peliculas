"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");

module.exports = (req, res, next) => {
	if (!req.session.urlAnterior) req.session.urlAnterior = "/";
	let urlAnt = req.session.urlReferencia;
	let url = req.originalUrl;
	if (
		!url.includes("/usuarios/") &&
		!url.includes("/api/") &&
		!url.includes("/redireccionar/") &&
		url != req.session.urlReferencia
	) {
		req.session.urlReferencia = url;
		if (urlAnt != req.session.urlReferencia) req.session.urlAnterior = urlAnt;
	}
	// console.log(req.session.urlAnterior, req.session.urlReferencia);
	console.log(req.session.urlReferencia);
	next();
};
