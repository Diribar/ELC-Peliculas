"use strict";
// Requires

module.exports = (req, res, next) => {
	// Funciones
	let activarSessionCookie = (url) => {
		req.session[url] = anterior;
		res.cookie(url, anterior, {maxAge: unDia});
	};

	// Datos originales
	let urls = [
		"urlSinLogin",
		"urlSinUsuario",
		"urlSinCaptura",
		"urlSinPermInput",
		"urlAnterior",
		"urlActual",
	];
	urls.forEach((url) => {
		if (!req.session[url]) req.session[url] = req.cookies && req.cookies[url] ? req.cookies[url] : "/";
	});
	// Variables
	let anterior = req.session.urlActual;
	let actual = req.originalUrl;
	
	// Condición
	let rutasAceptadas = ["/producto", "/rclv", "/links", "/usuarios", "/revision", "/consultas"];
	let rutaAceptada = rutasAceptadas.some((n) => actual.startsWith(n)) || actual == "/";

	// Asignar urls
	if (
		rutaAceptada &&
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
		)
			activarSessionCookie("urlSinLogin");

		// 2. url sin usuario
		// No tiene usuario
		if (!anterior.startsWith("/usuarios/")) activarSessionCookie("urlSinUsuario");

		// 3. url sin captura
		// No tiene edición
		// No tiene links
		// No tiene revisión, salvo el tablero
		if (
			!anterior.startsWith("/usuarios/") &&
			!anterior.includes("/edicion/") &&
			!anterior.startsWith("/links/") &&
			(!anterior.startsWith("/revision/") || anterior == "/revision/tablero-de-control")
		)
			activarSessionCookie("urlSinCaptura");

		// 4. url sin permInput
		// No tiene agregar ni edición
		// No tiene links
		if (
			!anterior.startsWith("/usuarios/") &&
			!anterior.includes("/agregar/") &&
			!anterior.includes("/edicion/") &&
			!anterior.startsWith("/links/")
		)
			activarSessionCookie("urlSinPermInput");

		// Actualiza en session la url 'anterior'
		activarSessionCookie("urlAnterior");
		// Actualiza en session la url 'actual'
		req.session.urlActual = actual;
		res.cookie("urlActual", actual, {maxAge: unDia});
	}

	next();
};
