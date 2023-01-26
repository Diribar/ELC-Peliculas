"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");

module.exports = (req, res, next) => {
	// Variables
	const usuario = req.session.usuario;
	if (usuario.mostrar_cartel_respons) {
		BD_genericas.actualizaPorId("usuarios", usuario.id, {mostrar_cartel_respons: false});
		return res.redirect("/producto/agregar/responsabilidad");
	}
	next();
};
