"use strict";
// Requires

module.exports = (req, res, next) => {
	// Datos originales
	if (!req.session.urlAnterior)
		req.session.urlAnterior = req.cookies && req.cookies.urlAnterior ? req.cookies.urlAnterior : "/";
	if (!req.session.urlActual)
		req.session.urlActual = req.cookies && req.cookies.urlActual ? req.cookies.urlActual : "/";
	// Variables
	// Si se retrocedió, la ruta anterior pasa a ser 'home'
	let anterior = req.session.urlAnterior != req.originalUrl ? req.session.urlActual : "/";
	let actual = req.originalUrl;
	// Condición
	if (
		!actual.startsWith("/usuarios/") &&
		!actual.startsWith("/inactivar-captura/") &&
		!actual.startsWith("/session") &&
		!actual.startsWith("/cookies") &&
		!actual.includes("/api/") &&
		!actual.includes("/redireccionar/") &&
		anterior != actual
	) {
		// 1. url sin usuario
		// No tiene agregar ni edición
		// No tiene links
		// No tiene revisión
		if (
			!anterior.includes("/agregar/") &&
			!anterior.includes("/edicion/") &&
			!anterior.startsWith("/links/") &&
			!anterior.startsWith("/revision/")
		)
			req.session.urlSinUsuario = anterior;
		// 2. url sin captura
		// No tiene agregar ni edición
		// No tiene links
		// No tiene revisión, salvo el tablero
		if (
			!anterior.includes("/agregar/") &&
			!anterior.includes("/edicion/") &&
			!anterior.startsWith("/links/") &&
			(!anterior.startsWith("/revision/") || anterior == "/revision/tablero-de-control")
		)
			req.session.urlSinCaptura = anterior;
		// Actualiza en session la url 'anterior'
		req.session.urlAnterior = anterior;
		res.cookie("urlAnterior", anterior, {maxAge: unDia});

		// Actualiza en session la url 'actual'
		req.session.urlActual = actual;
		res.cookie("urlActual", actual, {maxAge: unDia});
	}
	next();
};
