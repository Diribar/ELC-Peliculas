"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");

// *********** Controlador ***********
module.exports = {
	// Tridente: Detalle - Edición del Producto - Links
	obtieneColCap: async (req, res) => {
		const {entidad, id} = req.query;
		const objeto = {coleccion_id: id, temporada: 1, capitulo: 1};
		const ID =
			entidad == "colecciones"
				? await BD_genericas.obtienePorCondicion("capitulos", objeto).then((n) => n.id)
				: await BD_genericas.obtienePorId("capitulos", id).then((n) => n.coleccion_id);
		return res.json(ID);
	},
	obtieneCapAntPostID: async (req, res) => {
		let {id} = req.query;
		// Obtiene la coleccion_id, la temporada y el capítulo
		let {coleccion_id, temporada, capitulo} = await BD_genericas.obtienePorId("capitulos", id);
		// Averigua los datos del capítulo anterior **********************
		// Obtiene los datos del capítulo anterior (temporada y capítulo)
		let tempAnt = temporada;
		let capAnt = 0;
		if (temporada == 1 && capitulo == 1) capAnt = false;
		else if (capitulo > 1) capAnt = capitulo - 1;
		else {
			tempAnt = temporada - 1;
			// Obtiene el último número de capítulo de la temporada anterior
			let objeto = {coleccion_id, temporada: tempAnt};
			capAnt = await BD_genericas.maxValorPorCampos("capitulos", objeto, "capitulo");
		}
		// Averigua los datos del capítulo posterior ********************
		// Obtiene datos de la colección y el capítulo
		let objeto = {coleccion_id, temporada};
		let [ultCap, ultTemp] = await Promise.all([
			// Obtiene el último número de capítulo de la temporada actual
			BD_genericas.maxValorPorCampos("capitulos", objeto, "capitulo"),
			// Obtiene el último número de temporada de la colección
			BD_genericas.obtienePorId("colecciones", coleccion_id).then((n) => n.cant_temps),
		]);
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
		let objetoAnt = {coleccion_id, temporada: tempAnt, capitulo: capAnt};
		let objetoPost = {coleccion_id, temporada: tempPost, capitulo: capPost};
		let [capAntID, capPostID] = await Promise.all([
			// Obtiene el ID del capítulo anterior
			capAnt ? BD_genericas.obtienePorCondicion("capitulos", objetoAnt).then((n) => n.id) : false,
			capPost ? BD_genericas.obtienePorCondicion("capitulos", objetoPost).then((n) => n.id) : false,
		]);
		// // Enviar el resultado
		return res.json([capAntID, capPostID]);
	},
	obtieneCapID: async (req, res) => {
		let {coleccion_id, temporada, capitulo} = req.query;
		let ID = await BD_genericas.obtienePorCondicion("capitulos", {
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
	comentarioAutom: (req, res) => {
		const {id} = req.query;
		let coment_aut = motivos_rech_altas.find((n) => n.id == id).coment_aut;
		return res.json(coment_aut);
	},
	motivosRechAltas: (req, res) => {
		return res.json(motivos_rech_altas);
	},
};
