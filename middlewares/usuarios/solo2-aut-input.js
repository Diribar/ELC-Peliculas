"use strict";
module.exports = (req, res, next) => {
	// Redireccionar si el usuario no está logueado
	let usuario = req.session.usuario;
	if (!usuario) return res.redirect("/usuarios/login");
	// Redireccionar si el usuario no tiene el permiso necesario
	let informacion;
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
	// Si corresponde, mostrar el mensaje de error
	if (informacion) return res.render("CR9-Errores", {informacion});
	// Fin
	next();
};
