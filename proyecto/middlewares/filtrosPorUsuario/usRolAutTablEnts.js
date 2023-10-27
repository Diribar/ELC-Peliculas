"use strict";
// Requires
const procesos = require("../../rutas_y_controladores/1-Usuarios/US-FN-Procesos");

module.exports = (req, res, next) => {
	// Variables
	const usuario = req.session.usuario;
	let informacion;

	// Revisa si el usuario tiene el status perenne
	if (usuario.statusRegistro_id != stPerennes_id) informacion = procesos.validaPerenne(req);

	// Revisa si el usuario tiene el rol necesario
	if (!informacion && !usuario.rolUsuario.autTablEnts)
		informacion = {
			mensajes: ["Se requiere un permiso especial para ingresar a esta vista."],
			iconos: [{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"}],
		};

	// Si corresponde, muestra el mensaje de error
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	// Fin
	else next();
};
