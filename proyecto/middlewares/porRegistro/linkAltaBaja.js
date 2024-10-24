"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {url} = req.query;
	let respuesta;

	// Valida que exista el dato del 'url'
	if (!respuesta && !url) respuesta = "Falta el 'url' del link";

	// Valida que el link exista en la BD
	const link = await baseDeDatos.obtienePorCondicion("links", {url}, variables.entidades.asocsProd);
	if (!respuesta && !link) respuesta = "El link no existe en la base de datos";

	// Valida que el link tenga un status distinto a 'estable'
	if (!respuesta && estables_ids.includes(link.statusRegistro_id)) respuesta = "En este status no se puede procesar";

	// Si corresponde, devuelve el mensaje
	if (respuesta) return res.json(respuesta);

	// Fin
	return next();
};
