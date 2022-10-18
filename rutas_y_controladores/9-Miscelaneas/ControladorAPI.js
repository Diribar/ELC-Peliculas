"use strict";

// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");

// Controlador
module.exports = {
	// Quick Search
	quickSearch: async (req, res) => {
		// Declaración de variables
		let campos = [["nombre_original", "nombre_castellano"], ["nombre"]];
		let entidades = [
			["peliculas", "colecciones", "capitulos"],
			["personajes", "hechos", "valores"],
		];
		let campoOrden = ["nombre_castellano", "nombre"];
		let familias = ["producto", "rclv"];
		let condiciones;
		let resultados = [];
		let userID = req.session.usuario ? req.session.usuario.id : 0;
		// Rutina
		for (let i = 0; i < entidades.length; i++) {
			// Obtiene las condiciones
			condiciones = BD_especificas.quickSearchCondics(req.query.palabras, campos[i], userID);
			// Obtiene los registros que cumplen las condiciones
			let resultado = await BD_especificas.quickSearchRegistros(
				condiciones,
				campoOrden[i],
				entidades[i],
				familias[i]
			);
			resultados.push(...resultado);
		}
		// Enviar la info al FE
		return res.json(resultados);
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
