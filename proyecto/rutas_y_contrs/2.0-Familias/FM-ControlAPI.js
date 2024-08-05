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
		const {id} = req.query;
		const statusRegistro_id = activos_ids;
		let condicAnt, condicPost;

		// Obtiene datos del capítulo actual
		const {coleccion_id, temporada, capitulo} = await baseDeDatos.obtienePorId("capitulos", id);
		const condicEstandar = {coleccion_id, temporada, statusRegistro_id};

		// Obtiene datos de la colección
		const ultTemp = await baseDeDatos.obtienePorId("colecciones", coleccion_id).then((n) => n.cantTemps); // Último número de temporada de la colección
		const ultCap = await baseDeDatos.maxValorPorCondicion("capitulos", condicEstandar, "capitulo"); // Último número de capítulo de la temporada actual

		// Obtiene la temporada y capítulo anteriores
		let capAnt = null;
		if (temporada > 1 || capitulo > 1) {
			// Establece la condición
			condicAnt = {...condicEstandar};
			if (capitulo == 1) condicAnt.temporada = temporada - 1;
			else condicAnt.capitulo = {[Op.lt]: capitulo};

			// Busca el capítulo anterior
			capAnt = baseDeDatos.maxValorPorCondicion("capitulos", condicAnt, "capitulo").then((n) => (n ? n : null));
		}

		// Obtiene la temporada y capítulo posteriores
		let capPost = null;
		if (temporada != ultTemp || capitulo != ultCap) {
			// Establece la condición
			condicPost = {...condicEstandar};
			if (capitulo == ultCap) condicPost.temporada = temporada + 1;
			else condicPost.capitulo = {[Op.gt]: capitulo};

			// Busca el capítulo posterior
			capPost = baseDeDatos.minValorPorCondicion("capitulos", condicPost, "capitulo").then((n) => (n ? n : null));
		}
		[capAnt, capPost] = await Promise.all([capAnt, capPost]);

		// Obtiene los ID
		if (capAnt) condicAnt.capitulo = capAnt;
		if (capPost) condicPost.capitulo = capPost;
		const [capAnt_id, capPost_id] = await Promise.all([
			capAnt ? baseDeDatos.obtienePorCondicion("capitulos", condicAnt).then((n) => n.id) : null,
			capPost ? baseDeDatos.obtienePorCondicion("capitulos", condicPost).then((n) => n.id) : null,
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
