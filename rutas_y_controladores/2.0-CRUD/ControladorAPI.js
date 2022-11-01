"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");

// *********** Controlador ***********
module.exports = {
	// Tridente: Detalle - Edición del Producto - Links
	obtieneColCap: async (req, res) => {
		let {entidad, id} = req.query;
		let ID =
			entidad == "colecciones"
				? await BD_genericas.obtienePorCampos("capitulos", {
						coleccion_id: id,
						temporada: 1,
						capitulo: 1,
				  }).then((n) => n.id)
				: await BD_genericas.obtienePorId("capitulos", id).then((n) => n.coleccion_id);
		return res.json(ID);
	},
	obtieneCapAntPostID: async (req, res) => {
		let {id} = req.query;
		// Obtiene la coleccion_id, la temporada y el capítulo
		let {coleccion_id, temporada, capitulo} = await BD_genericas.obtienePorId("capitulos", id);
		// Averiguar los datos del capítulo anterior **********************
		// Obtiene los datos del capítulo anterior (temporada y capítulo)
		let tempAnt = temporada;
		let capAnt = 0;
		if (temporada == 1 && capitulo == 1) capAnt = false;
		else if (capitulo > 1) capAnt = capitulo - 1;
		else {
			tempAnt = temporada - 1;
			// Obtiene el último número de capítulo de la temporada anterior
			capAnt = await BD_genericas.obtieneTodosPorCampos("capitulos", {
				coleccion_id: coleccion_id,
				temporada: tempAnt,
			})
				.then((n) => n.map((m) => m.capitulo))
				.then((n) => Math.max(...n));
		}
		// Averiguar los datos del capítulo posterior ********************
		// Obtiene datos de la colección y el capítulo
		let [ultCap, ultTemp] = await Promise.all([
			// Obtiene el último número de capítulo de la temporada actual
			BD_genericas.obtieneTodosPorCampos("capitulos", {
				coleccion_id: coleccion_id,
				temporada: temporada,
			})
				.then((n) => n.map((m) => m.capitulo))
				.then((n) => Math.max(...n)),
			// Obtiene el último número de temporada de la colección
			BD_genericas.obtienePorId("colecciones", coleccion_id).then((n) => n.cant_temporadas),
		]).then(([a, b]) => {
			return [a, b];
		});
		// Obtiene los datos del capítulo posterior (temporada y capítulo)
		let tempPost = temporada;
		let capPost = 0;
		if (temporada == ultTemp && capitulo == ultCap) capPost = false;
		else if (capitulo < ultCap) capPost = capitulo + 1;
		else {
			tempPost = temporada + 1;
			capPost = 1;
		}
		// Obtiene los ID
		let [capAntID, capPostID] = await Promise.all([
			// Obtiene el ID del capítulo anterior
			capAnt
				? BD_genericas.obtienePorCampos("capitulos", {
						coleccion_id: coleccion_id,
						temporada: tempAnt,
						capitulo: capAnt,
				  }).then((n) => n.id)
				: false,
			capPost
				? BD_genericas.obtienePorCampos("capitulos", {
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
	obtieneCapID: async (req, res) => {
		let {coleccion_id, temporada, capitulo} = req.query;
		let ID = await BD_genericas.obtienePorCampos("capitulos", {
			coleccion_id: coleccion_id,
			temporada: temporada,
			capitulo: capitulo,
		}).then((n) => n.id);
		return res.json(ID);
	},
	obtieneCapitulos: async (req, res) => {
		let datos = await BD_especificas.obtieneCapitulos(req.query.coleccion_id, req.query.temporada);
		return res.json(datos);
	},
};
