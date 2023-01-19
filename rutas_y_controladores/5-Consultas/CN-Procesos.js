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
		// Variable 'camposFiltros'
		let camposFiltros = {...variables.camposFiltros};

		// Agrega las opciones de BD
		(() => {
			// Procesa cada campo
			for (let campo in camposFiltros) {
				// Si el campo no aplica para el 'layoutElegido', lo elimina
				if (!camposFiltros[campo].siempre && !camposFiltros[campo][layoutElegido]) {
					delete camposFiltros[campo];
					continue;
				}
				// Le agrega el nombre del campo a cada bloque de información
				camposFiltros[campo].codigo = campo;
				// Le agrega las opciones de la BD, si no tiene ninguna
				if (!camposFiltros[campo].opciones) {
					let opciones = global[campo];
					camposFiltros[campo].opciones = opciones ? opciones : [];
				}
			}
		})();

		// Agrega las opciones grupales
		// for (let entidad in )

		// Fin
		return camposFiltros;
	},
};
