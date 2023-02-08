"use strict";

// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");

// Controlador
module.exports = {
	// Quick Search
	quickSearch: async (req, res) => {
		// Declaración de variables
		let datos = [
			{familia: "producto", entidad: "peliculas", campos: ["nombre_castellano", "nombre_original"]},
			{familia: "producto", entidad: "colecciones", campos: ["nombre_castellano", "nombre_original"]},
			{familia: "producto", entidad: "capitulos", campos: ["nombre_castellano", "nombre_original"]},
			{familia: "rclv", entidad: "personajes", campos: ["nombre", "apodo"]},
			{familia: "rclv", entidad: "hechos", campos: ["nombre"]},
			{familia: "rclv", entidad: "valores", campos: ["nombre"]},
		];
		let condiciones;
		let resultados = [];
		let userID = req.session.usuario ? req.session.usuario.id : 0;
		// Rutina
		for (let dato of datos) {
			// Obtiene las condiciones
			condiciones = BD_especificas.quickSearchCondics(req.query.palabras, dato, userID);
			// Obtiene los registros que cumplen las condiciones
			let resultado = await BD_especificas.quickSearchRegistros(condiciones, dato);
			if (resultado.length) resultados.push(...resultado);
		}
		// Ordena los resultados, 1a prioridad: familia, 2a prioridad: nombre
		resultados.sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0));
		resultados.sort((a, b) => (a.familia < b.familia ? -1 : a.familia > b.familia ? 1 : 0));
		// Enviar la info al FE
		return res.json(resultados);
	},
	horarioInicial: async (req, res) => {
		// Variables
		let {entidad, id} = req.query;
		// Obtiene el registro
		let registro = await BD_genericas.obtienePorId(entidad, id);
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
