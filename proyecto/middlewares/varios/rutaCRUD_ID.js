"use strict";

module.exports = async (req, res, next) => {
	// Asigna la variable 'urlOrigen'
	const ruta = req.baseUrl + req.path.slice(0, -1);
	res.locals.urlOrigen = encodeURIComponent(ruta);

	// Averigua el id del primer capítulo de la colección
	const entidad = comp.obtieneEntidadDesdeUrl(req);
	const {id} = req.query;
	if (entidad == "colecciones") {
		const condicion = {coleccion_id: id, temporada: 1, capitulo: 1};
		res.locals.cap_id = await baseDeDatos.obtienePorCondicion("capitulos", condicion).then((n) => (n ? n.id : null));
	}

	// Fin
	return next();
};
