"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");

// Controlador
module.exports = {
	// Quick Search
	quickSearch: async (req, res) => {
		// Obtener las condiciones
		let condiciones = BD_especificas.quickSearchCondiciones(req.query.palabras);
		// Obtener los productos que cumplen las condiciones
		let productos = await BD_especificas.quickSearchProductos(condiciones);
		// Enviar la info al FE
		return res.json(productos);
	},

	horarioInicial: async (req, res) => {
		let {entidad, id, codigo} = req.query;
		let objeto = {id: id};
		if (codigo == "/producto/edicion/") {
			let entidad_id = funciones.entidad_id(entidad);
			entidad = "prods_edicion";
			objeto = {
				[entidad_id]: id,
				editado_por_id: req.session.usuario.id,
			};
		}

		let horarioInicial = await BD_genericas.obtenerPorCampos(entidad, objeto);
		if (horarioInicial) {
			let campo =
				codigo == "/producto/edicion/"
					? "editado_en"
					: codigo.startsWith("/revision/")
					? "capturado_en"
					: "";
			horarioInicial = horarioInicial[campo];
		}
		return res.json(horarioInicial);
	},
};
