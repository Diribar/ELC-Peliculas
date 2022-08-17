"use strict";
// Requires
const usuarios = require("../../funciones/3-Procesos/8-Usuarios");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	let informacion;
	// Redireccionar si el usuario no está logueado
	if (!usuario) return res.redirect("/usuarios/login");
	// Redireccionar si el usuario no tiene el permiso necesario
	if (!usuario.rol_usuario.aut_gestion_prod) {
		let linkUsuarioAutProductos = "/usuarios/autorizado-revision/solicitud";
		informacion = {
			mensajes: [
				"Se requiere un permiso especial para revisar la información ingresada a nuestro sistema. Si estás interesado/a, lo podés solicitar haciendo click abajo, en la flecha hacia la derecha.",
			],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				{nombre: "fa-circle-right", link: linkUsuarioAutProductos, titulo: "Solicitar el permiso"},
			],
		};
	}
	// Si corresponde, mostrar el mensaje de error
	if (informacion) return res.render("CR9-Errores", {informacion});
	// Fin
	next();
};
