"use strict";
// Requires

module.exports = (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();
	if (req.originalMethod != "GET") return next();

	// Variables
	const urlActual = req.originalUrl;
	const urlAnterior = req.session.urlActual
		? req.session.urlActual
		: req.cookies && req.cookies.urlActual
		? req.cookies.urlActual
		: "/";
	const urlsBasicas = {urlAnterior, urlActual};

	// Condiciones
	const urlFueraDeUsuarios = !urlActual.startsWith("/usuarios/");
	const urlSinEntidadId = !Object.keys(req.query).length;
	const urlSinCaptura = urlSinEntidadId || ["/detalle/", "/historial/"].some((n) => urlActual.includes(n));
	const noAgregar = !urlActual.includes("/agregar");

	// Valores de startup
	const urlsGuardadas = {
		// Temas de usuario
		urlFueraDeUsuarios,
		urlFueraDeContactanos: urlFueraDeUsuarios && !urlActual.includes("/contactanos"),
		urlSinLogin: urlFueraDeUsuarios && urlSinCaptura && noAgregar,
		// Temas de captura
		urlSinEntidadId,
		urlSinCaptura,
	};

	// Averigua si es una ruta aceptada
	const rutaAceptada = FN_rutaAceptada(urlActual, urlAnterior);

	for (let url in urlsGuardadas) {
		req.session[url] =
			rutaAceptada && urlsGuardadas[url]
				? urlActual
				: req.session[url]
				? req.session[url]
				: req.cookies && req.cookies[url]
				? req.cookies[url]
				: "/";
		res.cookie(url, req.session[url], {maxAge: unDia});
	}
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
	next();
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

	const diferenteRutaAnterior = urlActual != urlAnterior; // Es diferente a la ruta urlAnterior
	const perteneceRutasAceptadas = rutasAceptadas.some((n) => urlActual.startsWith(n)) || urlActual == "/"; // Pertenece a las rutas aceptadas
	const noContieneCiertasRutas = !ciertasRutas.some((n) => urlActual.includes(n));

	// Fin
	return diferenteRutaAnterior && perteneceRutasAceptadas && noContieneCiertasRutas;
};
