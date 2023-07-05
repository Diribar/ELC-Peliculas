"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");

module.exports = {
	filtrosDeCabecera: async (userID) => {
		// Variables
		let propios = [];

		// Obtiene los filtros personalizados propios y de ELC
		if (userID) propios = BD_genericas.obtieneTodosPorCondicion("filtrosCabecera", {usuario_id: userID});
		let elc = BD_genericas.obtieneTodosPorCondicion("filtrosCabecera", {usuario_id: null});
		[propios, elc] = await Promise.all([propios, elc]);

		// Los ordena alfabéticamente
		if (propios.length > 1) propios.sort((a, b) => (a.nombre < b.nombre ? -1 : 1));
		if (elc.length > 1) elc.sort((a, b) => (a.nombre < b.nombre ? -1 : 1));

		// Fin
		return {propios, elc};
	},
	filtrosPorCampo: function () {
		// Variable 'filtros'
		let filtrosPorCampo = {...variables.filtrosConsultas};

		// Agrega los campos de código y opciones
		for (let campo in filtrosPorCampo) {
			// Le agrega el nombre del campo a cada método
			filtrosPorCampo[campo].codigo = campo;

			// Si no tiene opciones, le agrega las de la BD
			if (!filtrosPorCampo[campo].opciones) {
				if (campo == "epocasOcurrencia")
					filtrosPorCampo.epocasOcurrencia.opciones = epocas
						.filter((n) => !n.varias)
						.map((n) => ({id: n.id, nombre: n.consulta}));
				else filtrosPorCampo[campo].opciones = global[campo];
			}
		}

		// Quita el método de "sin preferencia"
		filtrosPorCampo.ppp_opciones.opciones = filtrosPorCampo.ppp_opciones.opciones.filter((n) => n.id != sinPreferencia.id);

		// Fin
		return filtrosPorCampo;
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
		filtrosProd: (datos) => {
			// Variables
			let filtros = {};
			let condics = {statusRegistro_id: aprobado_id};
			let epocaEstreno;

			// Arma el filtro
			let campos = ["cfc", "bhr", "publicos", "epocasEstreno", "tiposLink"];
			campos.push("castellano", "tiposActuacion", "musical", "palabrasClave");
			for (let campo of campos) if (datos[campo]) filtros[campo] = datos[campo];

			// Proceso para épocas de estreno
			if (filtros.epocasEstreno) {
				const epocasEstreno = variables.filtrosConsultas.epocasEstreno;
				epocaEstreno = epocasEstreno.opciones.find((n) => n.id == filtros.epocasEstreno);
			}

			// Ocurrió
			if (filtros.bhr) condics.bhr = filtros.bhr != "NO";
			if (filtros.bhr == "pers") condics.personaje_id = {[Op.ne]: 1};
			if (filtros.bhr == "hecho") condics.hecho_id = {[Op.ne]: 1};

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
