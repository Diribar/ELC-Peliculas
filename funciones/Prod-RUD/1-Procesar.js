"use strict";
// Definir variables
const BD_especificas = require("../BD/Especificas");
const BD_genericas = require("../BD/Genericas");

module.exports = {
	guardar_o_actualizar_Edicion: async (entidad, producto_id, datos) => {
		entidad = entidad + "Edicion";
		// Averiguar si ya exista la edición
		let edicion_id = await BD_especificas.obtenerELC_id(entidad, "elc_id", producto_id);
		// Acciones en función de si existe o no
		edicion_id
			? await BD_genericas.actualizarPorId(entidad, edicion_id, datos)
			: await BD_genericas.agregarRegistro(entidad, {elc_id: producto_id, ...datos});
	},
};
