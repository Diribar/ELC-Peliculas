"use strict";
// Requires
const procesos = require("../../rutas_y_contrs/2.1-Prods-Agregar/PA-FN4-Procesos");

module.exports = (req, res, next) => {
	// Variables - Acciones comunes entre los pasos de 'producto agregar'
	const entidad = comp.obtieneEntidadDesdeUrl(req);
	const codigoUrl = req.url.slice(1);
	const pasos = [
		{url: "agregar-pc", codigo: "palabrasClave", producto: true},
		{url: "agregar-ds", codigo: "desambiguar", producto: true},
		{url: "ingreso-manual", codigo: "IM", producto: true},
		{url: "ingreso-fa", codigo: "FA"},
		{url: "datos-duros", codigo: "datosDuros"},
		{url: "datos-adicionales", codigo: "datosAdics"},
		{url: "confirma", codigo: "confirma"},
		{url: "terminaste", codigo: "terminaste"},
	];
	const entidades = variables.entidades.prods;
	const paso = pasos.find((n) => codigoUrl.startsWith(n.url));
	const {codigo, producto} = paso;
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
					: "agregar-ds";
			// Redirecciona
			return res.redirect(origen);
		}
	}
	// Si la entidad no es la esperada, redirige con la entidad correcta
	else if (
		(producto && entidad != "producto") || // la entidad no es 'producto' y debería serlo
		(!producto && !entidades.includes(entidad)) // la entidad no es válida
	)
		return res.redirect("/" + (producto ? "producto" : datos.entidad) + "/agregar/" + codigoUrl);

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
