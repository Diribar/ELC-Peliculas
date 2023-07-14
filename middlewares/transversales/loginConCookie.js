"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");
const procesos = require("../../rutas_y_controladores/1-Usuarios/US-FN-Procesos");

module.exports = async (req, res, next) => {
	// Si es una api, interrumpe la función
	const actual = req.originalUrl;
	if (actual.includes("/api/")) return next();

	// Uso de cookies para identificar al usuario
	if (!req.session.usuario && req.cookies && req.cookies.email) {
		// Obtiene los datos del usuario
		let usuario = await BD_especificas.obtieneUsuarioPorMail(req.cookies.email);
		// Acciones si existe el usuario y ya confirmó el mail
		if (usuario && !usuario.statusRegistro.mail_a_validar) {
			// Pasa los datos del usuario a session
			req.session.usuario = usuario;
			// Actualiza la vigencia de la cookie
			res.cookie("email", usuario.email, {maxAge: unDia});
			// Notifica al contador de logins
			procesos.actualizaElContadorDeLogins(usuario);
		}
	}
	// Graba los datos del usuario a 'locals', para que estén en la vista
	if (req.session.usuario && req.session.usuario != res.locals.usuario) res.locals.usuario = req.session.usuario;

	// Fin
	next();
};
