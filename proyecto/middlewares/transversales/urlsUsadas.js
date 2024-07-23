"use strict";
// Requires

module.exports = (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();
	if (req.originalMethod != "GET") return next();

	// 'urlActual' y 'urlAnterior'
	const urlActual = req.originalUrl;
	const urlAnterior = req.session.urlActual
		? req.session.urlActual
		: req.cookies && req.cookies.urlActual
		? req.cookies.urlActual
		: "/";

	// Condiciones - urlFueraDeUsuarios
	const urlFueraDeUsuarios = !urlAnterior.startsWith("/usuarios/");

	// Condiciones - urlSinParametros y urlSinCaptura
	const parametros = new URL(req.protocol + "://" + req.headers.host + urlAnterior).searchParams;
	const urlSinParametros = !parametros.get("entidad") && !parametros.get("id") && urlFueraDeUsuarios;
	const urlSinCaptura = urlSinParametros || ["/detalle/", "/historial/"].some((n) => urlAnterior.includes(n)); // sin captura

	// Condiciones - urlSinLogin
	const noAgregar = !urlAnterior.includes("/agregar");
	const urlSinLogin = urlFueraDeUsuarios && urlSinCaptura && noAgregar;

	// urlsGuardadas
	const urlsGuardadas = {
		// Temas de usuario
		urlFueraDeUsuarios,
		urlSinLogin,
		urlFueraDeContactanos: urlFueraDeUsuarios && !urlAnterior.includes("/contactanos"),

		// Temas de captura
		urlSinParametros,
		urlSinCaptura,
	};

	// Averigua si es una ruta aceptada
	const rutaAceptada = FN_rutaAceptada(urlActual, urlAnterior);

	// Asigna las sessions
	for (let url in urlsGuardadas) {
		req.session[url] =
			rutaAceptada && urlsGuardadas[url]
				? urlAnterior
				: req.session[url]
				? req.session[url]
				: req.cookies && req.cookies[url]
				? req.cookies[url]
				: "/";
		res.cookie(url, req.session[url], {maxAge: unDia});
	}
	const urlsBasicas = {urlAnterior, urlActual};
	for (let url in urlsBasicas) {
		req.session[url] = rutaAceptada
			? urlsBasicas[url]
			: req.session[url]
			? req.session[url]
			: req.cookies && req.cookies[url]
			? req.cookies[url]
			: "/";
		res.cookie(url, req.session[url], {maxAge: unDia});
	}

	// Fin
	res.locals.urlActual = req.session.urlActual;
	return next();
};

// Función
let FN_rutaAceptada = (urlActual, urlAnterior) => {
	// Variables
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
	const ciertasRutas = ["/usuarios/garantiza-login-y-completo", "/usuarios/logout", "/api/"];

	// Validaciones
	const diferenteRutaAnterior = urlActual != urlAnterior; // Es diferente a la ruta urlAnterior
	const perteneceRutasAceptadas = rutasAceptadas.some((n) => urlActual.startsWith(n)) || urlActual == "/"; // Pertenece a las rutas aceptadas
	const noContieneCiertasRutas = !ciertasRutas.some((n) => urlActual.includes(n));

	// Fin
	return diferenteRutaAnterior && perteneceRutasAceptadas && noContieneCiertasRutas;
};
