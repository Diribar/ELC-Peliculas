"use strict";

module.exports = (req, res, next) => {
	if (req.session.usuario && req.session.usuario.status_registro_id.toString() != 1) {
		let usuario = req.session.usuario;
		let informacion = {
			mensaje: "¿Estás segur" + (usuario.sexo_id == "M" ? "a" : "o") + " de que te querés desloguear?",
			iconos: [{nombre: "fa-circle-right", link: "/usuarios/logout", titulo: "Logout"}],
		};
		return res.render("Errores", {informacion});
	}
	next();
};
