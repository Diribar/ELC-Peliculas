"use strict";
// Requires

module.exports = (req, res, next) => {
	// Datos originales
	if (!req.session.urlSinLogin)
		req.session.urlSinLogin = req.cookies && req.cookies.urlSinLogin ? req.cookies.urlSinLogin : "/";
	if (!req.session.urlSinUsuario)
		req.session.urlSinUsuario =
			req.cookies && req.cookies.urlSinUsuario ? req.cookies.urlSinUsuario : "/";
	if (!req.session.urlSinCaptura)
		req.session.urlSinCaptura =
			req.cookies && req.cookies.urlSinCaptura ? req.cookies.urlSinCaptura : "/";
	if (!req.session.urlAnterior)
		req.session.urlAnterior = req.cookies && req.cookies.urlAnterior ? req.cookies.urlAnterior : "/";
	if (!req.session.urlActual)
		req.session.urlActual = req.cookies && req.cookies.urlActual ? req.cookies.urlActual : "/";
	// Variables
	let anterior = req.session.urlActual;
	let actual = req.originalUrl;
	// Condición
	if (
		!actual.startsWith("/inactivar-captura/") &&
		!actual.startsWith("/session") &&
		!actual.startsWith("/cookies") &&
		!actual.includes("/redireccionar") &&
		!actual.includes("/api/") &&
		anterior != actual
	) {
		// 1. url sin login
		// No tiene agregar ni edición
		// No tiene links
		// No tiene revisión
		if (
			!anterior.startsWith("/usuarios/") &&
			!anterior.includes("/agregar/") &&
			!anterior.includes("/edicion/") &&
			!anterior.startsWith("/links/") &&
			!anterior.startsWith("/revision/")
		) {
			req.session.urlSinLogin = anterior;
			res.cookie("urlSinLogin", anterior, {maxAge: unDia});
		}
		// 2. url sin usuario
		// No tiene usuario
		if (!anterior.startsWith("/usuarios/")) {
			req.session.urlSinUsuario = anterior;
			res.cookie("urlSinUsuario", anterior, {maxAge: unDia});
		}
		// 3. url sin captura
		// No tiene edición
		// No tiene links
		// No tiene revisión, salvo el tablero
		if (
			!anterior.startsWith("/usuarios/") &&
			!anterior.includes("/edicion/") &&
			!anterior.startsWith("/links/") &&
			(!anterior.startsWith("/revision/") || anterior == "/revision/tablero-de-control")
		) {
			req.session.urlSinCaptura = anterior;
			res.cookie("urlSinCaptura", anterior, {maxAge: unDia});
		}
		// Actualiza en session la url 'anterior'
		req.session.urlAnterior = anterior;
		res.cookie("urlAnterior", anterior, {maxAge: unDia});

		// Actualiza en session la url 'actual'
		req.session.urlActual = actual;
		res.cookie("urlActual", actual, {maxAge: unDia});
	}
	next();
};
