"use strict";
// Requires

const procesos = require("../../rutas_y_controladores/1-Usuarios/US-FN-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	let informacion;

	// Acciones si cambió la versión
	if (req.session.usuario && req.session.usuario.versionElcUltimoLogin != versionELC) {
		// Variables
		const novedades = await comp.novedadesELC(req.session.usuario, req);
		res.locals.usuario = req.session.usuario;

		// Si hubieron novedades, redirige
		if (novedades.length)
			informacion = {
				mensajes: novedades,
				iconos: [variables.vistaEntendido(req.session.urlActual)],
				titulo: "Novedades",
			};
	}

	// Fin
	if (informacion) res.render("CMP-0Estructura", {informacion});
	else next();
};
