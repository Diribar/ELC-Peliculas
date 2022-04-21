"use strict";

module.exports = (req, res, next) => {
	if (req.session.usuario && req.session.usuario.status_registro_id.toString() != 1) {
		let usuario = req.session.usuario;
		let informacion = {
			mensajes: [
				"¿Estás segur" + (usuario.sexo_id == "M" ? "a" : "o") + " de que te querés desloguear?",
			],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlReferencia, titulo: "Cancelar"},
				{nombre: "fa-circle-check", link: "/usuarios/logout", titulo: "Logout"},
			],
			logout: true,
		};
		return res.render("Errores", {informacion});
	}
	next();
};
