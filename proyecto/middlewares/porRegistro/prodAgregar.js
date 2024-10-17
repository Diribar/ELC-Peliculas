"use strict";
// Requires
const procesos = require("../../rutas_y_contrs/2.1-Prods-Agregar/PA-FN4-Procesos");

module.exports = (req, res, next) => {
	// Variables - Acciones comunes entre las etapas de 'producto agregar'
	const {tarea: codigoUrl, entidad} = comp.partesDelUrl(req);
	const tarea = codigoUrl.slice(1);
	const etapas = [
		{tarea: "agregar-pc", codigo: "palabrasClave", esProducto: true},
		{tarea: "agregar-ds", codigo: "desambiguar", esProducto: true},
		{tarea: "agregar-im", codigo: "IM", esProducto: true},
		{tarea: "agregar-fa", codigo: "FA"},
		{tarea: "agregar-dd", codigo: "datosDuros"},
		{tarea: "agregar-da", codigo: "datosAdics"},
		{tarea: "agregar-cn", codigo: "confirma"},
		{tarea: "agregar-tr", codigo: "terminaste"},
	];
	const entidades = variables.entidades.prods;
	const etapa = etapas.find((n) => n.tarea == tarea);
	const {codigo, esProducto} = etapa;
	const datos = req.session[codigo] ? req.session[codigo] : req.cookies[codigo];

	// Si no está la session/cookie actual, redirige a la tarea anterior
	if (!datos && codigo != "palabrasClave") {
		// Variables
		const indice = etapas.findIndex((n) => n.tarea == tarea);

		// Si no es "datosDuros", redirige a la tarea anterior
		if (codigo != "datosDuros") return res.redirect(etapas[indice - 1].tarea);
		// Averigua cuál fue la etapa anterior a "datosDuros", y redirige a la tarea anterior
		else {
			// Obtiene el origen
			const origen =
				req.session.FA || req.cookies.FA ? "agregar-fa" : req.session.IM || req.cookies.IM ? "agregar-im" : "agregar-ds";
			// Redirecciona
			return res.redirect(origen);
		}
	}
	// Si la entidad no es la esperada, redirige con la entidad correcta
	else if (
		(esProducto && entidad != "producto") || // la entidad no es 'producto' y debería serlo
		(!esProducto && !entidades.includes(entidad)) // la entidad no es válida
	)
		return res.redirect("/" + (esProducto ? "producto" : datos.entidad) + codigoUrl);

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
