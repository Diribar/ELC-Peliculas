"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");
const BD_genericas = require("../../funciones/2-BD/Genericas");


module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad;
	const id = req.query.id;
	const userID = req.session.usuario.id;

	// Funciones --------------------------------------------------------
	let registro = await BD_genericas.obtenerPorId(entidad, id);
	// Verificar que tenga una captura activa del usuario
	if (
		registro &&
		registro.capturado_en &&
		registro.capturado_por_id &&
		registro.capturado_por_id == userID &&
		registro.captura_activa
	) {
		// En caso afirmativo, actualizarlo inactivando la captura
		await BD_genericas.actualizarPorId(entidad, id, {captura_activa: false});
	}
	// Fin
	next();
};
