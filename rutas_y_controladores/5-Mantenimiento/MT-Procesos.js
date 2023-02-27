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
	TC_obtieneProductos: async (userID) => {
		// 1. Altas sin edición (peliculas y colecciones)
		let SE = obtieneProdsPorCampo({
			campoFecha: "creado_en",
			autor_id: "status_registro_id",
			status_id: 9,
			userID,
			include: "ediciones",
		})
			.then((n) => n.filter((m) => m.entidad != "capitulos"))
			.then((n) => n.filter((m) => !m.ediciones.length))
			.then((n) => n.sort((a, b) => a.creado_en - b.creado_en));

		// 2. Aprobados sin calificar (peliculas y colecciones)
		let SC = obtieneProdsPorCampo({
			campoFecha: "alta_term_en",
			autor_id: "status_registro_id",
			status_id: aprobado_id,
			userID,
		})
			.then((n) => n.filter((m) => m.entidad != "capitulos"))
			.then((n) => n.filter((m) => !m.calificacion))
			.then((n) => n.sort((a, b) => a.alta_term_en - b.alta_term_en));

		// 3. Sin links (peliculas y capítulos)
		let SL = obtieneProdsPorCampo({
			campoFecha: "alta_term_en",
			autor_id: "status_registro_id",
			status_id: aprobado_id,
			userID,
		})
			.then((n) => n.filter((m) => m.entidad != "colecciones"))
			.then((n) => n.filter((m) => !m.links_general))
			.then((n) => n.sort((a, b) => a.alta_term_en - b.alta_term_en));

		// 4. Sin links gratuitos (peliculas y capítulos)
		let SLG = obtieneProdsPorCampo({
			campoFecha: "alta_term_en",
			autor_id: "status_registro_id",
			status_id: aprobado_id,
			userID,
		})
			.then((n) => n.filter((m) => m.entidad != "colecciones"))
			.then((n) => n.filter((m) => m.links_general))
			.then((n) => n.filter((m) => !m.links_gratuitos))
			.then((n) => n.sort((a, b) => a.alta_term_en - b.alta_term_en));

		// 5. Productos Inactivos (peliculas y colecciones)
		let IN = obtieneProdsPorCampo({
			campoFecha: "sugerido_en",
			autor_id: "status_registro_id",
			status_id: inactivo_id,
			userID,
		})
			.then((n) => n.filter((m) => m.entidad != "capitulos"))
			.then((n) => n.sort((a, b) => a.sugerido_en - b.sugerido_en));

		// Fin
		[SE, SC, SL, SLG, IN] = await Promise.all([SE, SC, SL, SLG, IN]);
		return {SE, SC, SL, SLG, IN};
	},
};
let obtieneProdsPorCampo = async ({status_id, userID, include, campoFecha, autor_id}) => {
	// Variables
	let campos = {status_id, userID, include, campoFecha, autor_id, include};
	let entidades = variables.entidadesProd;
	let resultados = [];

	// Rutina
	for (let entidad of entidades) resultados.push(...(await BD_especificas.TC_obtieneRegs({entidad, ...campos})));

	// Elimina los que tienen problema de captura
	// const haceUnaHora = comp.nuevoHorario(-1);
	// const haceDosHoras = comp.nuevoHorario(-2);
	// for (let i = resultados.length - 1; i >= 0; i--) {
	// 	let res = resultados[i];
	// 	// Captura activa por otro usuario
	// 	if (res.capturado_en && res.capturado_en > haceUnaHora && res.captura_activa && res.capturado_por_id != userID)
	// 		resultados.splice(i, 1);
	// 	// Capturado propio entre 1 y 2 horas
	// 	else if (
	// 		res.capturado_en &&
	// 		res.capturado_en < haceUnaHora &&
	// 		res.capturado_en > haceDosHoras &&
	// 		res.capturado_por_id == userID
	// 	)
	// 		resultados.splice(i, 1);
	// }

	// Fin
	return resultados;
};
