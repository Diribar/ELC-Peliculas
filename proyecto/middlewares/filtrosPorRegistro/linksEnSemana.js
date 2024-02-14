"use strict";
const procesos = require("../../rutas_y_controladores/3-RevisionEnts/RE-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	if (!cantLinksVencPorSem) await comp.actualizaLinksVencPorSem();

	// Averigua si hay registros para procesar
	const entidad = req.query == "capitulos" ? "capitulos" : "pelisColes";
	const hayRegistros = cantLinksVencPorSem.paraProc[entidad];

	// Si no hay registros a procesar, redirige al tablero
	if (!hayRegistros) return res.redirect("/revision/tablero-de-control");

	// Fin
	return next();
};
