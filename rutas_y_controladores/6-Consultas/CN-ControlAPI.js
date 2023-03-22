"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./CN-Procesos");

module.exports = {
	opcionesFiltro: async (req, res) => {
		// Obtiene las opciones
		const {filtro_id} = req.query;
		const aux = await BD_genericas.obtieneTodosPorCampos("filtros_campos", {cabecera_id: filtro_id});

		// Convierte el array en objeto literal
		let opciones = {};
		aux.map((m) => (opciones[m.campo] = m.valor));

		// Fin
		return res.json(opciones);
	},
};
