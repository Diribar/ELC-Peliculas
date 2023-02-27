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
	TC_obtieneProductos: async () => {
		// Variables
		let objeto;

		// Aprobados sin calificar
		objeto = {calificacion: null, status_registro_id: aprobado_id};
		let SC = obtieneProdsPorCampo(objeto).then((n) =>
			n.sort((a, b) => (a.alta_terminada_en < b.alta_terminada_en ? -1 : -1))
		);

		// Sin links
		objeto = {links_general: 1, status_registro_id: aprobado_id};
		let SL = obtieneProdsPorCampo(objeto).then((n) =>
			n.sort((a, b) => (a.alta_terminada_en < b.alta_terminada_en ? -1 : -1))
		);

		// Sin links gratuitos
		objeto = {links_gratuitos: 1, status_registro_id: aprobado_id};
		let SLG = obtieneProdsPorCampo(objeto).then((n) =>
			n.sort((a, b) => (a.alta_terminada_en < b.alta_terminada_en ? -1 : -1))
		);

		// Productos Inactivos
		objeto = {status_registro_id: inactivo_id};
		let IN = obtieneProdsPorCampo(objeto).then((n) => n.sort((a, b) => (a.sugerido_en < b.sugerido_en ? -1 : -1)));

		// Fin
		return await Promise.all([SC, SL, SLG, IN]);
	},
};
let obtieneProdsPorCampo = async (objeto) => {
	// Variables
	let entProds = variables.entidadesProd;
	let resultado = [];

	// Rutina
	for (let entProd of entProds) resultado.push(...(await BD_genericas.obtieneTodosPorCampos(entProd, objeto)));

	// Fin
	return resultado;
};
