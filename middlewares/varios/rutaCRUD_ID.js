"use strict";
const BD_genericas = require("../../funciones/2-BD/Genericas");

module.exports = async (req, res, next) => {
	// Variable
	const ruta = req.baseUrl + req.path;
	const {entidad, id} = req.query;

	// Asigna la variable 'rutaCRUD'
	res.locals.rutaCRUD = false
		? false
		: ruta == "/producto/detalle/"
		? "DTP"
		: ruta == "/producto/edicion/"
		? "EDP"
		: ruta == "/producto/calificar/"
		? "CAL"
		: ruta == "/links/abm/"
		? "LK"
		: "";

	// Averigua el id del primer capítulo de la colección
	if (entidad == "colecciones") {
		const condicion = {coleccion_id: id, temporada: 1, capitulo: 1};
		res.locals.capID = await BD_genericas.obtienePorCondicion("capitulos", condicion).then((n) => n.id);
	}

	// Fin
	next();
};
