"use strict";

// Definir variables
const BD_especificas = require("../../funciones/1-BD/Especificas");
const BD_genericas = require("../../funciones/1-BD/Genericas");
const variables = require("../../funciones/2-Procesos/Variables");

// Controlador
module.exports = {
	// Quick Search
	quickSearch: async (req, res) => {
		// Variables
		const userID = req.session.usuario ? req.session.usuario.id : 0;
		const entidadesProd = variables.entidades.prods;
		const entidadesRCLV = variables.entidades.rclvs;
		const camposProds = ["nombreCastellano", "nombreOriginal"];
		const camposPers = ["nombre", "apodo"];
		let resultados = [];
		let datos = [];

		// Armado de la variable 'datos'
		for (let entidad of entidadesProd) datos.push({familia: "producto", entidad, campos: camposProds});
		for (let entidad of entidadesRCLV)
			datos.push({familia: "rclv", entidad, campos: entidad == "personajes" ? camposPers : ["nombre"]});

		// Rutina
		for (let dato of datos) {
			// Obtiene las condiciones
			const condiciones = BD_especificas.quickSearchCondics(req.query.palabras, dato.campos, userID);

			// Obtiene los registros que cumplen las condiciones
			let resultado = await BD_especificas.quickSearchRegistros(condiciones, dato);
			if (resultado.length) resultados.push(...resultado);
		}

		// Ordena los resultados, 1a prioridad: familia, 2a prioridad: nombre
		resultados.sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0));
		resultados.sort((a, b) => (a.familia < b.familia ? -1 : a.familia > b.familia ? 1 : 0));

		// Envia la info al FE
		return res.json(resultados);
	},
	horarioInicial: async (req, res) => {
		// Variables
		let {entidad, id} = req.query;
		// Obtiene el registro
		let registro = await BD_genericas.obtienePorId(entidad, id);
		let datos = {
			creadoEn: registro.creadoEn,
			creadoPor_id: registro.creadoPor_id,
			capturadoEn: registro.capturadoEn,
			capturadoPor_id: registro.capturadoPor_id,
			userID: req.session.usuario.id,
		};

		// Fin
		return res.json(datos);
	},
};
