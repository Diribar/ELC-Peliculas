"use strict";
// Requires
const especificas = require("../../funciones/4-Compartidas/Funciones");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	if (!usuario) return res.redirect("/usuarios/login");
	if (!usuario.rol_usuario.aut_gestion_prod) {
		let linkUsuarioAutProductos = "/usuarios/autorizado-productos/solicitud";
		let informacion = {
			mensajes:
				["Se requiere un permiso especial para revisar la información ingresada a nuestro sistema. Si estás interesado/a, lo podés solicitar haciendo click abajo, en la flecha hacia la derecha."],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				{nombre: "fa-circle-right", link: linkUsuarioAutProductos, titulo: "Solicitar el permiso"},
			],
		};
		return res.render("Errores", {informacion});
	}
	next();
};
