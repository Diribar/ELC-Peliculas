"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	if (!usuario) return res.redirect("/usuarios/login");
	if (!usuario.rol_usuario.aut_gestion_prod) {
		let linkUsuarioAutProductos = "/usuarios/autorizado-productos/solicitud";
		let informacion = {
			mensaje: "Se requiere un permiso especial para revisar la información ingresada a nuestro sistema. Si estás interesado/a, lo podés solicitar haciendo click abajo, en la flecha hacia la derecha.",
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior},
				{nombre: "fa-circle-right", link: linkUsuarioAutProductos},
			],
		};
		return res.render("Errores", {informacion});
	}
	next();
};
