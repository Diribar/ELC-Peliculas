"use strict";

module.exports = {
	// Tridente: Detalle - Edición del Producto - Links
	obtieneColCap: async (req, res) => {
		const {entidad, id} = req.query;
		const objeto = {coleccion_id: id, temporada: 1, capitulo: 1};
		const ID =
			entidad == "colecciones"
				? await BD_genericas.obtienePorCondicion("capitulos", objeto).then((n) => n.id)
				: await BD_genericas.obtienePorId("capitulos", id).then((n) => n.coleccion_id);

		// Fin
		return res.json(ID);
	},
	obtieneCapAntPostID: async (req, res) => {
		// Variables
		let {id} = req.query;
		let {coleccion_id, temporada, capitulo} = await BD_genericas.obtienePorId("capitulos", id);

		// Obtiene la temporada y capítulo anteriores
		let tempAnt = temporada;
		let capAnt = 0;
		if (temporada == 1 && capitulo == 1) capAnt = null;
		else if (capitulo > 1) capAnt = capitulo - 1;
		else {
			// Obtiene el último número de capítulo de la temporada anterior
			tempAnt = temporada - 1;
			const objeto = {coleccion_id, temporada: tempAnt};
			capAnt = await BD_genericas.maxValorPorCondicion("capitulos", objeto, "capitulo");
		}

		// Obtiene la temporada y capítulo posteriores
		let objeto = {coleccion_id, temporada};
		let [ultCap, ultTemp] = await Promise.all([
			BD_genericas.maxValorPorCondicion("capitulos", objeto, "capitulo"), // Último número de capítulo de la temporada actual
			BD_genericas.obtienePorId("colecciones", coleccion_id).then((n) => n.cantTemps), // Último número de temporada de la colección
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
			capAnt ? BD_genericas.obtienePorCondicion("capitulos", objetoAnt).then((n) => n.id) : null,
			capPost ? BD_genericas.obtienePorCondicion("capitulos", objetoPost).then((n) => n.id) : null,
		]);

		// Envia el resultado
		return res.json([capAnt_id, capPost_id]);
	},
	obtieneCapID: async (req, res) => {
		// Variables
		const {coleccion_id, temporada, capitulo} = req.query;

		// Obtiene el ID
		const ID = await BD_genericas.obtienePorCondicion("capitulos", {
			coleccion_id: coleccion_id,
			temporada: temporada,
			capitulo: capitulo,
		}).then((n) => n.id);

		// Fin
		return res.json(ID);
	},
	obtieneCapitulos: async (req, res) => {
		// Variables
		const {coleccion_id, temporada} = req.query;

		// Obtiene los datos
		const datos = await BD_especificas.obtieneCapitulos(coleccion_id, temporada);

		// Fin
		return res.json(datos);
	},
	motivosRechAltas: (req, res) => {
		return res.json(motivosStatus);
	},
	actualizarVisibles: (req, res) => {
		// Variables
		const datos = JSON.parse(req.query.datos);
		const {circuito, familias, titulo, desplegar} = datos;

		// Crea el objeto si no existe
		if (!req.session) req.session = {};
		if (!req.session.tableros) req.session.tableros = {};
		if (!req.session.tableros[circuito]) req.session.tableros[circuito] = {};
		if (!req.session.tableros[circuito][familias]) req.session.tableros[circuito][familias] = {};

		// Guarda la session
		req.session.tableros[circuito][familias][titulo] = desplegar;

		// Fin
		return res.json();
	},
};
