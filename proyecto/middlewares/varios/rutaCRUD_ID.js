"use strict";

module.exports = async (req, res, next) => {
	// Asigna la variable 'rutaCRUD'
	const ruta = req.baseUrl + req.path.slice(0, -1);
	res.locals.rutaCRUD = encodeURIComponent(ruta);

	// Averigua el id del primer capítulo de la colección
	const {entidad, id} = req.params;
	if (entidad == "colecciones") {
		const condicion = {coleccion_id: id, temporada: 1, capitulo: 1};
		res.locals.capID = await baseDeDatos.obtienePorCondicion("capitulos", condicion).then((n) => (n ? n.id : null));
	}

	// Fin
	return next();
};
