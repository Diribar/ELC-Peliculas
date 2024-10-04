"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const usuario = req.session.usuario;
	if (!usuario) return res.redirect("/usuarios/garantiza-login-y-completo");

	// Obtiene el statusEsperado
	const {ruta} = comp.partesDelUrl(req);
	const statusEsperado =
		(ruta == "/editables" && usuario.statusRegistro_id == mailValidado_id) ||
		(["/editables-bienvenido", "/perennes"].includes(ruta) && usuario.statusRegistro_id == editables_id) ||
		(ruta == "/perennes-bienvenido" && usuario.statusRegistro_id == perennes_id) ||
		ruta == "/logout";

	// Si corresponde, redirecciona
	if (!statusEsperado) return res.redirect("/usuarios/garantiza-login-y-completo");

	// Fin
	return next();
};
