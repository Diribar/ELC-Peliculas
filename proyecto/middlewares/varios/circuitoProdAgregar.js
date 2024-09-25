"use strict";
// Requires
const procesos = require("../../rutas_y_contrs/2.1-Prods-Agregar/PA-FN4-Procesos");

module.exports = (req, res, next) => {
	// Acciones comunes entre los pasos de 'producto agregar'

	// Variables
	const {ruta} = comp.reqBasePathUrl(req);
	const codigoUrl = ruta.slice(1);
	const pasos = [
		{url: "palabras-clave", codigo: "palabrasClave"},
		{url: "desambiguar", codigo: "desambiguar"},
		{url: "ingreso-manual", codigo: "IM"},
		{url: "ingreso-fa", codigo: "FA"},
		{url: "datos-duros", codigo: "datosDuros"},
		{url: "datos-adicionales", codigo: "datosAdics"},
		{url: "confirma", codigo: "confirma"},
	];

	// Obtiene el código que corresponde al 'url'
	const codigo = pasos.find((n) => codigoUrl.startsWith(n.url)).codigo;

	// Averigua si está la session/cookie actual
	const datos = req.session[codigo] ? req.session[codigo] : req.cookies[codigo];
	const rutasSinSessionPrevio = ["palabrasClave", "IM"];
	const redirigir = !datos && !rutasSinSessionPrevio.includes(codigo);

	// Si no está, redirige a la url anterior
	if (redirigir) {
		const indice = pasos.findIndex((n) => n.url == codigoUrl);
		if (codigo != "datosDuros") return res.redirect(pasos[indice - 1].url);
		else {
			// Obtiene el origen
			const origen =
				req.session.FA || req.cookies.FA
					? "ingreso-fa"
					: req.session.IM || req.cookies.IM
					? "ingreso-manual"
					: "desambiguar";
			// Redirecciona
			return res.redirect(origen);
		}
	}

	// Tareas si es 'GET',
	if (req.method == "GET") {
		// Elimina session y cookie posteriores
		if (codigo != "confirma") procesos.borraSessionCookies(req, res, codigo);
		// Extiende la vida 'util' de Datos Originales
		if (codigo == "datosDuros" || codigo == "datosAdics" || codigo == "confirma") {
			res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		}
	}

	// Fin
	return next();
};
