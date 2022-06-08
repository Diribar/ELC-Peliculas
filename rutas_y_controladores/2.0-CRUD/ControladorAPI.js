"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const procesar = require("../../funciones/3-Procesos/3-RUD");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const validar = require("../../funciones/4-Validaciones/RUD");

// *********** Controlador ***********
module.exports = {
	// Tridente: Detalle - Edición del Producto - Links
	obtenerColCap: async (req, res) => {
		let {entidad, id} = req.query;
		let ID =
			entidad == "colecciones"
				? await BD_genericas.obtenerPorCampos("capitulos", {
						coleccion_id: id,
						temporada: 1,
						capitulo: 1,
				  }).then((n) => n.id)
				: await BD_genericas.obtenerPorId("capitulos", id).then((n) => n.coleccion_id);
		return res.json(ID);
	},
	obtenerCapAntPostID: async (req, res) => {
		let {id} = req.query;
		// Obtener la coleccion_id, la temporada y el capítulo
		let {coleccion_id, temporada, capitulo} = await BD_genericas.obtenerPorId("capitulos", id);
		// Averiguar los datos del capítulo anterior **********************
		// Obtener los datos del capítulo anterior (temporada y capítulo)
		let tempAnt = temporada;
		let capAnt = 0;
		if (temporada == 1 && capitulo == 1) capAnt = false;
		else if (capitulo > 1) capAnt = capitulo - 1;
		else {
			tempAnt = temporada - 1;
			// Obtener el último número de capítulo de la temporada anterior
			capAnt = await BD_genericas.obtenerTodosPorCampos("capitulos", {
				coleccion_id: coleccion_id,
				temporada: tempAnt,
			})
				.then((n) => n.map((m) => m.capitulo))
				.then((n) => Math.max(...n));
		}
		// Averiguar los datos del capítulo posterior ********************
		// Obtener datos de la colección y el capítulo
		let [ultCap, ultTemp] = await Promise.all([
			// Obtener el último número de capítulo de la temporada actual
			BD_genericas.obtenerTodosPorCampos("capitulos", {
				coleccion_id: coleccion_id,
				temporada: temporada,
			})
				.then((n) => n.map((m) => m.capitulo))
				.then((n) => Math.max(...n)),
			// Obtener el último número de temporada de la colección
			BD_genericas.obtenerPorId("colecciones", coleccion_id).then((n) => n.cant_temporadas),
		]).then(([a, b]) => {
			return [a, b];
		});
		// Obtener los datos del capítulo posterior (temporada y capítulo)
		let tempPost = temporada;
		let capPost = 0;
		if (temporada == ultTemp && capitulo == ultCap) capPost = false;
		else if (capitulo < ultCap) capPost = capitulo + 1;
		else {
			tempPost = temporada + 1;
			capPost = 1;
		}
		// Obtener los ID
		let [capAntID, capPostID] = await Promise.all([
			// Obtener el ID del capítulo anterior
			capAnt
				? BD_genericas.obtenerPorCampos("capitulos", {
						coleccion_id: coleccion_id,
						temporada: tempAnt,
						capitulo: capAnt,
				  }).then((n) => n.id)
				: false,
			capPost
				? BD_genericas.obtenerPorCampos("capitulos", {
						coleccion_id: coleccion_id,
						temporada: tempPost,
						capitulo: capPost,
				  }).then((n) => n.id)
				: false,
		]).then(([a, b]) => {
			return [a, b];
		});
		// // Enviar el resultado
		return res.json([capAntID, capPostID]);
	},
	obtenerCapID: async (req, res) => {
		let {coleccion_id, temporada, capitulo} = req.query;
		let ID = await BD_genericas.obtenerPorCampos("capitulos", {
			coleccion_id: coleccion_id,
			temporada: temporada,
			capitulo: capitulo,
		}).then((n) => n.id);
		return res.json(ID);
	},
	obtenerCapitulos: async (req, res) => {
		let datos = await BD_especificas.obtenerCapitulos(req.query.coleccion_id, req.query.temporada);
		return res.json(datos);
	},
};
