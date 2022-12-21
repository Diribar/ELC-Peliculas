"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");

// Exportar ------------------------------------
module.exports = {
	obtieneVersionesDelRegistro: async (entidad, regID, userID, edicNombre, familia) => {
		// Variables
		let includesEdic = comp.includes(familia);
		let includesOrig = ["creado_por", "status_registro"];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");
		let regEdic = "";

		// Obtiene el producto ORIGINAL
		let regOrig = await BD_genericas.obtienePorIdConInclude(entidad, regID, [
			...includesEdic,
			...includesOrig,
		]);
		regOrig = comp.quitaCamposSinContenido(regOrig);

		// Obtiene el registro EDITADO
		let entidad_id = comp.obtieneEntidad_id(entidad);
		let datos = [edicNombre, {[entidad_id]: regID, editado_por_id: userID}, includesEdic];
		if (userID) regEdic = await BD_genericas.obtienePorCamposConInclude(...datos);
		if (regEdic) regEdic = comp.quitaCamposSinContenido(regEdic);

		// Fin
		return [regOrig, regEdic];
	},
};
