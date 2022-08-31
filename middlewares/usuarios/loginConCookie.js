"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");

module.exports = async (req, res, next) => {
	// Uso de cookies para identificar al usuario
	if (!req.session.usuario && req.cookies && req.cookies.email) {
		// Obtiene los datos del usuario
		let usuario = await BD_especificas.obtenerUsuarioPorMail(req.cookies.email);
		// Pasa los datos del usuario a session
		if (usuario) req.session.usuario = usuario;
	}
	// Graba a Locals los datos del usuario
	if (req.session.usuario && !res.locals.usuario) res.locals.usuario = req.session.usuario;
	next();
};
