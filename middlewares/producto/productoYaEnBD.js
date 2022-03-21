"use strict";
// Requires
const BD_varias = require("../../funciones/BD/varias");
const controladoraAgregar = require("../../rutas_y_controladores/2-Prod-Agregar/ControladorVista");

module.exports = async (req, res, next) => {
	let mensaje;
	let datosTerminaste = req.session.datosTerminaste
		? req.session.datosTerminaste
		: req.cookies.datosTerminaste
		? req.cookies.datosTerminaste
		: "";
	if (datosTerminaste != "" && datosTerminaste.fuente != "IM") {
		let elc_id = await BD_varias.obtenerELC_id(
			datosTerminaste.entidad,
			datosTerminaste.fuente + "_id",
			datosTerminaste[datosTerminaste.fuente + "_id"]
		);
		mensaje = "La Película / Colección ya está en nuestra BD";
	}
	if (mensaje) {
		controladoraAgregar.borrarSessionCookies(req, res, "borrarTodo");
		return res.render("Errores", {mensaje});
	}
	next();
};
