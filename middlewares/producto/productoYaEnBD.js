"use strict";
// Requires
const BD_especificas = require("../../funciones/BD/Especificas");
const especificas = require("../../funciones/Varias/Especificas");

module.exports = async (req, res, next) => {
	// Variables
	let informacion;
	let datos = req.session.datosOriginales
		? req.session.datosOriginales
		: req.cookies.datosOriginales
		? req.cookies.datosOriginales
		: "";
	// Controles
	if (!datos) return res.redirect("/producto/agregar/palabras-clave");
	else if (datos.fuente != "IM") {
		let elc_id = await BD_especificas.obtenerELC_id(
			datos.entidad,
			datos.fuente + "_id",
			datos[datos.fuente + "_id"]
		);
		if (elc_id) {
			let linkDetalle = "/producto/detalle/?entidad=" + datos.entidad + "&id=" + elc_id;
			informacion = {
				mensaje: "La Película / Colección ya está en nuestra BD. Podés ver el detalle haciendo click abajo, en la flecha hacia la derecha",
				iconos: [
					{nombre: "fa-circle-left", link: req.session.urlAnterior},
					{nombre: "fa-circle-right", link: linkDetalle},
				],
			};
		}
	}
	if (informacion) {
		especificas.borrarSessionCookies(req, res, "borrarTodo");
		return res.render("Errores", {informacion});
	}
	next();
};
