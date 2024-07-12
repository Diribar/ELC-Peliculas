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
	const perteneceRutasAceptadas = rutasAceptadas.some((n) => urlActual.startsWith(n)); // Pertenece a las rutas aceptadas
	const noContieneCiertasPalabras =
		!urlActual.startsWith("/usuarios/garantiza-login-y-completo") &&
		!urlActual.startsWith("/usuarios/logout") &&
		!urlActual.includes("/api/");
	const rutaAceptada = diferenteRutaAnterior && perteneceRutasAceptadas && noContieneCiertasPalabras;
	if (!rutaAceptada) return next();

	// Función
	let activaSessionCookie = (url, actual) => {
		req.session[url] = actual ? urlActual : urlAnterior;
		res.cookie(url, req.session[url], {maxAge: unDia});
	};

	// urlSinLogin - cualquier ruta que no requiera login
	if (
		!urlAnterior.startsWith("/usuarios/") &&
		!urlAnterior.startsWith("/links/") &&
		!urlAnterior.startsWith("/revision/") &&
		!urlAnterior.includes("/agregar/") &&
		!urlAnterior.includes("/edicion/")
	)
		activaSessionCookie("urlSinLogin");

	// urlFueraDeUsuarios - cualquier ruta fuera del circuito de usuarios
	if (!urlAnterior.startsWith("/usuarios/")) activaSessionCookie("urlFueraDeUsuarios");

	// urlFueraDeUsuarios - cualquier ruta fuera del circuito de usuarios
	if (!urlAnterior.startsWith("/usuarios/") && !urlAnterior.includes("/contactanos"))
		activaSessionCookie("urlFueraDeContactanos");

	// urlSinCaptura - cualquier ruta fuera del circuito de usuarios y que no genere una captura
	if (
		!urlAnterior.startsWith("/usuarios/") &&
		!urlAnterior.startsWith("/links/") &&
		!urlAnterior.startsWith("/revision/tablero-de-entidades") &&
		!urlAnterior.includes("/edicion/")
	)
		activaSessionCookie("urlSinCaptura");

	// urlSinPermInput - cualquier ruta fuera del circuito de usuarios y que no genere una captura
	if (
		!urlAnterior.startsWith("/usuarios/") &&
		((!urlAnterior.startsWith("/producto/") && !urlAnterior.startsWith("/rclv/")) || urlAnterior.includes("/detalle/")) &&
		!urlAnterior.startsWith("/links/") &&
		!urlAnterior.startsWith("/revision/")
	)
		activaSessionCookie("urlSinPermInput");

	// urlSinEntidadId
	if (!Object.keys(req.query).length) activaSessionCookie("urlSinEntidadId", true);

	// urlAnterior
	activaSessionCookie("urlAnterior");

	// urlActual
	activaSessionCookie("urlActual", true);

	// Fin
	res.locals.urlActual = urlActual;
	next();
};
