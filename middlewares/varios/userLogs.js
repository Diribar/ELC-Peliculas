"use strict";
// Requires

module.exports = (req, res, next) => {
	// Datos originales
	if (!req.session.urlAnterior)
		req.session.urlAnterior = req.cookies && req.cookies.urlAnterior ? req.cookies.urlAnterior : "/";
	if (!req.session.urlActual)
		req.session.urlActual = req.cookies && req.cookies.urlActual ? req.cookies.urlActual : "/";
	// Variables
	let anterior = req.session.urlActual;
	let actual = req.originalUrl;
	// Condición
	if (
		!actual.startsWith("/usuarios/") &&
		!actual.startsWith("/api/") &&
		!actual.startsWith("/redireccionar/") &&
		anterior != actual
	) {
		// Nuevas url en session y cookie
		req.session.urlAnterior = anterior;
		res.cookie("urlAnterior", anterior, {maxAge: unDia});
		req.session.urlActual = actual;
		res.cookie("urlActual", actual, {maxAge: unDia});
	}
	next();
};
