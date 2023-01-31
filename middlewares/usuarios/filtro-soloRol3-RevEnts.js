"use strict";
// Requires
const procesos = require("../../rutas_y_controladores/1-Usuarios/US-FN-Procesos");

module.exports = (req, res, next) => {
	// Variables
	const usuario = req.session.usuario;
	const usuarioSinRolDeRevisor = {
		mensajes: ["Se requiere un permiso especial para ingresar a esta vista."],
		iconos: [{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"}],
	};
	let informacion;

	// Redirecciona si el usuario está sin login o sin completar
	if (!usuario || !usuario.completado_en) return res.redirect("/usuarios/garantiza-login-y-completo");

	// Revisa si el usuario tiene validada su identidad
	informacion = procesos.feedbackSobreIdentidadValidada(req);

	// Revisa si el usuario tiene el rol necesario
	if (!informacion && !usuario.rol_usuario.revisor_ents) informacion = usuarioSinRolDeRevisor;

	// Si corresponde, muestra el mensaje de error
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	next();
};
