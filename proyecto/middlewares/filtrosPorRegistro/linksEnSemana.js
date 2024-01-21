"use strict";
const procesos = require("../../rutas_y_controladores/3-RevisionEnts/RE-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const {cantLinksEstaSem, cantLinksTotal, linksVencidos, cantVencsAnts} = await procesos.TC.obtieneLinks();
	const promSemanal = cantLinksTotal / linksSemsVidaUtil;

	// Averigua si se pueden aprobar más links
	const aprobsPerms =
		cantLinksEstaSem < promSemanal || // si se aprobaron menos que el promedio semanal
		((linksVencidos.length > promSemanal || cantVencsAnts) && // si hay más vencidos que el promedio o quedan vencidos de la semana anterior
			cantLinksEstaSem < 1.05 * promSemanal); // si se aprobaron menos que el promedio más la tolerancia
	if (aprobsPerms) return next();

	// Obtiene el producto y si no está aprobado redirige al tablero
	const {entidad, id} = req.query;
	const producto = await BD_genericas.obtienePorIdConInclude(entidad, id, "links");
	if (!aprobados_ids.includes(producto.statusRegistro_id)) return res.redirect("/revision/tablero-de-control")

	// Obtiene los links y si no hay alguno en algún status esperado, redirige al tablero
	const links = producto.links.filter((n) => [creado_id, inactivar_id, recuperar_id].includes(n.statusRegistro_id));
	if (!links.length) return res.redirect("/revision/tablero-de-control")

	// Fin
	return next();
};
