"use strict";
module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	// Redireccionar si el usuario no está logueado
	if (!usuario) return res.redirect("/usuarios/login");
	// Rutinas si el usuario no completó su alta
	let url = req.originalUrl;
	if (
		!usuario.status_registro.editables_ok &&
		((!url.startsWith("/usuarios/datos-perennes") && !url.startsWith("/usuarios/datos-editables")) ||
			(url.startsWith("/usuarios/datos-perennes") && usuario.status_registro.perennes_ok) ||
			(url.startsWith("/usuarios/datos-editables") && usuario.status_registro.editables_ok) ||
			(url.startsWith("/usuarios/documento") && usuario.status_registro.docum_revisar))
	)
		return res.redirect("/usuarios/redireccionar");

	// Fin
	next();
};
