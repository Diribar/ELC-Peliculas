"use strict";
const procesos = require("../../rutas_y_controladores/3-RevisionEnts/RE-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const {cantLinksEstaSem, cantLinksTotal, linksVencidos, cantVencsAnts} = await procesos.TC.obtieneLinks();
	const semanas = vidaUtilLinks / unaSemana; // vida útil en semanas
	const promSemanal = cantLinksTotal / semanas;

	// Averigua si se pueden aprobar más links
	const aprobsPerms =
		cantLinksEstaSem < promSemanal || // si se aprobaron menos que el promedio semanal
		((linksVencidos.length > promSemanal || cantVencsAnts) && // si hay más vencidos que el promedio o quedan vencidos de la semana anterior
			cantLinksEstaSem < 1.05 * promSemanal); // si se aprobaron menos que el promedio más la tolerancia

	// Fin
	return !aprobsPerms ? res.redirect("/revision/tablero-de-control") : next();
};
