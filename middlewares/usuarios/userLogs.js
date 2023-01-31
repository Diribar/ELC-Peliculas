"use strict";
// Requires

module.exports = (req, res, next) => {
	// Funciones
	let activaSessionCookie = (url) => {
		req.session[url] = anterior;
		res.cookie(url, anterior, {maxAge: unDia});
	};

	// Datos originales
	let urls = [
		"urlSinLogin",
		"urlFueraDeUsuarios",
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

	// Asignar urls
	if (
		!actual.startsWith("/usuarios/garantiza-login-y-completo") &&
		!actual.includes("/api/") &&
		anterior != actual
	) {
		// 1. urlSinLogin
		// Cualquier ruta que no requiera login
		if (
			!anterior.startsWith("/usuarios/") &&
			!anterior.startsWith("/links/") &&
			!anterior.startsWith("/revision/") &&
			!anterior.includes("/agregar/") &&
			!anterior.includes("/edicion/")
		)
			activaSessionCookie("urlSinLogin");

		// 2. urlFueraDeUsuarios
		// Cualquier ruta fuera del circuito de usuarios
		if (!anterior.startsWith("/usuarios/")) activaSessionCookie("urlFueraDeUsuarios");

		// 3. urlSinCaptura
		// Cualquier ruta fuera del circuito de usuarios y que no genere una captura
		if (
			!anterior.startsWith("/usuarios/") &&
			!anterior.startsWith("/links/") &&
			(!anterior.startsWith("/revision/") || anterior.includes("/tablero-de-control")) &&
			!anterior.includes("/edicion/")
		)
			activaSessionCookie("urlSinCaptura");

		// Actualiza en session la url 'anterior'
		activaSessionCookie("urlAnterior");
		// Actualiza en session la url 'actual'
		req.session.urlActual = actual;
		res.cookie("urlActual", actual, {maxAge: unDia});
	}

	next();
};
