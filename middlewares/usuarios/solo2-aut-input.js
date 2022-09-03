"use strict";
module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	// Redireccionar si el usuario no está logueado
	if (!usuario) return res.redirect("/usuarios/login");
	// Redireccionar si el usuario no tiene el permiso necesario
	let informacion;
	if (!usuario.rol_usuario.aut_input) {
		let linkUsuarioAutInput = "/usuarios/autorizado-input";
		informacion = {
			mensajes: [
				"Para ingresar información, se requiere aumentar el nivel de confianza.", 
				"Podés gestionarlo haciendo click abajo, en la flecha hacia la derecha.",
			],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				{nombre: "fa-circle-right", link: linkUsuarioAutInput, titulo: "Solicitar el permiso"},
			],
			colorFondo: "gris",
		};
	}
	// Si corresponde, mostrar el mensaje de error
	if (informacion) return res.render("MI9-Cartel", {informacion});
	// Fin
	next();
};
