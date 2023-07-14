"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");

module.exports = {
	configs: {
		cabecera: async (userID) => {
			// Obtiene los filtros personalizados propios y de ELC
			const usuario_id = [1, userID];
			const configsDeCabecera = await BD_genericas.obtieneTodosPorCondicion("configsCons", {usuario_id});

			// Los ordena alfabéticamente
			configsDeCabecera.sort((a, b) => (a.nombre < b.nombre ? -1 : 1));

			// Fin
			return configsDeCabecera;
		},
		campos: function () {
			// Variable 'filtros'
			let campos = {...variables.camposConsultas};

			// Agrega los campos de código y opciones
			for (let campo in campos) {
				// Le agrega el nombre del campo a cada método
				campos[campo].codigo = campo;

				// Si no tiene opciones, le agrega las de la BD
				if (!campos[campo].opciones) {
					if (campo == "epocasOcurrencia")
						campos.epocasOcurrencia.opciones = epocasOcurrencia
							.filter((n) => !n.varias)
							.map((n) => ({id: n.id, nombre: n.consulta}));
					else campos[campo].opciones = global[campo];
				}
			}

			// Fin
			return campos;
		},
	},
	resultados: {
		obtieneProds: async function (configCons) {
			// Variables
			const {orden_id, apMar, rolesIgl, canons} = configCons;
			let entidades = ["peliculas", "colecciones"];
			let condiciones = {statusRegistro_id: aprobado_id};
			let productos = [];
			let resultados = [];

			// Particularidades
			if (orden_id == 1) entidades.push("capitulos"); // Para el orden 'Momento del año', agrega la entidad 'capitulos'
			if (orden_id == 2) condiciones = {...condiciones, calificacion: {[Op.gte]: 70}, azar: {[Op.ne]: null}}; // Para el orden 'Sorprendeme', agrega pautas en las condiciones
			if (orden_id == 5) condiciones = {...condiciones, calificacion: {[Op.ne]: null}}; // Para el orden 'Por calificación', agrega pautas en las condiciones

			// Agrega las preferencias
			const prefs = this.prefs.prods(configCons);
			condiciones = {...condiciones, ...prefs};

			// Obtiene el include
			let include;
			apMar ? (include = ["personaje", "hecho"]) : rolesIgl || canons ? (include = "personaje") : null;

			// Obtiene los productos
			for (let entidad of entidades)
				productos.push(
					(include
						? BD_genericas.obtieneTodosPorCondicionConInclude(entidad, condiciones, include)
						: BD_genericas.obtieneTodosPorCondicion(entidad, condiciones)
					).then((n) => n.map((m) => ({...m, entidad})))
				);
			await Promise.all(productos).then((n) => n.map((m) => resultados.push(...m)));

			// Filtrar por apMar, rolesIgl, canons
			if (apMar && resultados.length) {
				if (apMar == "SI")
					resultados = resultados.filter(
						(n) => (n.personaje_id > 10 && n.personaje.apMar_id != 10) || (n.hecho_id > 10 && n.hecho.ama == 1)
					);
				if (apMar == "NO")
					resultados = resultados.filter(
						(n) => (n.personaje_id > 10 && n.personaje.apMar_id == 10) || (n.hecho_id > 10 && n.hecho.ama == 0)
					);
			}
			if (rolesIgl && resultados.length) {
				if (rolesIgl == "RS")
					resultados = resultados.filter(
						(n) =>
							n.personaje_id > 10 &&
							(n.personaje.rolIglesia_id.startsWith("RE") || n.personaje.rolIglesia_id.startsWith("SC"))
					);
				else resultados = resultados.filter((n) => n.personaje_id > 10 && n.personaje.rolIglesia_id.startsWith(rolesIgl));
			}
			if (canons && resultados.length) {
				if (canons == "SB")
					resultados = resultados.filter(
						(n) =>
							n.personaje_id > 10 &&
							(n.personaje.canon_id.startsWith("ST") || n.personaje.canon_id.startsWith("BT"))
					);
				else if (canons == "VS")
					resultados = resultados.filter(
						(n) =>
							n.personaje_id > 10 &&
							(n.personaje.canon_id.startsWith("VN") || n.personaje.canon_id.startsWith("SD"))
					);
				else resultados = resultados.filter((n) => n.personaje_id > 10 && n.personaje.canon_id.startsWith(canons));
			}

			// Fin
			return resultados;
		},
		prefs: {
			prods: (configCons) => {
				// Variables
				const vars = variables.camposConsultas;
				const {tiposLink, castellano} = vars;
				let prefs = {};

				// Transfiere las preferencias simples a las condiciones
				for (let campo in configCons) if (vars[campo] && vars[campo].campo) prefs[vars[campo].campo] = configCons[campo];

				// Conversión de 'tiposLink'
				if (configCons.tiposLink) {
					const aux = tiposLink.opciones.find((n) => n.id == configCons.tiposLink).condic;
					prefs = {...prefs, ...aux};
				}

				// Conversión de 'castellano'
				if (configCons.castellano) {
					const aux = castellano.opciones.find((n) => n.id == configCons.castellano).condic;
					prefs = {...prefs, ...aux};
				}

				// Fin
				return prefs;
			},
			pers: (configCons) => {
				// Variables
				const {apMar, rolesIgl, canons} = variables.camposConsultas;
				let prefs = {};

				// Aparición mariana
				if (configCons.apMar) prefs.apMar_id = apMar.opciones.find((n) => n.id == configCons.apMar).condic.pers;

				// Roles en la Iglesia
				if (configCons.rolesIgl) prefs.rolIglesia_id = rolesIgl.opciones.find((n) => n.id == configCons.rolesIgl).condic;

				// Canonización
				if (configCons.canons) prefs.canon_id = canons.opciones.find((n) => n.id == configCons.canons).condic;

				// Fin
				console.log(86, prefs);
				return prefs;
			},
		},
		momentoDelAno: async ({dia, mes}) => {
			// Variables
			const entidadesRCLV = variables.entidades.rclvs.slice(0, -1); // Descarta la última entidad (epocaDelAno)
			const diaInicial_id = diasDelAno.find((n) => n.dia == dia && n.mes_id == mes).id;
			let registros = [];
			let condicion;

			// Rutina para obtener los RCLVs de los días 0, +1, +2
			for (let dia = 0; dia < 3; dia++) {
				// Variables
				let diaDelAno_id = diaInicial_id + dia;
				if (diaDelAno_id > 366) diaDelAno_id -= 366;

				// Obtiene los RCLV
				for (let entidad of entidadesRCLV) {
					// Condicion estandar: RCLVs del dia y en status aprobado
					condicion = {id: {[Op.gt]: 10}, diaDelAno_id, statusRegistro_id: aprobado_id};

					// Obtiene los registros
					registros.push(
						BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
							// Les agrega su entidad y el dia
							.then((n) => n.map((m) => ({...m, entidad, dia})))
					);
				}

				// Busca el registro de 'epocaDelAno'
				const epocaDelAno_id = diasDelAno.find((n) => n.id == diaDelAno_id).epocaDelAno_id;
				if (epocaDelAno_id != 1) {
					const condicion = {id: epocaDelAno_id, statusRegistro_id: aprobado_id};
					registros.push(
						BD_genericas.obtieneTodosPorCondicion("epocasDelAno", condicion)
							// Les agrega su entidad y el dia
							.then((n) => n.map((m) => ({...m, entidad: "epocasDelAno", dia})))
					);
				}
			}

			// Espera y consolida la informacion
			let rclvs = [];
			await Promise.all(registros).then((n) => n.map((m) => rclvs.push(...m)));

			// Elimina los repetidos
			if (rclvs.length)
				for (let i = rclvs.length - 1; i >= 0; i--) {
					let rclv = rclvs[i];
					if (i != rclvs.findIndex((n) => n.id == rclv.id && n.entidad == rclv.entidad)) rclvs.splice(i, 1);
				}

			// Los ordena:
			if (rclvs.length) rclvs.sort((a, b) => b.prioridad - a.prioridad); // Prioridad descendente
			if (rclvs.length) rclvs.sort((a, b) => a.dia - b.dia); // Momento ascendente

			// Fin
			return rclvs;
		},
		cruceProdsConPPP: ({prods, pppRegistros, configCons}) => {
			// Si se cumple un conjunto de condiciones, se borran todos los productos y termina la función
			if (configCons.pppOpciones && configCons.pppOpciones != sinPreferencia.id && !pppRegistros.length) return [];

			// Rutina por producto
			for (let i = prods.length - 1; i >= 0; i--) {
				// Averigua si el producto tiene un registro de preferencia
				const existe = pppRegistros.find((n) => n.entidad == prods[i].entidad && n.entidad_id == prods[i].id);

				// Acciones si se eligió un tipo de preferencia
				if (configCons.pppOpciones) {
					// Acciones si se eligió 'sinPreferencia'
					if (configCons.pppOpciones == sinPreferencia.id) {
						if (existe) prods.splice(i, 1); // Elimina los registros que tienen alguna preferencia
						else prods[i] = {...prods[i], pppIcono: sinPreferencia.icono, pppNombre: sinPreferencia.nombre}; // Le agrega a los productos la ppp del usuario
					}
					// Acciones si se eligió una opción distinta a 'sinPreferencia'
					else {
						if (!existe) prods.splice(i, 1); // Elimina los registros que no coinciden con él
						else prods[i] = {...prods[i], pppIcono: pppOpcionElegida.icono, pppNombre: pppOpcionElegida.nombre}; // Le agrega a los productos la ppp del usuario
					}
				}
				// Si no se eligió un tipo de preferencia, le agrega a los productos la ppp del usuario
				else {
					prods[i].pppIcono = existe ? existe.detalle.icono : sinPreferencia.icono;
					prods[i].pppNombre = existe ? existe.detalle.nombre : sinPreferencia.nombre;
				}
			}

			// Fin
			return prods;
		},
	},
	API: {
		filtrosRCLV: (datos) => {
			// Variables
			let filtros = {};
			let condics = {
				statusRegistro_id: aprobado_id,
				id: {[Op.gt]: 10},
				[Op.and]: [],
			};

			// Arma el filtro
			let campos = ["epocasOcurrencia", "apMar", "canons", "rolesIglesia"];
			for (let campo of campos) if (datos[campo]) filtros[campo] = datos[campo];

			// Conversión de filtros de RCLV
			if (filtros.epocasOcurrencia && datos.entidad != "temas") condics.epocaOcurrencia_id = filtros.epocasOcurrencia;
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
				datos.bhr == "pers" ? ["personajes"] : datos.bhr == "hecho" ? ["hechos"] : ["personajes", "hechos", "temas"];
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
