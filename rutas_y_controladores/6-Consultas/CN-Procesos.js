"use strict";
// Definir variables
const Op = require("../../base_de_datos/modelos").Sequelize.Op;
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	filtrosPers: async (userID) => {
		// Obtiene los filtros personales
		let resultado = userID ? await BD_genericas.obtieneTodosPorCampos("filtros_cabecera", {usuario_id: userID}) : [];
		if (resultado.length > 1) resultado.sort((a, b) => (a.nombre < b.nombre ? -1 : 1));
		// Le agrega el filtro estándar
		resultado.push(filtroEstandarCabecera);
		// Fin
		return resultado;
	},
	filtros: function () {
		// Variable 'filtros'
		let filtros = {...variables.camposFiltros};

		// Agrega las opciones de BD
		for (let campo in filtros) {
			// Le agrega el nombre del campo a cada bloque de información
			filtros[campo].codigo = campo;
			// Si no tiene opciones, le agrega las de la BD
			if (!filtros[campo].opciones) filtros[campo].opciones = global[campo] ? global[campo] : [];
		}

		// Agrega las opciones grupales para los RCLV
		for (let entidad in this.gruposConsultasRCLV)
			if (filtros[entidad]) filtros[entidad] = {...filtros[entidad], ...this.gruposConsultasRCLV[entidad]()};

		// Fin
		return filtros;
	},
	gruposConsultasRCLV: {
		personajes: () => {
			// Época de nacimiento
			let epocasCons = epocas.map((n) => ({id: n.id, nombre: n.consulta, clase: "CFC VPC epoca"}));
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
					...epocasCons,
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
			let epocasCons = epocas.map((n) => ({id: n.id, nombre: n.consulta, clase: "CFC VPC epoca"}));
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
					...epocasCons,
				],
			};
			// Fin
			return resultado;
		},
	},
	API: {
		filtrosPorFamilia: (datos) => {
			// 1. Separa los filtros por familia
			let filtrosProd = ["cfc", "ocurrio", "publicos", "epocasEstreno", "tiposLink"];
			filtrosProd.push("castellano", "tipos_actuacion", "musical", "palabrasClave");
			let filtrosRCLV = ["ocurrio", "epoca_id", "apMar", "canons_id", "roles_iglesia_id"];

			// 2. Arma el filtro
			let filtros = {prod: {}, rclv: {}};
			for (let campo of filtrosProd) if (datos[campo]) filtros.prod[campo] = datos[campo];
			for (let campo of filtrosRCLV) if (datos[campo]) filtros.rclv[campo] = datos[campo];

			// 3. Elimina la familia sin información
			if (!Object.keys(filtros.prod).length) delete filtros.prod;
			if (!Object.keys(filtros.rclv).length) delete filtros.rclv;

			// Fin
			return filtros;
		},
		filtrosProd: (filtros) => {
			// Variables
			const {prod} = filtros;
			let condics = {status_registro_id: aprobado_id};
			let epocaEstreno;

			// Proceso para épocas de estreno
			if (prod.epocasEstreno) {
				const epocasEstreno = variables.camposFiltros.epocasEstreno;
				epocaEstreno = epocasEstreno.opciones.find((n) => n.id == prod.epocasEstreno);
			}

			// Conversión de filtros de Producto
			if (prod.cfc) condics.cfc = prod.cfc == "CFC";
			if (prod.ocurrio) condics.ocurrio = prod.ocurrio != "NO";
			if (prod.ocurrio != "NO") {
				if (prod.ocurrio == "pers") condics.personaje_id = {[Op.ne]: 1};
				if (prod.ocurrio == "hecho") condics.hecho_id = {[Op.ne]: 1};
			}
			if (prod.publicos) condics.publico_id = prod.publicos;
			if (prod.epocasEstreno) condics.ano_estreno = {[Op.gte]: epocaEstreno.desde, [Op.lte]: epocaEstreno.hasta};
			if (prod.tiposLink) {
				const tipo_id = prod.tiposLink;
				if (tipo_id == "gratis") condics.links_gratuitos = SI;
				if (tipo_id == "todos") condics.links_general = SI;
				if (tipo_id == "sin") condics.links_general = NO;
				if (tipo_id == "soloPagos") {
					condics.links_gratuitos = {[Op.ne]: SI};
					condics.links_general = SI;
				}
			}
			if (prod.castellano) {
				const castellano = prod.castellano;
				if (castellano == "SI") condics.castellano = SI;
				if (castellano == "subt") condics.subtitulos = SI;
				if (castellano == "cast") condics[Op.or] = [{castellano: SI}, {subtitulos: SI}];
				if (castellano == "NO") condics[Op.and] = [{castellano: {[Op.ne]: SI}}, {subtitulos: {[Op.ne]: SI}}];
			}
			if (prod.tipos_actuacion) condics.tipo_actuacion_id = prod.tipos_actuacion;
			if (prod.musical) condics.musical = prod.musical == "SI";

			// Fin
			return condics;
		},
		filtrosRCLV: (filtros) => {
			// Variables
			const {rclv} = filtros;
			let condicsRCLV = {status_registro_id: aprobado_id};

			// Conversión de filtros de RCLV

			// Fin
			return condicsRCLV;
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
