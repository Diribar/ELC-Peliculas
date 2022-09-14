"use strict";
module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	// Redireccionar si el usuario no está logueado
	if (!usuario) return res.redirect("/usuarios/login");
	if (!usuario.status_registro.editables_ok) return res.redirect("/usuarios/redireccionar");

	next();
};
