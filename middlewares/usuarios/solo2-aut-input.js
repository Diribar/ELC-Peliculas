"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	if (!usuario) return res.redirect("/usuarios/login");
	if (!usuario.rol_usuario.aut_input) {
		let linkUsuarioAutInput = "/usuarios/autorizado-input/solicitud";
		let informacion = {
			mensajes:
				["Se requiere aumentar el nivel de confianza, para ingresar información a nuestro sistema. Podés gestionarlo vos mismo haciendo click abajo, en la flecha hacia la derecha."],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				{nombre: "fa-circle-right", link: linkUsuarioAutInput, titulo: "Solicitar el permiso"},
			],
		};
		return res.render("Errores", {informacion});
	}
	next();
};
