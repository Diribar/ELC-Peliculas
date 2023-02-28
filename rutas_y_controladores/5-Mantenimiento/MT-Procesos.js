"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const validaPR = require("../2.1-Prod-RUD/PR-FN-Validar");

module.exports = {
	TC_obtieneProds: async (userID) => {
		// Variables
		let entidades = variables.entidadesProd;

		// PRODUCTOS
		// 1. Aprobados sin calificar (peliculas y colecciones)
		let SC = obtienePorEntidad({entidades, campoFecha: "alta_term_en", status_id: aprobado_id, userID})
			.then((n) => n.filter((m) => m.entidad != "capitulos"))
			.then((n) => n.filter((m) => !m.calificacion));
		// 2. Productos Inactivos (peliculas y colecciones)
		let IN = obtienePorEntidad({entidades, campoFecha: "sugerido_en", status_id: inactivo_id, userID})
			.then((n) => n.filter((m) => m.entidad != "capitulos"))
			.then((n) => n.filter((m) => m.sugerido_por_id != userID));

		// LINKS
		// 1. Sin links (peliculas y capítulos)
		let SL = obtienePorEntidad({entidades, campoFecha: "alta_term_en", status_id: aprobado_id, userID})
			.then((n) => n.filter((m) => m.entidad != "colecciones"))
			.then((n) => n.filter((m) => !m.links_general));
		// 2. Sin links gratuitos (peliculas y capítulos)
		let SLG = obtienePorEntidad({entidades, campoFecha: "alta_term_en", status_id: aprobado_id, userID})
			.then((n) => n.filter((m) => m.entidad != "colecciones"))
			.then((n) => n.filter((m) => m.links_general))
			.then((n) => n.filter((m) => !m.links_gratuitos));
		// 3. Sin links en castellano (peliculas y capítulos)
		let SLC = obtienePorEntidad({entidades, campoFecha: "alta_term_en", status_id: aprobado_id, userID})
			.then((n) => n.filter((m) => m.entidad != "colecciones"))
			.then((n) => n.filter((m) => m.links_general))
			.then((n) => n.filter((m) => !m.castellano));

		// Fin
		[SC, IN, SL, SLG, SLC] = await Promise.all([SC, IN, SL, SLG, SLC]);
		return {SC, IN, SL, SLG, SLC};
	},
	TC_obtieneRCLVs: async (userID) => {
		// Variables
		let autor_id = "nombre";
		let entidades = variables.entidadesRCLV;

		// 1. RCLVs inactivos
		let IN = obtienePorEntidad({entidades, campoFecha: "sugerido_en", status_id: inactivo_id, userID}).then((n) =>
			n.filter((m) => m.sugerido_por_id != userID)
		);
		// 2. Aprobado sin producto
		let campoFecha = "alta_analizada_en";
		let SP = obtienePorEntidad({entidades, campoFecha, autor_id: "creado_por_id", status_id: aprobado_id, userID: 1}).then(
			(n) => n.filter((m) => !m.prods_aprob)
		);

		// Fin
		[IN, SP] = await Promise.all([IN, SP]);
		return {IN, SP};
	},
};

let obtienePorEntidad = async ({entidades, status_id, userID, include, campoFecha, autor_id}) => {
	// Variables
	let campos = {status_id, userID, include, campoFecha, include};
	let resultados = [];

	// Rutina
	for (let entidad of entidades) resultados.push(...(await BD_especificas.MT_obtieneRegs({entidad, ...campos})));
	resultados.sort((a, b) => b.fechaRef - a.fechaRef);

	// Fin
	return resultados;
};
