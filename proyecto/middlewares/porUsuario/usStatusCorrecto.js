"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const usuario = req.session.usuario;
	if (!usuario) return res.redirect("/usuarios/garantiza-login-y-completo");

	// Obtiene el statusEsperado
	const {tarea} = comp.partesDelUrl(req);
	const statusEsperado =
		(tarea == "/editables" && usuario.statusRegistro_id == mailValidado_id) ||
		(["/editables-bienvenido", "/perennes"].includes(tarea) && usuario.statusRegistro_id == editables_id) ||
		(tarea == "/perennes-bienvenido" && usuario.statusRegistro_id == perennes_id) ||
		tarea == "/logout";

	// Si corresponde, redirecciona
	if (!statusEsperado) return res.redirect("/usuarios/garantiza-login-y-completo");

	// Fin
	return next();
};
