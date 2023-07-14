"use strict";
// Requires

module.exports = (req, res, next) => {
	// Valores de startup
	const urlsGuardadas = ["urlSinLogin", "urlFueraDeUsuarios", "urlSinCaptura", "urlSinPermInput", "urlAnterior", "urlActual"];
	urlsGuardadas.forEach((url) => {
		if (!req.session[url]) req.session[url] = req.cookies && req.cookies[url] ? req.cookies[url] : "/";
	});

	// Variables
	const urlActual = req.originalUrl;
	const urlAnterior =
		req.session && req.session.urlActual ? req.session.urlActual : req.cookies.urlActual ? req.cookies.urlActual : "/";

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
		// Es diferente a la ruta urlAnterior
		urlAnterior != urlActual &&
		// Pertenece a las rutas aceptadas
		rutasAceptadas.some((n) => urlActual.startsWith(n)) &&
		// No contiene ciertas palabras
		!urlActual.startsWith("/usuarios/garantiza-login-y-completo") &&
		!urlActual.startsWith("/usuarios/logout") &&
		!urlActual.includes("/api/");

	// Si no es una ruta aceptada, interrumpe la función
	if (!rutaAceptada) return next();

	// Función
	let activaSessionCookie = (url, anterior) => {
		req.session[url] = !anterior ? urlActual : urlAnterior;
		res.cookie(url, req.session[url], {maxAge: unDia});
	};

	// 1. urlSinLogin
	// Cualquier ruta que no requiera login
	if (
		!urlActual.startsWith("/usuarios/") &&
		!urlActual.startsWith("/links/") &&
		!urlActual.startsWith("/revision/") &&
		!urlActual.includes("/agregar/") &&
		!urlActual.includes("/edicion/")
	)
		activaSessionCookie("urlSinLogin");

	// 2. urlFueraDeUsuarios
	// Cualquier ruta fuera del circuito de usuarios
	if (!urlActual.startsWith("/usuarios/")) activaSessionCookie("urlFueraDeUsuarios");

	// 3. urlSinCaptura
	// Cualquier ruta fuera del circuito de usuarios y que no genere una captura
	if (
		!urlActual.startsWith("/usuarios/") &&
		!urlActual.startsWith("/links/") &&
		(!urlActual.startsWith("/revision/") || urlActual.includes("/tablero-de-control")) &&
		!urlActual.includes("/edicion/")
	)
		activaSessionCookie("urlSinCaptura");

	// 4. urlSinPermInput
	// Cualquier ruta fuera del circuito de usuarios y que no genere una captura
	if (
		((!urlActual.startsWith("/producto/") && !urlActual.startsWith("/rclv/")) || urlActual.includes("/detalle/")) &&
		!urlActual.startsWith("/links/") &&
		!urlActual.startsWith("/revision/")
	)
		activaSessionCookie("urlSinPermInput");

	// Actualiza la url 'urlAnterior'
	activaSessionCookie("urlAnterior", true);

	// Actualiza la url 'urlActual'
	activaSessionCookie("urlActual");
	res.locals.urlActual = urlActual;

	next();
};
