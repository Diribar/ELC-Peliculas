"use strict";
module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	// Redireccionar si el usuario no está logueado
	if (!usuario) return res.redirect("/usuarios/login");
	// Redireccionar si el usuario no tiene el permiso necesario
	let informacion;
	if (!usuario.rol_usuario.aut_gestion_us) {
		let linkUsuarioAutProductos = "/usuarios/autorizado-revision";
		informacion = {
			mensajes: ["Se requiere un permiso especial para acceder a esta vista."],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	}
	// Si corresponde, mostrar el mensaje de error
	if (informacion) return res.render("MI-Cartel", {informacion});
	// Fin
	next();
};
