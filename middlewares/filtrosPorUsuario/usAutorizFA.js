"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");

module.exports = async (req, res, next) => {
	if (!(await BD_especificas.obtieneAutorizFA(req.session.usuario.id))) res.redirect("/producto/agregar/ingreso-manual");
	else next();
};
