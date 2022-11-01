"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");
const BD_genericas = require("../../funciones/2-BD/Genericas");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad
		? req.query.entidad
		: req.originalUrl.startsWith("/revision/usuarios")
		? "usuarios"
		: "";
	const id = req.query.id;
	if (req.session.usuario) {

		// Obtiene el registro de la entidad
		let registro = await BD_genericas.obtienePorId(entidad, id);
		
		// Verificar que tenga una captura activa del usuario
		if (
			registro &&
			registro.capturado_en &&
			registro.capturado_por_id &&
			registro.capturado_por_id == req.session.usuario.id &&
			registro.captura_activa
		) {
			// En caso afirmativo, inactivar la captura
			await BD_genericas.actualizaPorId(entidad, id, {captura_activa: false});
		}
	}
	// Fin
	next();
};
