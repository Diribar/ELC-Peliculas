"use strict";
// Definir variables
const BD_especificas = require("../BD/Especificas");
const BD_genericas = require("../BD/Genericas");
const especificas = require("../Varias/Especificas");

module.exports = {
	guardar_o_actualizar_Edicion: async (prodEntidad, prodID, userID, datos) => {
		let entidad_id = especificas.entidad_id(prodEntidad);
		// Averiguar si ya exista la edición
		let edicID = await BD_especificas.obtenerELC_id("prods_edicion", {
			[entidad_id]: prodID,
			editado_por_id: userID,
		});
		// Acciones en función de si existe o no
		edicID
			? await BD_genericas.actualizarPorId("prods_edicion", edicID, datos)
			: await BD_genericas.agregarRegistro("prods_edicion", {[entidad_id]: prodID, ...datos});
	},
};
