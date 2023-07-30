"use strict";
// Requires

module.exports = (req, res, next) => {
	// Valores de startup
	const urlsGuardadas = ["urlSinLogin", "urlFueraDeUsuarios", "urlSinCaptura", "urlSinPermInput", "urlAnterior", "urlActual"];
	urlsGuardadas.forEach((url) => {
		if (!req.session[url]) req.session[url] = req.cookies && req.cookies[url] ? req.cookies[url] : "/";
	});

	// Variables
	const urlAnterior = req.session.urlActual;
	const urlActual = req.originalUrl;

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
		"/graficos",
	];

	// Si no es una ruta aceptada, interrumpe la función
	const diferenteRutaAnterior = urlActual != urlAnterior; // Es diferente a la ruta urlAnterior
	const perteneceRutasAceptadas = rutasAceptadas.some((n) => urlActual.startsWith(n)); // Pertenece a las rutas aceptadas
	const noContieneCiertasPalabras =
		!urlActual.startsWith("/usuarios/garantiza-login-y-completo") &&
		!urlActual.startsWith("/usuarios/logout") &&
		!urlActual.includes("/api/");
	const rutaAceptada = diferenteRutaAnterior && perteneceRutasAceptadas && noContieneCiertasPalabras;
	if (!rutaAceptada) return next();

	// Función
	let activaSessionCookie = (url, anterior) => {
		req.session[url] = !anterior ? urlActual : urlAnterior;
		res.cookie(url, req.session[url], {maxAge: unDia});
	};

	// 1. urlSinLogin - cualquier ruta que no requiera login
	if (
		!urlActual.startsWith("/usuarios/") &&
		!urlActual.startsWith("/links/") &&
		!urlActual.startsWith("/revision/") &&
		!urlActual.includes("/agregar/") &&
		!urlActual.includes("/edicion/")
	)
		activaSessionCookie("urlSinLogin");

	// 2. urlFueraDeUsuarios - cualquier ruta fuera del circuito de usuarios
	if (!urlActual.startsWith("/usuarios/")) activaSessionCookie("urlFueraDeUsuarios");

	// 3. urlSinCaptura - cualquier ruta fuera del circuito de usuarios y que no genere una captura
	if (
		!urlActual.startsWith("/usuarios/") &&
		!urlActual.startsWith("/links/") &&
		(!urlActual.startsWith("/revision/") || urlActual.includes("/tablero-de-control")) &&
		!urlActual.includes("/edicion/")
	)
		activaSessionCookie("urlSinCaptura");

	// 4. urlSinPermInput - cualquier ruta fuera del circuito de usuarios y que no genere una captura
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
