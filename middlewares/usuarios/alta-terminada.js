"use strict";
module.exports = (req, res, next) => {
	// Redireccionar si el usuario no está logueado
	if (!req.session.usuario) return res.redirect("/usuarios/login");
	// Redirecciona si el usuario no completó el alta de su usuario
	if (!usuario.status_registro.editables_validado) return res.redirect("/usuarios/redireccionar");
	
	// Fin
	next();
};
