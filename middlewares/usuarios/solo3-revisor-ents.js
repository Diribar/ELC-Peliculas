"use strict";
module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	// Redireccionar si el usuario no tiene el permiso necesario
	let informacion;
	if (!usuario.rol_usuario.revisor_ents) {
		let linkUsuarioAutProductos = "/usuarios/autorizado-revision";
		informacion = {
			mensajes: [
				"Se requiere un permiso especial para revisar la información ingresada a nuestro sistema.",
				" Si estás interesado/a, lo podés solicitar haciendo click abajo, en la flecha hacia la derecha.",
			],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				{nombre: "fa-circle-right", link: linkUsuarioAutProductos, titulo: "Solicitar el permiso"},
			],
		};
	}
	// Si corresponde, mostrar el mensaje de error
	if (informacion) return res.render("MI-Cartel", {informacion});
	// Fin
	next();
};
