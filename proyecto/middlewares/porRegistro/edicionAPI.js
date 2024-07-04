"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, edicID, campo, aprob, motivo_id} = req.query;
	const nombreEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);

	// Obtiene el registro editado
	let edicion = await baseDeDatos.obtienePorId(nombreEdic, edicID);

	// Problema 1: No existe la edición
	if (!edicion) return res.json({mensaje: "No se encuentra la edición"});
	// Problema 2: No existe el campo a analizar
	if (edicion[campo] === null) return res.json({mensaje: "El campo no está pendiente para procesar"});
	// Problema 3: Rechazado sin motivo
	if (!aprob && !motivo_id) return res.json({mensaje: "Falta especificar el motivo del rechazo"});

	// Fin
	next();
};
