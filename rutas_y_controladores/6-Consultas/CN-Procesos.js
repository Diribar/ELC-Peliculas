"use strict";
// Definir variables
const Op = require("../../base_de_datos/modelos").Sequelize.Op;
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	filtrosPers: async (userID) => {
		// Obtiene los filtros personales
		let resultado = userID ? await BD_genericas.obtieneTodosPorCondicion("filtros_cabecera", {usuario_id: userID}) : [];
		if (resultado.length > 1) resultado.sort((a, b) => (a.nombre < b.nombre ? -1 : 1));
		// Le agrega el filtro estándar
		resultado.push(filtroEstandarCabecera);
		// Fin
		return resultado;
	},
	filtros: function () {
		// Variable 'filtros'
		let filtros = variables.filtrosConsultas;

		// Agrega las opciones de BD
		for (let campo in filtros) {
			// Le agrega el nombre del campo a cada bloque de información
			filtros[campo].codigo = campo;
			// Si no tiene opciones, le agrega las de la BD
			if (!filtros[campo].opciones) {
				filtros[campo].opciones = global[campo];
				if (campo == "epocas")
					filtros.epocas.opciones = filtros.epocas.opciones.map((n) => ({id: n.id, nombre: n.consulta}));
			}
		}

		// Agrega las opciones grupales para los RCLV
		for (let entidad in this.gruposConsultasRCLV)
			if (filtros[entidad]) filtros[entidad] = {...filtros[entidad], ...this.gruposConsultasRCLV[entidad]()};

		// Fin
		return filtros;
	},
	momento: {
		obtieneRCLVs: async (datos) => {
			// Variables
			const entidadesRCLV = variables.entidades.rclvs;
			const include = variables.entidades.prods;
			let rclvs = [];
			let condicion;

			// Rutina para obtener los RCLVs de los días 0, +1, +2
			for (let i = 0; i < 3; i++) {
				// Variables
				let dia_del_ano_id = datos.dia_del_ano_id + i;
				let dia = dia_del_ano_id;
				if (dia_del_ano_id > 366) dia_del_ano_id -= 366;
				let registros = [];

				// Obtiene los RCLV de las primeras cuatro entidades
				for (let entidad of entidadesRCLV) {
					// Salteo de la rutina para 'epocas_del_ano'
					if (entidad == "epocas_del_ano") continue;

					// Condicion estandar: RCLVs del dia y en status aprobado
					condicion = {id: {[Op.gt]: 10}, dia_del_ano_id, status_registro_id: aprobado_id};

					// Obtiene los RCLVs
					registros.push(
						await BD_genericas.obtieneTodosPorCondicionConInclude(entidad, condicion, include)
							// Deja solo los que tienen productos
							.then((n) => n.filter((m) => m.peliculas || m.colecciones || m.capitulos))
							// Le agrega su entidad
							.then((n) => n.map((m) => ({entidad, ...m, dia_del_ano_id: dia})))
					);
				}

				// Busca el registro de 'epoca_del_ano'
				const epoca_del_ano_id = dias_del_ano.find((n) => n.id == dia_del_ano_id).epoca_del_ano_id;
				if (epoca_del_ano_id != 1) {
					const condicion = {id: epoca_del_ano_id, status_registro_id: aprobado_id};
					registros.push(
						BD_genericas.obtieneTodosPorCondicionConInclude("epocas_del_ano", condicion, include)
							// Deja solo los que tienen productos
							.then((n) => n.filter((m) => m.peliculas || m.colecciones || m.capitulos))
							// Le agrega su entidad
							.then((n) => n.map((m) => ({entidad: "epocas_del_ano", ...m, dia_del_ano_id: dia})))
					);
				}

				// Espera y consolida la informacion
				await Promise.all(registros).then((n) => n.map((m) => rclvs.push(...m)));
			}

			// Elimina los repetidos
			if (rclvs.length)
				for (let i = rclvs.length - 1; i >= 0; i--) {
					let rclv = rclvs[i];
					if (i != rclvs.findIndex((n) => n.id == rclv.id && n.entidad == rclv.entidad)) rclvs.splice(i, 1);
				}

			// Fin
			return rclvs;
		},
		obtieneProds: (rclvs) => {
			// Variables
			let productos = [];

			// Obtiene los productos y los procesa
			// Obtiene sus productos
			for (let rclv of rclvs)
				for (let entidad of variables.entidades.prods) {
					// Variables
					let registros;

					// Obtiene los productos y los procesa
					if (rclv[entidad].length) {
						// Obtiene los productos
						registros = rclv[entidad];

						// Los procesa
						registros = registros
							// Filtra por los que estan aprobados
							.filter((n) => n.status_registro_id == aprobado_id)
							// Les agrega su entidad, dia_del_ano_id y prioridad_id
							.map((n) => ({...n, entidad, dia_del_ano_id: rclv.dia_del_ano_id, prioridad_id: rclv.prioridad_id}));

						// Los pasa a la variable que los acumula
						if (registros.length) productos.push(...registros);
					}
				}

			// Elimina los repetidos
			if (productos.length)
				for (let i = productos.length - 1; i >= 0; i--) {
					let producto = productos[i];
					if (i != productos.findIndex((n) => n.id == producto.id && n.entidad == producto.entidad))
						productos.splice(i, 1);
				}

			// Ordenamiento por fecha, prioridad, calificación y alta_term_en
			productos.sort((a, b) => {
				return false
					? false
					: a.dia_del_ano_id != b.dia_del_ano_id
					? a.dia_del_ano_id - b.dia_del_ano_id
					: a.prioridad_id != b.prioridad_id
					? b.prioridad_id - a.prioridad_id
					: a.calificacion != b.calificacion
					? b.calificacion - a.calificacion
					: a.alta_term_en != b.alta_term_en
					? b.alta_term_en - a.alta_term_en
					: 0;
			});

			// Fin
			return productos;
		},
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
		filtrosProd: (datos) => {
			// Variables
			let filtros = {};
			let condics = {status_registro_id: aprobado_id};
			let epocaEstreno;

			// Arma el filtro
			let campos = ["cfc", "ocurrio", "publicos", "epocasEstreno", "tiposLink"];
			campos.push("castellano", "tipos_actuacion", "musical", "palabrasClave");
			for (let campo of campos) if (datos[campo]) filtros[campo] = datos[campo];

			// Proceso para épocas de estreno
			if (filtros.epocasEstreno) {
				const epocasEstreno = variables.filtrosConsultas.epocasEstreno;
				epocaEstreno = epocasEstreno.opciones.find((n) => n.id == filtros.epocasEstreno);
			}

			// Ocurrió
			if (filtros.ocurrio) condics.ocurrio = filtros.ocurrio != "NO";
			if (filtros.ocurrio == "pers") condics.personaje_id = {[Op.ne]: 1};
			if (filtros.ocurrio == "hecho") condics.hecho_id = {[Op.ne]: 1};

			// Conversión de filtros de Producto
			if (filtros.cfc) condics.cfc = filtros.cfc == "CFC";
			if (filtros.publicos) condics.publico_id = filtros.publicos;
			if (filtros.epocasEstreno) condics.ano_estreno = {[Op.gte]: epocaEstreno.desde, [Op.lte]: epocaEstreno.hasta};
			if (filtros.tiposLink) {
				const tipo_id = filtros.tiposLink;
				if (tipo_id == "gratis") condics.links_gratuitos = SI;
				if (tipo_id == "todos") condics.links_general = SI;
				if (tipo_id == "sin") condics.links_general = NO;
				if (tipo_id == "soloPagos") {
					condics.links_gratuitos = {[Op.ne]: SI};
					condics.links_general = SI;
				}
			}
			if (filtros.castellano) {
				const castellano = filtros.castellano;
				if (castellano == "SI") condics.castellano = SI;
				if (castellano == "subt") condics.subtitulos = SI;
				if (castellano == "cast") condics[Op.or] = [{castellano: SI}, {subtitulos: SI}];
				if (castellano == "NO") condics[Op.and] = [{castellano: {[Op.ne]: SI}}, {subtitulos: {[Op.ne]: SI}}];
			}
			if (filtros.tipos_actuacion) condics.tipo_actuacion_id = filtros.tipos_actuacion;
			if (filtros.musical) condics.musical = prod.musical == "SI";

			// Fin
			return condics;
		},
		filtrosRCLV: (datos) => {
			// Variables
			let filtros = {};
			let condics = {
				status_registro_id: aprobado_id,
				id: {[Op.gt]: 10},
				[Op.and]: [],
			};

			// Arma el filtro
			let campos = ["epocas", "apMar", "canons", "rolesIglesia"];
			for (let campo of campos) if (datos[campo]) filtros[campo] = datos[campo];

			// Conversión de filtros de RCLV
			if (filtros.epocas && datos.entidad != "temas") condics.epoca_id = filtros.epocas;
			if (filtros.apMar) {
				if (datos.entidad == "personajes") condics.ap_mar_id = {[Op.ne]: 10};
				if (datos.entidad == "hechos") condics.ama = true;
			}
			if (filtros.canons) {
				if (filtros.canons == "sb")
					condics[Op.and].push({[Op.or]: [{canon_id: {[Op.like]: "ST%"}}, {canon_id: {[Op.like]: "BT%"}}]});
				if (filtros.canons == "vs")
					condics[Op.and].push({[Op.or]: [{canon_id: {[Op.like]: "VN%"}}, {canon_id: {[Op.like]: "SD%"}}]});
				if (filtros.canons == "nn") condics.canon_id = {[Op.like]: "NN%"};
			}
			if (filtros.rolesIglesia) {
				if (filtros.rolesIglesia == "la") condics.rol_iglesia_id = {[Op.like]: "L%"};
				if (filtros.rolesIglesia == "lc") condics.rol_iglesia_id = {[Op.like]: "LC%"};
				if (filtros.rolesIglesia == "rs")
					condics[Op.and].push({[Op.or]: [{rol_iglesia_id: {[Op.like]: "RE%"}}, {rol_iglesia_id: "SCV"}]});
				if (filtros.rolesIglesia == "pp") condics.rol_iglesia_id = "PPV";
				if (filtros.rolesIglesia == "ap") condics.rol_iglesia_id = "ALV";
				if (filtros.rolesIglesia == "sf") condics.rol_iglesia_id = {[Op.like]: "SF%"};
			}
			if (!condics[Op.and].length) delete condics[Op.and];

			// Fin
			return condics;
		},
		obtieneRCLVs: async function (datos) {
			// Variables
			let auxs = [];
			let rclvs = {};

			// Obtiene las entidades
			const entidades =
				datos.ocurrio == "pers"
					? ["personajes"]
					: datos.ocurrio == "hecho"
					? ["hechos"]
					: ["personajes", "hechos", "temas"];
			// Obtiene los registros de RCLV
			for (let entidad of entidades) {
				// Obtiene los filtros
				let filtros = this.filtrosRCLV({...datos, entidad});
				// Obtiene los registros
				auxs.push(BD_genericas.obtieneTodosPorCondicion(entidad, filtros).then((n) => n.map((m) => m.id)));
			}
			auxs = await Promise.all(auxs);
			entidades.forEach((entidad, i) => (rclvs[entidad] = auxs[i]));

			// Fin
			return rclvs;
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
