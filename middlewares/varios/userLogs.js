"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");

module.exports = (req, res, next) => {
	let url = req.originalUrl;
	if (url.indexOf("/usuarios/") < 0 && url.indexOf("/api/") < 0) req.session.urlReferencia = url;
	next();
};