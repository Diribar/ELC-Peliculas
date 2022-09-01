"use strict";
module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	// Redireccionar si el usuario no está logueado
	if (!usuario) return res.redirect("/usuarios/login");
	// Redirecciona si el usuario no completó el alta de su usuario
	if (!usuario.status_registro.datos_editables && !req.originalUrl.startsWith("/usuarios"))
		return res.redirect("/usuarios/redireccionar");

	next();
};
