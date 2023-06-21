"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");

module.exports = async (req, res, next) => {
	if (!req.session.usuario.autorizadoFA) res.redirect("/producto/agregar/ingreso-manual");
	else next();
};
