"use strict";
// Requires

module.exports = (req, res, next) => {
	// Aborta si es una API
	if (req.originalUrl.includes("/api/")) return next();
	if (req.originalMethod != "GET") return next();

	// Valores de startup
	const urlsGuardadas = [
		"urlSinLogin",
		"urlFueraDeUsuarios",
		"urlFueraDeContactanos",
		"urlSinCaptura",
		"urlSinPermInput",
		"urlSinEntidadId",
		"urlAnterior",
		"urlActual",
	];
	for (let url of urlsGuardadas)
		if (!req.session[url]) req.session[url] = req.cookies && req.cookies[url] ? req.cookies[url] : "/";

	// Variables
	const urlAnterior = req.session.urlActual;
	const urlActual = req.originalUrl;
	const rutasAceptadas = [
		"/producto",
		"/rclv",
		"/links",
		"/usuarios",
		"/revision",
		"/consultas",
		"/institucional",
		"/graficos",
		"/correccion",
	];

	// Si no es una ruta aceptada, interrumpe la función
	const diferenteRutaAnterior = urlActual != urlAnterior; // Es diferente a la ruta urlAnterior
	const perteneceRutasAceptadas = rutasAceptadas.some((n) => urlActual.startsWith(n)) || urlActual == "/"; // Pertenece a las rutas aceptadas
	const noContieneCiertasPalabras =
		!urlActual.startsWith("/usuarios/garantiza-login-y-completo") &&
		!urlActual.startsWith("/usuarios/logout") &&
		!urlActual.includes("/api/");
	const rutaAceptada = diferenteRutaAnterior && perteneceRutasAceptadas && noContieneCiertasPalabras;
	if (!rutaAceptada) return next();

	// Función
	let activaSessionCookie = (url, anterior) => {
		req.session[url] = anterior ? urlAnterior : urlActual;
		res.cookie(url, req.session[url], {maxAge: unDia});
	};

	// urlSinLogin - cualquier ruta que no requiera login
	if (
		!urlActual.startsWith("/usuarios/") &&
		!urlActual.startsWith("/links/") &&
		!urlActual.startsWith("/revision/") &&
		!urlActual.includes("/agregar/") &&
		!urlActual.includes("/edicion/")
	)
		activaSessionCookie("urlSinLogin");

	// urlFueraDeUsuarios - cualquier ruta fuera del circuito de usuarios
	if (!urlActual.startsWith("/usuarios/")) activaSessionCookie("urlFueraDeUsuarios");

	// urlFueraDeUsuarios - cualquier ruta fuera del circuito de usuarios
	if (!urlActual.startsWith("/usuarios/") && !urlActual.includes("/contactanos")) activaSessionCookie("urlFueraDeContactanos");

	// urlSinCaptura - cualquier ruta que no genere una captura
	if (
		!Object.keys(req.query).length || // no tiene parámetros
		["/detalle/", "/historial/"].some((n) => urlActual.includes(n)) // rutas que no capturan
	)
		activaSessionCookie("urlSinCaptura");

	// urlSinPermInput - cualquier ruta fuera del circuito de usuarios y que no genere una captura
	if (
		!urlActual.startsWith("/usuarios/") &&
		((!urlActual.startsWith("/producto/") && !urlActual.startsWith("/rclv/")) || urlActual.includes("/detalle/")) &&
		!urlActual.startsWith("/links/") &&
		!urlActual.startsWith("/revision/")
	)
		activaSessionCookie("urlSinPermInput");

	// urlSinEntidadId
	if (!Object.keys(req.query).length) activaSessionCookie("urlSinEntidadId");

	// urlAnterior
	activaSessionCookie("urlAnterior", true);

	// urlActual
	activaSessionCookie("urlActual");

	// Fin
	res.locals.urlActual = urlActual;
	next();
};
