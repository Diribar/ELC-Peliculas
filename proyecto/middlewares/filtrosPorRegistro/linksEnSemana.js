"use strict";
const procesos = require("../../rutas_y_controladores/3-RevisionEnts/RE-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	if (!cantLinksVencPorSem) await comp.actualizaLinksVencPorSem();

	// Averigua si hay links para procesar
	const entidad = req.query.entidad == "capitulos" ? "capitulos" : "pelisColes";
	const hayRegistros = cantLinksVencPorSem.paraProc[entidad];

	// Averigua si hay linksEdicion para procesar
	if (!hayRegistros) {
		const campo_id = comp.obtieneDesdeEntidad.campo_id(req.query.entidad);
		const id = req.query.id;
		// hayRegistros = await BD_genericas.obtienePorCondicion("linksEdicion", {[campo_id]: id});
	}

	// Si no hay registros a procesar, redirige al tablero
	if (!hayRegistros) return res.redirect("/revision/tablero-de-control");

	// Fin
	return next();
};
