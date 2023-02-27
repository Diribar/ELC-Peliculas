"use strict";
// Definir variables
const path = require("path");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const validaPR = require("../2.1-Prod-RUD/PR-FN-Validar");

module.exports = {
	TC_obtieneProds: async (userID) => {
		// Variables
		let autor_id = "fuente";
		let include = "ediciones";
		let entidades = variables.entidadesProd;

		// 1. Altas sin edición (peliculas y colecciones)
		let SE = obtienePorEntidad({entidades, campoFecha: "creado_en", autor_id, status_id: creado_aprob_id, userID, include})
			.then((n) => n.filter((m) => m.entidad != "capitulos"))
			.then((n) => n.filter((m) => !m.ediciones.length))
			.then((n) => n.sort((a, b) => a.fechaRef - b.fechaRef));

		// 2. Aprobados sin calificar (peliculas y colecciones)
		let SC = obtienePorEntidad({entidades, campoFecha: "alta_term_en", autor_id, status_id: aprobado_id, userID})
			.then((n) => n.filter((m) => m.entidad != "capitulos"))
			.then((n) => n.filter((m) => !m.calificacion))
			.then((n) => n.sort((a, b) => a.fechaRef - b.fechaRef));

		// 3. Sin links (peliculas y capítulos)
		let SL = obtienePorEntidad({entidades, campoFecha: "alta_term_en", autor_id, status_id: aprobado_id, userID})
			.then((n) => n.filter((m) => m.entidad != "colecciones"))
			.then((n) => n.filter((m) => !m.links_general))
			.then((n) => n.sort((a, b) => a.fechaRef - b.fechaRef));

		// 4. Sin links gratuitos (peliculas y capítulos)
		let SLG = obtienePorEntidad({entidades, campoFecha: "alta_term_en", autor_id, status_id: aprobado_id, userID})
			.then((n) => n.filter((m) => m.entidad != "colecciones"))
			.then((n) => n.filter((m) => m.links_general))
			.then((n) => n.filter((m) => !m.links_gratuitos))
			.then((n) => n.sort((a, b) => a.fechaRef - b.fechaRef));

		// 5. Productos Inactivos (peliculas y colecciones)
		let IN = obtienePorEntidad({entidades, campoFecha: "sugerido_en", autor_id, status_id: inactivo_id, userID})
			.then((n) => n.filter((m) => m.entidad != "capitulos"))
			.then((n) => n.sort((a, b) => a.fechaRef - b.fechaRef));

		// Fin
		[SE, SC, SL, SLG, IN] = await Promise.all([SE, SC, SL, SLG, IN]);
		return {SE, SC, SL, SLG, IN};
	},
	TC_obtieneRCLVs: async (userID) => {
		// Variables
		let autor_id = "nombre";
		let entidades = variables.entidadesRCLV;

		// 1. RCLVs Inactivos
		let IN = obtienePorEntidad({entidades, campoFecha: "sugerido_en", autor_id, status_id: inactivo_id, userID}).then((n) =>
			n.sort((a, b) => a.fechaRef - b.fechaRef)
		);

		// Fin
		[IN] = await Promise.all([IN]);
		return {IN};
	},
};
let obtienePorEntidad = async ({entidades, status_id, userID, include, campoFecha, autor_id}) => {
	// Variables
	let campos = {status_id, userID, include, campoFecha, autor_id, include};
	let resultados = [];

	// Rutina
	for (let entidad of entidades) resultados.push(...(await BD_especificas.TC_obtieneRegs({entidad, ...campos})));

	// Fin
	return resultados;
};
