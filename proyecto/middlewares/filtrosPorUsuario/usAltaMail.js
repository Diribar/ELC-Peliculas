"use strict";
// Variables
const valida = require("../../rutas_y_controladores/1-Usuarios/US-FN-Validar");

module.exports = async (req, res, next) => {
	// Redirecciona por cookies
	if (req.cookies && req.cookies.intentos_Login > intentos_Cookies) return res.redirect("/usuario/login/suspendido");
	if (req.cookies && req.cookies.intentos_AM > intentos_Cookies) return res.redirect("/usuario/olvido-contrasena/suspendido");

	// Fin
	next();
};
