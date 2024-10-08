"use strict";
// Variables
const procesos = require("./FM-FN-Procesos");

module.exports = {
	// Tridente: Detalle - Edición del Producto - Links
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
