"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");

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
		let {entidad: prodEntidad, id: prodID} = req.query;

		// Obtener el registro
		let registro = await BD_genericas.obtenerPorId(prodEntidad, prodID);
		let horarioInicial = registro.capturado_en ? registro.capturado_en : registro.creado_en;
		horarioInicial = horarioInicial ? horarioInicial : 0;

		// Fin
		return res.json(horarioInicial);
	},
};
