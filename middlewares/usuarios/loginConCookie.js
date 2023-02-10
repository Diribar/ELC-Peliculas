"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");

module.exports = async (req, res, next) => {
	// Uso de cookies para identificar al usuario
	if (!req.session.usuario && req.cookies && req.cookies.email) {
		// Obtiene los datos del usuario
		let usuario = await BD_especificas.obtieneUsuarioPorMail(req.cookies.email);
		// Si existe el usuario y ya confirmó el mail, pasa los datos del usuario a session
		if (usuario && !usuario.status_registro.mail_a_validar) req.session.usuario = usuario;
	}
	// Graba los datos del usuario a 'locals', para que estén en la vista
	if (req.session.usuario && req.session.usuario != res.locals.usuario)
		res.locals.usuario = req.session.usuario;
	// Guarda localhost
	if (!res.locals.localhost) res.locals.localhost = global.localhost;
	// Fin
	next();
};
