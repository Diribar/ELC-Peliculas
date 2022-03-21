"use strict";
// Definir variables
const BD_especificas = require("../../funciones/BD/Especificas");

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
};
