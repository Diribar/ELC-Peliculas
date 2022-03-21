"use strict";
// Requires
const BD_genericas = require("../../funciones/BD/Genericas");
const controladoraAgregar = require("../../rutas_y_controladores/2-Prod-Agregar/ControladorVista");

module.exports = async (req, res, next) => {
	let mensaje;
	let elc_id;
	let datos = req.session.datosOriginales
		? req.session.datosOriginales
		: req.cookies.datosOriginales
		? req.cookies.datosOriginales
		: "";
	if (datos != "" && datos.fuente != "IM") {
		elc_id = await BD_genericas.obtenerELC_id(
			datos.entidad,
			datos.fuente + "_id",
			datos[datos.fuente + "_id"]
		);
		if (elc_id) mensaje = "La Película / Colección ya está en nuestra BD";
	}
	console.log("linea 21", elc_id, mensaje, datos.nombre_castellano);
	if (mensaje) {
		controladoraAgregar.borrarSessionCookies(req, res, "borrarTodo");
		return res.render("Errores", {mensaje});
	}
	next();
};
