"use strict";
// Requires
const procesos = require("../../rutas_y_contrs/1.1-Usuarios/US-FN-Procesos");

module.exports = (req, res, next) => {
	// Variables
	const usuario = req.session.usuario;
	let informacion;

	// Revisa si el usuario tiene el status perenne
	if (usuario.statusRegistro_id != perennes_id) informacion = procesos.infoNoPerenne(req);

	// Revisa si el usuario tiene el rol necesario
	if (!informacion && !usuario.rolUsuario.revisorPERL)
		informacion = {
			mensajes: ["Se requiere un permiso especial para ingresar a esta vista."],
			iconos: [vistaAnterior(req.session.urlAnterior)],
		};

	// Si corresponde, muestra el mensaje de error
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	// Fin
	else next();
};
