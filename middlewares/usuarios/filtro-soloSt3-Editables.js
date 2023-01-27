"use strict";
module.exports = (req, res, next) => {
	// Variables
	let usuario = req.session.usuario;
	// Redirecciona si el usuario está en alguna de esta situaciones:
	// - Sin login
	// - En un status distinto a 'editables'
	if (!usuario || !usuario.status_registro.editables) return res.redirect("/usuarios/redireccionar");

	// Fin
	next();
};
