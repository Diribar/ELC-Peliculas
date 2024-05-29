"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {url, IN} = req.query;
	let respuesta;

	// Valida que exista el dato del 'url'
	if (!respuesta && !url) respuesta = "Falta el 'url' del link";

	// Valida que el link exista en la BD
	const link = await BD_genericas.obtienePorCondicionConInclude("links", {url}, variables.entidades.asocProds);
	if (!respuesta && !link) respuesta = "El link no existe en la base de datos";

	// Valida que el link tenga un status distinto a 'estable'
	if (!respuesta && estables_ids.includes(link.statusRegistro_id)) respuesta = "En este status no se puede procesar";

	// Valida que quede lugar en alguna semana
	if (!respuesta) {
		const categoria_id = comp.linksVencPorSem.categoria_id(link); // cuando está recién creado es 'linksPrimRev_id', cuando es "creadoAprob" es 'linksEstrRec_id/linksEstandar_id'
		const linkEstandarAprob = IN == "SI" && categoria_id == linksEstandar_id;
		if (
			linkEstandarAprob &&
			((link.capitulo_id && !cantLinksVencPorSem.paraProc.capitulos) || // es un capítulo y no queda lugar
				(!link.capitulo_id && !cantLinksVencPorSem.paraProc.pelisColes)) // no es un capítulo y no queda lugar
		)
			respuesta = "En esta semana ya no se puede revisar este link";
	}

	// Fin
	if (respuesta) return res.json(respuesta);
	else next();
};
