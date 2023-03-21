"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	filtrosPers: async (userID) => {
		// Obtiene los filtros personales
		let resultado = userID ? await BD_genericas.obtienePorCampos("filtros_cabecera", {usuario_id: userID}) : [];
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
		for (let campo in camposFiltros) {
			// Si el campo no aplica para el 'layoutElegido', lo elimina
			if (!camposFiltros[campo].siempre && !camposFiltros[campo][layoutElegido]) delete camposFiltros[campo];
			else {
				// Le agrega el nombre del campo a cada bloque de información
				camposFiltros[campo].codigo = campo;
				// Si no tiene opciones, le agrega las de la BD
				if (!camposFiltros[campo].opciones) camposFiltros[campo].opciones = global[campo] ? global[campo] : [];
			}
		}

		// Agrega las opciones grupales
		for (let entidad in this.gruposConsultas)
			if (camposFiltros[entidad]) camposFiltros[entidad] = {...camposFiltros[entidad], ...this.gruposConsultas[entidad]()};

		// Fin
		return camposFiltros;
	},
	gruposConsultas: {
		personajes: () => {
			// Época de nacimiento
			let epocas = epocas_pers.map((n) => ({id: n.id, nombre: n.consulta, clase: "CFC VPC epoca"}));
			// Proceso de canonización
			let canonsCons = canons.filter((n) => n.id.endsWith("N"));
			canonsCons = preparaCampos(canonsCons, "CFC canons");
			// Roles Iglesia
			let rolesIglesiaCons = roles_iglesia.filter((n) => n.personaje && n.id.endsWith("N"));
			rolesIglesiaCons = preparaCampos(rolesIglesiaCons, "CFC roles_iglesia");
			// Consolidación
			let resultado = {
				grupo_personajes: [
					{nombre: "Época de vida", clase: "CFC VPC"},
					{id: "JSS", nombre: "Jesús", clase: "CFC VPC epoca"},
					...epocas,
					{nombre: "Proceso de Canonización", clase: "CFC"},
					...canonsCons,
					{nombre: "Rol en la Iglesia", clase: "CFC"},
					...rolesIglesiaCons,
				],
			};
			// Fin
			return resultado;
		},
		hechos: () => {
			// Epoca de ocurrencia
			let epocas = epocas_hechos.map((n) => ({id: n.id, nombre: n.consulta, clase: "CFC VPC epoca"}));
			// Apariciones Marianas

			// Específico de la Iglesia Católica
			// Consolidación
			let resultado = {
				grupo_hechos: [
					{nombre: "Criterios Particulares", clase: "CFC"},
					{id: "ama", nombre: "Apariciones Marianas", clase: "CFC VPC ama"},
					{id: "solo_cfc1", nombre: "Historia de la Iglesia Católica", clase: "CFC VPC solo_cfc1"},
					{id: "solo_cfc0", nombre: "Historia General", clase: "CFC VPC solo_cfc0"},
					{nombre: "Época de ocurrencia", clase: "CFC VPC"},
					...epocas,
				],
			};
			// Fin
			return resultado;
		},
	},
};
let preparaCampos = (campos, clase) => {
	// Obtiene los campos necesarios
	campos = campos.map((n) => {
		return {id: n.id, nombre: n.plural ? n.plural : n.nombre, clase};
	});
	// Fin
	return campos;
};
