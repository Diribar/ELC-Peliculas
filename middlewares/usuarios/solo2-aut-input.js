"use strict";
// Requires
const usuarios = require("../../funciones/3-Procesos/8-Usuarios");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	let informacion;
	// Redireccionar si el usuario no está logueado
	if (!usuario) return res.redirect("/usuarios/login");
	// Redireccionar si el usuario no tiene el permiso necesario
	if (!usuario.rol_usuario.aut_input) {
		let linkUsuarioAutInput = "/usuarios/autorizado-input/solicitud";
		informacion = {
			mensajes: [
				"Se requiere aumentar el nivel de confianza, para ingresar información a nuestro sistema. Podés gestionarlo vos mismo haciendo click abajo, en la flecha hacia la derecha.",
			],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				{nombre: "fa-circle-right", link: linkUsuarioAutInput, titulo: "Solicitar el permiso"},
			],
		};
	}
	// Detectar si el usuario está penalizado
	let urlAnterior = req.session.urlAnterior;
	if (!informacion) informacion = usuarios.detectarUsuarioPenalizado(usuario, urlAnterior);
	// Si corresponde, mostrar el mensaje de error
	if (informacion) return res.render("Errores", {informacion});
	// Fin
	next();
};
