"use strict";

module.exports = async (req, res, next) => {
	if (!req.session.usuario.autorizadoFA) res.redirect("/producto/agregar/ingreso-manual");
	else next();
};
