"use strict";
const procesos = require("../../rutas_y_controladores/3-RevisionEnts/RE-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const linkSig = await procesos.TC.obtieneLinkSig();

	// Obtiene los links y si no hay alguno en algún status esperado, redirige al tablero
	if (!linkSig) return res.redirect("/revision/tablero-de-control")

	// Fin
	return next();
};
