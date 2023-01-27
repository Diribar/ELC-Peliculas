"use strict";
module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	// Redirecciona si el usuario está sin login
	if (!usuario) return res.redirect("/usuarios/redireccionar");

	// Redirecciona si el usuario no tiene validada su identidad
	if (!usuario.status_registro.ident_validada) return res.redirect("/usuarios/redireccionar");

	// Redirecciona si el usuario no tiene el rol necesario
	let informacion;
	if (!usuario.rol_usuario.revisor_us) 
		informacion = {
			mensajes: ["Se requiere un permiso especial para acceder a esta vista."],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	// Si corresponde, mostrar el mensaje de error
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	// Fin
	next();
};
