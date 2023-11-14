"use strict";
// Requires

const procesos = require("../../rutas_y_controladores/1-Usuarios/US-FN-Procesos");

module.exports = async (req, res, next) => {
	// Uso de cookies para identificar al usuario
	if (!req.session.usuario && req.cookies && req.cookies.email) {
		// Obtiene los datos del usuario
		let usuario = await BD_especificas.obtieneUsuarioPorMail(req.cookies.email);

		// Acciones si existe el usuario y ya confirmó el mail
		if (usuario && usuario.statusRegistro_id != mailPendValidar_id) {
			req.session.usuario = usuario; // Pasa los datos del usuario a session
			res.cookie("email", usuario.email, {maxAge: unDia}); // Actualiza la vigencia de la cookie
			if (usuario.pais_id) procesos.actualizaElContadorDeLogins(usuario); // Notifica al contador de logins
		}
	}

	// Miscelaneas
	if (req.session.usuario) {
		// Graba los datos del usuario a 'locals' para la vista
		if (!res.locals.usuario) res.locals.usuario = req.session.usuario;

		// Acciones si cambió la versión
		if (req.session.usuario.versionElcUltimoLogin != versionELC) {
			const novedades = await comp.novedadesELC(req.session.usuario, req);
			res.locals.usuario = req.session.usuario;

			// Si hubieron novedades, redirige
			if (novedades.length)
				return res.render("CMP-0Estructura", {
					informacion: {
						mensajes: novedades,
						iconos: [variables.vistaEntendido(req.session.urlActual)],
						titulo: "Novedades",
					},
				});
		}
	}

	// Fin
	next();
};
