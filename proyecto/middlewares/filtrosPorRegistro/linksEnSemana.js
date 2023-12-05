"use strict";

module.exports = async (req, res, next) => {
	// Averigua la cantidad de links aprobados en esta semana
	let cantLinksEstaSem = BD_genericas.obtieneTodosPorCondicion("links", {
		prodAprob: true,
		yaTuvoPrimRev: true,
		statusSugeridoEn: {[Op.and]: [{[Op.gt]: lunesDeEstaSemana}, {[Op.lt]: lunesDeEstaSemana + unaSemana}]},
		statusRegistro_id: aprobado_id,
	}).then((n) => n.length);

	// Averigua la cantidad de links aprobados en total
	let cantLinksTotal = BD_genericas.obtieneTodosPorCondicion("links", {
		prodAprob: true,
		statusRegistro_id: aprobados_ids,
	}).then((n) => n.length);

	// Espera a que se actualicen los valores
	[cantLinksEstaSem, cantLinksTotal] = await Promise.all([cantLinksEstaSem, cantLinksTotal]);

	// Variables
	const semanas = vidaUtilLinks / unaSemana; // vida útil en semanas
	const promSemanal = cantLinksTotal / semanas;

	const aprobsPerms =
		cantLinksEstaSem < promSemanal || // si se aprobaron menos que el promedio semanal
		((linksVencidos.length > promSemanal || cantVencsAnts) && // si hay más vencidos que el promedio o quedan vencidos de la semana anterior
			cantLinksEstaSem < 1.05 * promSemanal); // si se aprobaron menos del 120% del promedio

	// Fin
	if (!aprobsPerms) return res.redirect("/revision/tablero-de-control");
	next();
};
