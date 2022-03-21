"use strict";
// Requires
const BD_especificas = require("../../funciones/BD/Especificas");
const especificas = require("../../funciones/Varias/Especificas");

module.exports = async (req, res, next) => {
	let mensaje;
	let elc_id;
	let datos = req.session.datosOriginales
		? req.session.datosOriginales
		: req.cookies.datosOriginales
		? req.cookies.datosOriginales
		: "";
	if (datos=="") mensaje="Debés comenzar desde el principio el proceso de agregado de una película o colección"
	else if (datos.fuente != "IM") {
		elc_id = await BD_especificas.obtenerELC_id(
			datos.entidad,
			datos.fuente + "_id",
			datos[datos.fuente + "_id"]
		);
		if (elc_id) mensaje = "La Película / Colección ya está en nuestra BD";
	}
	console.log("linea 21", elc_id, mensaje, datos.nombre_castellano);
	if (mensaje) {
		especificas.borrarSessionCookies(req, res, "borrarTodo");
		return res.render("Errores", {mensaje});
	}
	next();
};
