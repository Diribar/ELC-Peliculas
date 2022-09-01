"use strict";
module.exports = (req, res, next) => {
	// Redirecciona si el usuario no completó el alta de su usuario
	if (!usuario.status_registro.datos_editables)
		return res.redirect("/usuarios/redireccionar");
	// Fin
	next();
};
