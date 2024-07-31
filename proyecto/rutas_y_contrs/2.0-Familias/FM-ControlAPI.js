"use strict";
// Variables
const procesos = require("./FM-FN-Procesos");

module.exports = {
	// Tridente: Detalle - Edición del Producto - Links
	obtieneColCap: async (req, res) => {
		const {entidad, id} = req.query;
		const condicion = {coleccion_id: id, temporada: 1, capitulo: 1};
		const ID =
			entidad == "colecciones"
				? await baseDeDatos.obtienePorCondicion("capitulos", condicion).then((n) => n.id)
				: await baseDeDatos.obtienePorId("capitulos", id).then((n) => n.coleccion_id);

		// Fin
		return res.json(ID);
	},
	obtieneCapAntPostID: async (req, res) => {
		// Variables
		let {id} = req.query;
		let {coleccion_id, temporada, capitulo} = await baseDeDatos.obtienePorId("capitulos", id);

		// Obtiene la temporada y capítulo anteriores
		let tempAnt = temporada;
		let capAnt = 0;
		if (temporada == 1 && capitulo == 1) capAnt = null;
		else if (capitulo > 1) capAnt = capitulo - 1;
		else {
			// Obtiene el último número de capítulo de la temporada anterior
			tempAnt = temporada - 1;
			const condicion = {coleccion_id, temporada: tempAnt};
			capAnt = await baseDeDatos.maxValorPorCondicion("capitulos", condicion, "capitulo");
		}

		// Obtiene la temporada y capítulo posteriores
		const condicion = {coleccion_id, temporada, statusRegistro_id: activos_ids};
		const [ultCap, ultTemp] = await Promise.all([
			baseDeDatos.maxValorPorCondicion("capitulos", condicion, "capitulo"), // Último número de capítulo de la temporada actual
			baseDeDatos.obtienePorId("colecciones", coleccion_id).then((n) => n.cantTemps), // Último número de temporada de la colección
		]);
		let tempPost = temporada;
		let capPost = 0;
		if (temporada == ultTemp && capitulo == ultCap) capPost = null;
		else if (capitulo < ultCap) capPost = capitulo + 1;
		else {
			tempPost = temporada + 1;
			capPost = 1;
		}

		// Obtiene los ID
		let objetoAnt = {coleccion_id, temporada: tempAnt, capitulo: capAnt};
		let objetoPost = {coleccion_id, temporada: tempPost, capitulo: capPost};
		let [capAnt_id, capPost_id] = await Promise.all([
			// Obtiene el ID del capítulo anterior
			capAnt ? baseDeDatos.obtienePorCondicion("capitulos", objetoAnt).then((n) => n.id) : null,
			capPost ? baseDeDatos.obtienePorCondicion("capitulos", objetoPost).then((n) => n.id) : null,
		]);

		// Envia el resultado
		return res.json([capAnt_id, capPost_id]);
	},
	obtieneCapID: async (req, res) => {
		// Variables
		const {coleccion_id, temporada, capitulo} = req.query;

		// Obtiene el ID
		const ID = await baseDeDatos
			.obtienePorCondicion("capitulos", {
				coleccion_id: coleccion_id,
				temporada: temporada,
				capitulo: capitulo,
			})
			.then((n) => n.id);

		// Fin
		return res.json(ID);
	},
	obtieneCapitulos: async (req, res) => {
		// Variables
		const {coleccion_id, temporada} = req.query;

		// Obtiene los datos
		const datos = await procesos.obtieneCapitulos(coleccion_id, temporada);

		// Fin
		return res.json(datos);
	},
	obtieneInfo: (req, res) => {
		// Variables
		const {entidad} = req.query;
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);

		// Obtiene los motivos
		const motivos = statusMotivos.filter((m) => m[petitFamilias]);

		// Fin
		return res.json({motivos, largoComentario});
	},
	obtieneRegistro: async (req, res) => {
		const {entidad, id} = req.query;
		const registro = await baseDeDatos.obtienePorId(entidad, id);
		return res.json(registro);
	},
};
