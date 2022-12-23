"use strict";
// Requires
const procesos = require("../../rutas_y_controladores/1-Usuarios/FN-Procesos");

module.exports = async (req, res, next) => {
	// Uso de cookies para identificar al usuario
	if (!req.session.usuario && req.cookies && req.cookies.email) {
		// Obtiene los datos del usuario
		let usuario = await procesos.loginConMail(req.cookies.email);
		// Si existe el usuario y ya confirmó el mail, pasa los datos del usuario a session
		if (usuario && !usuario.status_registro.mail_a_validar) req.session.usuario = usuario;
	}
	// Graba a Locals los datos del usuario
	if (req.session.usuario && !res.locals.usuario) res.locals.usuario = req.session.usuario;
	next();
};
