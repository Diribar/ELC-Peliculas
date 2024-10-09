"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, redirecciona
	if (!req.session.usuario.autorizadoFA) return res.redirect("agregar-im");

	// Fin
	return next();
};
