"use strict";
// Variables
const valida = require("../../rutas_y_controladores/1-Usuarios/US-FN-Validar");

module.exports = async (req, res, next) => {
	// Redirecciona por cookies
	if (req.cookies && req.cookies.intentos_AM >= intentosCookies) return res.redirect("/usuarios/alta-mail/suspendido");

	// Fin
	next();
};
