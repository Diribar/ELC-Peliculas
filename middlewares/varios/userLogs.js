"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");

module.exports = (req, res, next) => {
	let urlAnt = req.session.urlReferencia;
	let url = req.originalUrl;
	if (!url.includes("/usuarios/") && !url.includes("/api/") && url != req.session.urlReferencia) {
		req.session.urlReferencia = url;
		if (urlAnt != req.session.urlReferencia) req.session.urlAnterior = urlAnt;
	}
	next();
};
