"use strict";
// Requires

module.exports = (req, res, next) => {
	// Valores de startup
	const urlsGuardadas = ["urlSinLogin", "urlFueraDeUsuarios", "urlSinCaptura", "urlSinPermInput", "urlAnterior", "urlActual"];
	urlsGuardadas.forEach((url) => {
		if (!req.session[url]) req.session[url] = req.cookies && req.cookies[url] ? req.cookies[url] : "/";
	});
	// Variables
	const anterior =
		req.session && req.session.urlActual ? req.session.urlActual : req.cookies.urlActual ? req.cookies.urlActual : "/";
	const actual = req.originalUrl;

	// Condición
	const rutasAceptadas = [
		"/producto",
		"/rclv",
		"/links",
		"/usuarios",
		"/revision",
		"/consultas",
		"/mantenimiento",
		"/institucional",
	];
	const rutaAceptada =
		// Es diferente a la ruta anterior
		anterior != actual &&
		// Pertenece a las rutas aceptadas
		rutasAceptadas.some((n) => actual.startsWith(n)) &&
		// No contiene ciertas palabras
		!actual.startsWith("/usuarios/garantiza-login-y-completo") &&
		!actual.startsWith("/usuarios/logout") &&
		!actual.includes("/api/");

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

		// 4. urlSinPermInput
		// Cualquier ruta fuera del circuito de usuarios y que no genere una captura
		if (
			((!anterior.startsWith("/producto/") && !anterior.startsWith("/rclv/")) || anterior.includes("/detalle/")) &&
			!anterior.startsWith("/links/") &&
			!anterior.startsWith("/revision/")
		)
			activaSessionCookie("urlSinPermInput");

		// Actualiza la url 'anterior'
		activaSessionCookie("urlAnterior");

		// Actualiza la url 'actual'
		req.session.urlActual = actual;
		res.cookie("urlActual", actual, {maxAge: unDia});
		res.locals.urlActual = actual;
	}

	next();
};
