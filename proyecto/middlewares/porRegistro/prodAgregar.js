"use strict";
// Requires
const procesos = require("../../rutas_y_contrs/2.1-Prods-Agregar/PA-FN4-Procesos");

module.exports = (req, res, next) => {
	// Variables - Acciones comunes entre los pasos de 'producto agregar'
	const entidad = req.baseUrl.slice(1);
	const codigoUrl = req.url.slice(1);
	const pasos = [
		{url: "palabras-clave", codigo: "palabrasClave"},
		{url: "desambiguar", codigo: "desambiguar"},
		{url: "ingreso-manual", codigo: "IM"},
		{url: "ingreso-fa", codigo: "FA"},
		{url: "datos-duros", codigo: "datosDuros"},
		{url: "datos-adicionales", codigo: "datosAdics"},
		{url: "confirma", codigo: "confirma"},
	];

	// Obtiene el código que corresponde al 'url' y la session/cookie actual
	const codigo = pasos.find((n) => codigoUrl.startsWith(n.url)).codigo;
	const datos = req.session[codigo] ? req.session[codigo] : req.cookies[codigo];

	// Si no está la session/cookie actual, redirige a la url anterior
	if (!datos && codigo != "palabrasClave") {
		const indice = pasos.findIndex((n) => n.url == codigoUrl);
		// Si no es "datosDuros", redirige a la url anterior
		if (codigo != "datosDuros") return res.redirect(pasos[indice - 1].url);
		// Averigua cuál fue el paso anterior a "datosDuros", y redirige a la url anterior
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
	} else if (entidad == "undefined") {
		if (["palabrasClave", "desambiguar", "IM"].includes(codigo)) return res.redirect("/producto/" + codigoUrl);
		else if (datos) return res.redirect("/" + datos.entidad + "/" + codigoUrl);
	}

	// Tareas si es 'GET',
	if (req.method == "GET") {
		// Elimina session y cookie posteriores
		if (codigo != "confirma") procesos.borraSessionCookies(req, res, codigo);

		// Extiende la vida 'util' de Datos Originales
		if (["datosDuros", "datosAdics", "confirma"].includes(codigo))
			res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
	}

	// Fin
	return next();
};
