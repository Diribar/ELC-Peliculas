"use strict";
const varias = require("../../funciones/Varias/Varias");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	if (!usuario) {
		// varias.userLogs(req, res);
		return res.redirect("/usuarios/login");
	}
	if (!usuario.rol_usuario.aut_input) {
		// varias.userLogs(req, res);
		let mensaje =
			"Se requiere aumentar el nivel de confianza, para ingresar información a nuestro sistema. Podés gestionarlo vos mismo haciendo click acá.";
		return res.render("Errores", {mensaje});
	}
	next();
};
