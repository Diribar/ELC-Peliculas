"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	if (!usuario) return res.redirect("/usuarios/login");
	if (!usuario.rol_usuario.aut_input) {
		let mensaje =
			"Se requiere aumentar el nivel de confianza, para ingresar información a nuestro sistema. Podés gestionarlo vos mismo haciendo click acá.";
		return res.render("Errores", {mensaje});
	}
	next();
};
