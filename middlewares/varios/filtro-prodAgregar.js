"use strict";
// Requires
const procesos = require("../../rutas_y_controladores/2.1-Prod-Agregar/PA-FN-Procesos");

module.exports = (req, res, next) => {
	// Variables
	let urlActual = req.url;
	let variables = [
		{url: "palabras-clave", codigo: "palabrasClave"},
		{url: "desambiguar", codigo: "desambiguar"},
		{url: "ingreso-manual", codigo: "IM"},
		{url: "ingreso-fa", codigo: "FA"},
		{url: "datos-duros", codigo: "datosDuros"},
		{url: "datos-adicionales", codigo: "datosAdics"},
		{url: "confirma", codigo: "confirma"},
		// {url: "terminaste", codigo: "terminaste", anterior: "palabras-clave"},
	];

	// Obtiene el código que corresponde al 'url'
	let {codigo} = variables.find((n) => n.url == urlActual);
	console.log(19, codigo);
	
	// Si no está la session/cookie actual, redirige a la url anterior
	let sessionCookie = req.session[codigo] ? req.session[codigo] : req.cookies[codigo];
	if (!sessionCookie && codigo != "palabrasClave" && codigo != "IM") {
		let indice = variables.findIndex((n) => n.url == urlActual);
		if (codigo != "datosDuros") return res.redirect(variables[indice - 1].url);
		else {
			// Obtiene el origen
			let origen =
				req.session.FA || req.cookies.FA
					? "ingreso-fa"
					: req.session.IM || req.cookies.IM
					? "ingreso-manual"
					: "desambiguar";
			// Redirecciona
			return res.redirect(origen);
		}
	}

	// Si es 'GET', elimina session y cookie posteriores
	if (req.method == "GET" && codigo != "confirma") procesos.borraSessionCookies(req, res, codigo);

	next();
};
