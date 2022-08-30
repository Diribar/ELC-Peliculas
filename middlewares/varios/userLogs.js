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
		!actual.startsWith("/inactivar-captura/") &&
		!actual.startsWith("/session") &&
		!actual.startsWith("/cookies") &&
		!actual.includes("/api/") &&
		!actual.includes("/redireccionar/")
	) {
		// Nuevas url en session y cookie
		// La url 'anterior' debe ser una que no tenga capturas
		if (
			!anterior.includes("/edicion/") ||
			!anterior.includes("/links/abm") ||
			anterior.includes("/revision/tablero-de-control")
		) {
			req.session.urlAnterior = anterior;
			res.cookie("urlAnterior", anterior, {maxAge: unDia});
		}
		req.session.urlActual = actual;
		res.cookie("urlActual", actual, {maxAge: unDia});
	}
	next();
};
