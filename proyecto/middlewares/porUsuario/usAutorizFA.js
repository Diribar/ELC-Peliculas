"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, redirecciona
	if (!req.session.usuario.autorizadoFA) return res.redirect("/producto/agregar/ingreso-manual");

	// Fin
	return next();
};
