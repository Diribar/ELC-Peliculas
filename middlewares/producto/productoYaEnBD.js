"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");
const procesar = require("../../funciones/3-Procesos/2-Agregar");

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
		let fuente_id = datos.fuente + "_id";
		let elc_id = await BD_especificas.obtenerELC_id(datos.entidad, {[fuente_id]: datos[fuente_id]});
		if (elc_id) {
			let linkDetalle = "/producto/detalle/?entidad=" + datos.entidad + "&id=" + elc_id;
			informacion = {
				mensajes: [
					"La Película / Colección ya está en nuestra BD. Podés ver el detalle haciendo click abajo, en el ícono de 'información'",
				],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: "/producto/agregar/palabras-clave",
						titulo: "Regresar a 'Palabra Clave'",
					},
					{nombre: "fa-circle-info", link: linkDetalle, titulo: "Ir a la vista Detalle"},
				],
			};
		}
	}
	if (informacion) {
		procesar.borrarSessionCookies(req, res, "borrarTodo");
		return res.render("CR9-Errores", {informacion});
	}
	next();
};
