"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	filtrosPers: async (userID) => {
		// Obtiene los filtros personales
		let resultado = userID
			? await BD_genericas.obtienePorCampos("filtros_cabecera", {usuario_id: userID})
			: [];
		if (!resultado) resultado = [];
		// Le agrega el filtro estándar
		if (!global.filtroEstandar) await variables.global_BD();
		resultado.push(global.filtroEstandar);
		// Fin
		return resultado;
	},
	camposFiltros: (layoutElegido) => {
		// Agrega las opciones de BD
		let qqq = (() => {
			// Variables
			let resultado = {...variables.camposFiltros};
			// Procesa cada campo
			for (let campo in resultado) {
				// Si el campo no aplica para el 'layoutElegido', lo elimina
				if (!resultado[campo].siempre && !resultado[campo][layoutElegido]) {
					delete resultado[campo];
					continue;
				}
				// Le agrega el nombre del campo a cada bloque de información
				resultado[campo].codigo = campo;
				// Le agrega las opciones de la BD, si no tiene ninguna
				if (!resultado[campo].opciones) {
					let opciones = global[campo];
					resultado[campo].opciones = opciones ? opciones : [];
				}
			}
			// Fin
			return resultado
		})();

		// Agrega opciones grupales

		// opcionesPersonajes();
		// Fin
		return qqq;
	},
};
