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
		let entidades = variables.entidadesRCLV;

		// 1. RCLVs inactivos
		let IN = obtienePorEntidad({entidades, campoFecha: "sugerido_en", status_id: inactivo_id, userID}).then((n) =>
			n.filter((m) => m.sugerido_por_id != userID)
		);

		// 2. Aprobados
		let aprobados = obtienePorEntidad({entidades, campoFecha: "alta_revisada_en", status_id: aprobado_id, userID: 1});

		// Await
		[IN, aprobados] = await Promise.all([IN, aprobados]);

		// 2.1. Sin Avatar
		const SA = aprobados.filter((m) => !m.avatar && m.id > 2);

		// 2.2. Con solapamiento de fechas
		const SF = aprobados.filter((m) => m.solapam_fechas);

		// 2.3. Con fecha móvil
		const FM = aprobados.filter((m) => m.fecha_movil);

		// Fin
		return {IN, SA, SF, FM};
	},
};

let obtienePorEntidad = async ({entidades, campoFecha, status_id, userID, include}) => {
	// Variables
	let campos = {status_id, userID, include, campoFecha, include};
	let resultados1 = [];
	let resultados2 = [];

	// Rutina
	for (let entidad of entidades) resultados1.push(BD_especificas.MT_obtieneRegs({entidad, ...campos}));

	// Espera hasta tener todos los resultados
	await Promise.all(resultados1).then((resultados) => resultados.map((n) => resultados2.push(...n)));

	// Ordena
	resultados2.sort((a, b) => b.fechaRef - a.fechaRef);

	// Fin
	return resultados2;
};
