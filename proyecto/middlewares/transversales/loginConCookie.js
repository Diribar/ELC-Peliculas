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

	// Graba los datos del usuario a 'locals' para la vista
	if (req.session.usuario && !res.locals.usuario) res.locals.usuario = req.session.usuario;

	// Fin
	next();
};
