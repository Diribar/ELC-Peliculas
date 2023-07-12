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
			let configsConsCampos = {...variables.filtrosConsultas};

			// Agrega los campos de código y opciones
			for (let campo in configsConsCampos) {
				// Le agrega el nombre del campo a cada método
				configsConsCampos[campo].codigo = campo;

				// Si no tiene opciones, le agrega las de la BD
				if (!configsConsCampos[campo].opciones) {
					if (campo == "epocasOcurrencia")
						configsConsCampos.epocasOcurrencia.opciones = epocasOcurrencia
							.filter((n) => !n.varias)
							.map((n) => ({id: n.id, nombre: n.consulta}));
					else configsConsCampos[campo].opciones = global[campo];
				}
			}

			// Quita el método de "sin preferencia"
			configsConsCampos.ppp_opciones.opciones = configsConsCampos.ppp_opciones.opciones.filter(
				(n) => n.id != sinPreferencia.id
			);

			// Fin
			return configsConsCampos;
		},
	},
	resultados: {
		obtieneProds: async function (configCons) {
			// Variables
			const {orden_id, apMar, rolesIgl, canons} = configCons;
			let productos = [];
			let resultado = [];

			// Obtiene las entidades
			let entidades = ["peliculas", "colecciones"];
			if (orden_id == 1) entidades.push("capitulos"); // Para la consulta de 'Momento del año', agrega la entidad 'capitulos'

			// Obtiene las condiciones de base
			let condiciones = {statusRegistro_id: aprobado_id};
			if (orden_id == 2) condiciones = {...condiciones, calificacion: {[Op.gte]: 70}, azar: {[Op.ne]: null}};

			// Agrega las preferencias
			const prefs = this.prefs.prods(configCons);
			condiciones = {...condiciones, ...prefs};
			console.log(66,condiciones);

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
			await Promise.all(productos).then((n) => n.map((m) => resultado.push(...m)));

			// Fin
			return resultado;
		},
		prefs: {
			prods: (configCons) => {
				// Variables
				const vars = variables.filtrosConsultas;
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
				const {apMar, rolesIgl, canons} = variables.filtrosConsultas;
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
let preparaCampos = (campos, clase) => {
	// Obtiene los campos necesarios
	campos = campos.map((n) => {
		return {id: n.id, nombre: n.plural ? n.plural : n.nombre, clase};
	});
	// Fin
	return campos;
};
