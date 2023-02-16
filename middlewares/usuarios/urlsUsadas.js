"use strict";
// Requires

module.exports = (req, res, next) => {
	// Valores de startup
	let urlsGuardadas = ["urlSinLogin", "urlFueraDeUsuarios", "urlSinCaptura", "urlAnterior", "urlActual"];
	urlsGuardadas.forEach((url) => {
		if (!req.session[url]) req.session[url] = req.cookies && req.cookies[url] ? req.cookies[url] : "/";
	});
	// Variables
	let anterior =
		req.session && req.session.urlActual ? req.session.urlActual : req.cookies.urlActual ? req.cookies.urlActual : "/";
	let actual = req.originalUrl;

	// Condición
	let rutasAceptadas = [
		"/producto",
		"/rclv",
		"/links",
		"/usuarios",
		"/revision",
		"/consultas",
		"/mantenimiento",
		"/institucional",
	];
	let rutaAceptada =
		// Pertenece a las rutas aceptadas
		rutasAceptadas.some((n) => actual.startsWith(n)) &&
		// No es una ruta sin vista
		!actual.startsWith("/usuarios/garantiza-login-y-completo") &&
		!actual.startsWith("/usuarios/logout") &&
		!actual.includes("/api/") &&
		// Es diferente a la ruta anterior
		anterior != actual;

	// Asignar urls
	if (rutaAceptada) {
		// Función
		let activaSessionCookie = (url) => {
			req.session[url] = anterior;
			res.cookie(url, anterior, {maxAge: unDia});
		};

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

		// Actualiza la url 'anterior'
		activaSessionCookie("urlAnterior");

		// Actualiza la url 'actual'
		req.session.urlActual = actual;
		res.cookie("urlActual", actual, {maxAge: unDia});
		res.locals.urlActual = actual;
	}

	next();
};
