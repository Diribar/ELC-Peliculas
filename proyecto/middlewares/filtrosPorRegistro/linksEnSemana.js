"use strict";
const procesos = require("../../rutas_y_controladores/3-RevisionEnts/RE-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const revID = req.session.usuario.id;
	const prodSig = await procesos.TC.obtieneSigProd(revID);

	// Obtiene los links y si no hay alguno en algún status esperado, redirige al tablero
	if (!prodSig) return res.redirect("/revision/tablero-de-control")

	// Fin
	return next();
};
