"use strict";
// Requires
const BD_genericas = require("../../funciones/1-BD/Genericas");

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
			registro.capturadoEn &&
			registro.capturadoPor_id &&
			registro.capturadoPor_id == req.session.usuario.id &&
			registro.capturaActiva
		) {
			// En caso afirmativo, inactivar la captura
			await BD_genericas.actualizaPorId(entidad, id, {capturaActiva: false});
		}
	}
	// Fin
	next();
};
