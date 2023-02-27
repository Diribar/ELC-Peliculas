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
		resultado.push(filtroEstandar);
		// Fin
		return resultado;
	},
	camposFiltros: function (layoutElegido) {
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
		for (let entidad in this.gruposConsultas) {
			let resultado = this.gruposConsultas[entidad]();
			camposFiltros[entidad] = {...camposFiltros[entidad], ...resultado};
		}

		// Fin
		return camposFiltros;
	},
	gruposConsultas: {
		personajes: () => {
			// Época de nacimiento
			let epocas = epocas.filter((n) => n.nombre_pers);
			epocas = epocas.map((n) => {
				return {id: n.id, nombre: n.nombre_pers, clase: "CFC VPC epoca"};
			});
			// Proceso de canonización
			let procs_canon = procs_canon.filter((n) => n.id.length == 2);
			procs_canon = puleCampos(procs_canon, "CFC procs_canon");
			// Roles Iglesia
			let roles_iglesia = roles_iglesia.filter((n) => n.personaje && n.id.length == 2);
			roles_iglesia = puleCampos(roles_iglesia, "CFC roles_iglesia");
			// Consolidación
			let resultado = {
				grupo_personajes: [
					{nombre: "Época de vida", clase: "CFC VPC"},
					{id: "JSS", nombre: "Jesús", clase: "CFC VPC epoca"},
					...epocas,
					{nombre: "Proceso de Canonización", clase: "CFC"},
					...procs_canon,
					{nombre: "Rol en la Iglesia", clase: "CFC"},
					...roles_iglesia,
					{nombre: "Listado de Personajes", clase: "CFC VPC"},
				],
			};
			// Fin
			return resultado;
		},
	},
};
let puleCampos = (campo, clase) => {
	// Obtiene los campos necesarios
	campo = campo.map((n) => {
		return {id: n.id, nombre: n.nombre, clase};
	});
	// Fin
	return campo;
};
