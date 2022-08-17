"use strict";

// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");

// Controlador
module.exports = {
	// Quick Search
	quickSearch: async (req, res) => {
		// Obtener las condiciones
		let condiciones = BD_especificas.quickSearchCondiciones(req.query.palabras);
		// Obtener los productos que cumplen las condiciones
		let productos = await BD_especificas.quickSearchProductos(condiciones);
		// Enviar la info al FE
		return res.json(productos);
	},

	horarioInicial: async (req, res) => {
		// Variables
		let {entidad, id} = req.query;
		// Obtener el registro
		let registro = await BD_genericas.obtenerPorId(entidad, id);
		let datos = {
			creado_en: registro.creado_en,
			creado_por_id: registro.creado_por_id,
			capturado_en: registro.capturado_en,
			capturado_por_id: registro.capturado_por_id,
		};

		// Fin
		return res.json(datos);
	},
};
