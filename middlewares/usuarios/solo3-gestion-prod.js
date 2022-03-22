"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	if (!usuario) return res.redirect("/usuarios/login");
	if (!usuario.rol_usuario.aut_gestion_prod) {
		let mensaje = "Se requiere aumentar el nivel de confianza, para revisar la información ingresada a nuestro sistema. Si estás interesado/a, lo podés gestionar haciendo click acá."
		return res.render("Errores", {mensaje})
	}
	next();
};
