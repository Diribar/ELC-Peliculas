"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");

module.exports = {
	filtrosPers: async (userID) => {
		// Obtiene los filtros personales
		let resultado = userID ? await BD_genericas.obtieneTodosPorCondicion("filtrosCabecera", {usuario_id: userID}) : [];
		if (resultado.length > 1) resultado.sort((a, b) => (a.nombre < b.nombre ? -1 : 1));
		// Le agrega el filtro estándar
		resultado.push(filtroEstandarCabecera);
		// Fin
		return resultado;
	},
	filtros: function () {
		// Variable 'filtros'
		let filtros = {...variables.filtrosConsultas};

		// Agrega campos
		for (let campo in filtros) {
			// Le agrega el nombre del campo a cada método
			filtros[campo].codigo = campo;

			// Si no tiene opciones, le agrega las de la BD
			if (!filtros[campo].opciones) {
				if (campo == "epocasSinVarias")
					filtros.epocasSinVarias.opciones = epocas.map((n) => ({id: n.id, nombre: n.consulta}));
				else filtros[campo].opciones = global[campo];
			}
		}

		// Cambia el método a 'epocas'
		filtros.epocas = filtros.epocasSinVarias;
		filtros.epocas.codigo = "epocas";
		delete filtros.epocasSinVarias;

		// Agrega las opciones grupales para los RCLV
		// if (filtros[entidad])
		for (let entidad in this.gruposConsultasRCLV)
			filtros[entidad] = {...filtros[entidad], ...this.gruposConsultasRCLV[entidad]()};

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
				let diaDelAno_id = datos.diaDelAno_id + i;
				let dia = diaDelAno_id;
				if (diaDelAno_id > 366) diaDelAno_id -= 366;
				let registros = [];

				// Obtiene los RCLV de las primeras cuatro entidades
				for (let entidad of entidadesRCLV) {
					// Salteo de la rutina para 'epocasDelAno'
					if (entidad == "epocasDelAno") continue;

					// Condicion estandar: RCLVs del dia y en status aprobado
					condicion = {id: {[Op.gt]: 10}, diaDelAno_id, statusRegistro_id: aprobado_id};

					// Obtiene los RCLVs
					registros.push(
						await BD_genericas.obtieneTodosPorCondicionConInclude(entidad, condicion, include)
							// Deja solo los que tienen productos
							.then((n) => n.filter((m) => m.peliculas || m.colecciones || m.capitulos))
							// Le agrega su entidad
							.then((n) => n.map((m) => ({entidad, ...m, diaDelAno_id: dia})))
					);
				}

				// Busca el registro de 'epocaDelAno'
				const epocaDelAno_id = diasDelAno.find((n) => n.id == diaDelAno_id).epocaDelAno_id;
				if (epocaDelAno_id != 1) {
					const condicion = {id: epocaDelAno_id, statusRegistro_id: aprobado_id};
					registros.push(
						BD_genericas.obtieneTodosPorCondicionConInclude("epocasDelAno", condicion, include)
							// Deja solo los que tienen productos
							.then((n) => n.filter((m) => m.peliculas || m.colecciones || m.capitulos))
							// Le agrega su entidad
							.then((n) => n.map((m) => ({entidad: "epocasDelAno", ...m, diaDelAno_id: dia})))
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
							.filter((n) => n.statusRegistro_id == aprobado_id)
							// Les agrega su entidad, diaDelAno_id y prioridad_id
							.map((n) => ({...n, entidad, diaDelAno_id: rclv.diaDelAno_id, prioridad_id: rclv.prioridad_id}));

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

			// Ordenamiento por fecha, prioridad, calificación y altaTermEn
			productos.sort((a, b) => {
				return false
					? false
					: a.diaDelAno_id != b.diaDelAno_id
					? a.diaDelAno_id - b.diaDelAno_id
					: a.prioridad_id != b.prioridad_id
					? b.prioridad_id - a.prioridad_id
					: a.calificacion != b.calificacion
					? b.calificacion - a.calificacion
					: a.altaTermEn != b.altaTermEn
					? b.altaTermEn - a.altaTermEn
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
			let condics = {statusRegistro_id: aprobado_id};
			let epocaEstreno;

			// Arma el filtro
			let campos = ["cfc", "ocurrio", "publicos", "epocasEstreno", "tiposLink"];
			campos.push("castellano", "tiposActuacion", "musical", "palabrasClave");
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
			if (filtros.epocasEstreno) condics.anoEstreno = {[Op.gte]: epocaEstreno.desde, [Op.lte]: epocaEstreno.hasta};
			if (filtros.tiposLink) {
				const tipo_id = filtros.tiposLink;
				if (tipo_id == "gratis") condics.linksGratuitos = SI;
				if (tipo_id == "todos") condics.linksGeneral = SI;
				if (tipo_id == "sin") condics.linksGeneral = NO;
				if (tipo_id == "soloPagos") {
					condics.linksGratuitos = {[Op.ne]: SI};
					condics.linksGeneral = SI;
				}
			}
			if (filtros.castellano) {
				const castellano = filtros.castellano;
				if (castellano == "SI") condics.castellano = SI;
				if (castellano == "subt") condics.subtitulos = SI;
				if (castellano == "cast") condics[Op.or] = [{castellano: SI}, {subtitulos: SI}];
				if (castellano == "NO") condics[Op.and] = [{castellano: {[Op.ne]: SI}}, {subtitulos: {[Op.ne]: SI}}];
			}
			if (filtros.tiposActuacion) condics.tipoActuacion_id = filtros.tiposActuacion;
			if (filtros.musical) condics.musical = prod.musical == "SI";

			// Fin
			return condics;
		},
		filtrosRCLV: (datos) => {
			// Variables
			let filtros = {};
			let condics = {
				statusRegistro_id: aprobado_id,
				id: {[Op.gt]: 10},
				[Op.and]: [],
			};

			// Arma el filtro
			let campos = ["epocas", "apMar", "canons", "rolesIglesia"];
			for (let campo of campos) if (datos[campo]) filtros[campo] = datos[campo];

			// Conversión de filtros de RCLV
			if (filtros.epocas && datos.entidad != "temas") condics.epoca_id = filtros.epocas;
			if (filtros.apMar) {
				if (datos.entidad == "personajes") condics.apMar_id = {[Op.ne]: 10};
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
				if (filtros.rolesIglesia == "la") condics.rolIglesia_id = {[Op.like]: "L%"};
				if (filtros.rolesIglesia == "lc") condics.rolIglesia_id = {[Op.like]: "LC%"};
				if (filtros.rolesIglesia == "rs")
					condics[Op.and].push({[Op.or]: [{rolIglesia_id: {[Op.like]: "RE%"}}, {rolIglesia_id: "SCV"}]});
				if (filtros.rolesIglesia == "pp") condics.rolIglesia_id = "PPV";
				if (filtros.rolesIglesia == "ap") condics.rolIglesia_id = "ALV";
				if (filtros.rolesIglesia == "sf") condics.rolIglesia_id = {[Op.like]: "SF%"};
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
