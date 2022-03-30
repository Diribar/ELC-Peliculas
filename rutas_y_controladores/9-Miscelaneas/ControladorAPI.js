"use strict";
// Definir variables
const BD_especificas = require("../../funciones/BD/Especificas");
const BD_genericas = require("../../funciones/BD/Genericas");

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
		let {entidad, id, codigo} = req.query;
		let campo =
			codigo == "/producto/edicion/"
				? "creado_en"
				: codigo.startsWith("/revision/")
				? "capturado_en"
				: "";
		let horarioInicial = await BD_genericas.obtenerPorId(entidad, id).then((n) => n[campo]);
		return res.json(horarioInicial);
	},
};
