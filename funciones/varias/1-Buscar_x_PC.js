"use strict";
// Definir variables
const searchTMDB = require("../APIs_TMDB/1-Search");
const detailsTMDB = require("../APIs_TMDB/2-Details");
const BD_genericas = require("../BD/Genericas");
const BD_especificas = require("../BD/Especificas");
const especificas = require("./Especificas");

module.exports = {
	// ControllerAPI (cantProductos)
	// ControllerVista (palabrasClaveGuardar)
	search: async (palabrasClave, mostrar) => {
		palabrasClave = especificas.convertirLetrasAlIngles(palabrasClave);
		let lectura = [];
		let datos = {resultados: []};
		let entidadesTMDB = ["movie", "tv", "collection"];
		let page = 1;
		while (true) {
			for (let TMDB_entidad of entidadesTMDB) {
				if (page == 1 || page <= datos.cantPaginasAPI[TMDB_entidad]) {
					lectura = await searchTMDB(palabrasClave, TMDB_entidad, page)
						.then((n) => infoQueQueda(n))
						.then((n) => estandarizarNombres(n, TMDB_entidad))
						.then((n) => eliminarSiPCinexistente(n, palabrasClave))
						.then((n) => eliminarIncompletos(n));
					if (TMDB_entidad == "collection" && lectura.resultados.length && mostrar)
						lectura.resultados = await agregarLanzamiento(lectura.resultados);
					datos = unificarResultados(lectura, TMDB_entidad, datos, page);
				}
			}
			// Terminacion
			datos = eliminarDuplicados(datos);
			datos = await averiguarSiYaEnBD(datos);
			datos.hayMas = hayMas(datos, page, entidadesTMDB);
			if (datos.resultados.length >= 20 || !datos.hayMas) break;
			else page++;
		}
		if (mostrar) datos = ordenarDatos(datos);
		datos = {
			palabrasClave: palabrasClave,
			hayMas: datos.hayMas,
			cantResultados: datos.resultados.length,
			cantPaginasAPI: datos.cantPaginasAPI,
			cantPaginasUsadas: datos.cantPaginasUsadas,
			resultados: datos.resultados,
		};
		return datos;
	},
};

let infoQueQueda = (datos) => {
	return {
		resultados: datos.results,
		cantPaginasAPI: Math.min(datos.total_pages, datos.total_results),
	};
};

let estandarizarNombres = (dato, TMDB_entidad) => {
	let resultados = dato.resultados.map((m) => {
		let prodNombre, entidad, ano, nombre_original, nombre_castellano, desempate3;
		// Estandarizar los nombres
		if (TMDB_entidad == "collection")
			if (typeof m.poster_path != "undefined" && m.poster_path != null) {
				prodNombre = "Colección";
				entidad = "colecciones";
				ano = "-";
				nombre_original = m.original_name;
				nombre_castellano = m.name;
				desempate3 = "-";
			} else return;
		if (TMDB_entidad == "tv")
			if (
				typeof m.first_air_date != "undefined" &&
				typeof m.poster_path != "undefined" &&
				m.first_air_date &&
				m.first_air_date > "1900" &&
				m.poster_path
			) {
				prodNombre = "Colección";
				entidad = "colecciones";
				ano = parseInt(m.first_air_date.slice(0, 4));
				nombre_original = m.original_name;
				nombre_castellano = m.name;
				desempate3 = m.first_air_date;
			} else return;
		if (TMDB_entidad == "movie")
			if (
				typeof m.release_date != "undefined" &&
				typeof m.poster_path != "undefined" &&
				m.release_date &&
				m.release_date > "1900" &&
				m.poster_path
			) {
				prodNombre = "Película";
				entidad = "peliculas";
				ano = parseInt(m.release_date.slice(0, 4));
				nombre_original = m.original_title;
				nombre_castellano = m.title;
				desempate3 = m.release_date;
			} else return;
		// Definir el título sin "distractores", para encontrar duplicados
		let desempate1 = especificas
			.convertirLetrasAlIngles(nombre_original)
			.replace(/ /g, "")
			.replace(/'/g, "");
		let desempate2 = especificas
			.convertirLetrasAlIngles(nombre_castellano)
			.replace(/ /g, "")
			.replace(/'/g, "");
		// Dejar sólo algunos campos
		return {
			prodNombre,
			entidad,
			TMDB_entidad,
			TMDB_id: m.id,
			nombre_original,
			nombre_castellano,
			idioma_original_id: m.original_language,
			lanzamiento: ano,
			avatar: m.poster_path,
			comentario: m.overview,
			desempate1,
			desempate2,
			desempate3,
		};
	});
	return {
		resultados: resultados,
		cantPaginasAPI: dato.cantPaginasAPI,
	};
};

let eliminarSiPCinexistente = (dato, palabrasClave) => {
	let palabras = palabrasClave.split(" ");
	let resultados = dato.resultados.map((m) => {
		if (typeof m == "undefined" || m == null) return;
		for (let palabra of palabras) {
			if (
				especificas.convertirLetrasAlIngles(m.nombre_original).includes(palabra) ||
				especificas.convertirLetrasAlIngles(m.nombre_castellano).includes(palabra) ||
				especificas.convertirLetrasAlIngles(m.comentario).includes(palabra)
			)
				return m;
		}
		return;
	});
	return {
		resultados: resultados,
		cantPaginasAPI: dato.cantPaginasAPI,
	};
};

let eliminarIncompletos = (dato) => {
	for (let indice = dato.resultados.length - 1; indice >= 0; indice--) {
		if (dato.resultados[indice] == null) dato.resultados.splice(indice, 1);
	}
	return dato;
};

let agregarLanzamiento = async (dato) => {
	for (let i = 0; i < dato.length; i++) {
		// Obtener todas las fechas de lanzamiento
		let TMDB_id = dato[i].TMDB_id;
		let detalles = await detailsTMDB("collection", TMDB_id)
			.then((n) => n.parts)
			.then((n) => n.map((m) => (m.release_date ? m.release_date : "-")));
		// Obtener el año de lanzamiento
		let ano = detalles.reduce((a, b) => (a < b ? a : b));
		dato[i].lanzamiento = dato[i].desempate3 = ano != "-" ? parseInt(ano.slice(0, 4)) : "-";
		dato[i].capitulos = detalles.length;
	}
	return dato;
};

let unificarResultados = (lectura, TMDB_entidad, datos, page) => {
	if (page == 1) {
		datos.cantPaginasAPI = {
			...datos.cantPaginasAPI,
			[TMDB_entidad]: lectura.cantPaginasAPI,
		};
	}
	// Unificar resultados
	datos.resultados.push(...lectura.resultados);
	datos.cantPaginasUsadas = {
		...datos.cantPaginasUsadas,
		[TMDB_entidad]: Math.min(page, datos.cantPaginasAPI[TMDB_entidad]),
	};
	return datos;
};

let eliminarDuplicados = (datos) => {
	datos.resultados.map((n) => {
		let contar = datos.resultados.filter(
			(m) =>
				(m.desempate1 == n.desempate1 || m.desempate2 == n.desempate2) && m.desempate3 == n.desempate3
		);
		if (contar.length > 1) {
			let indice = datos.resultados.findIndex(
				(m) =>
					(m.desempate1 == n.desempate1 || m.desempate2 == n.desempate2) &&
					m.desempate3 == n.desempate3 &&
					m.TMDB_entidad == "tv"
			);
			indice != -1 ? datos.resultados.splice(indice, 1) : "";
		}
	});
	return datos;
};

let averiguarSiYaEnBD = async (datos) => {
	for (let i = 0; i < datos.resultados.length; i++) {
		let TMDB_entidad = datos.resultados[i].TMDB_entidad;
		let entidad = TMDB_entidad == "movie" ? "peliculas" : "colecciones";
		let YaEnBD = await BD_especificas.obtenerELC_id(entidad, {TMDB_id: datos.resultados[i].TMDB_id});
		if (entidad == "peliculas" && !YaEnBD) {
			// Debe averiguarlo, porque el 'search' no avisa si pertenece a una colección
			YaEnBD = await BD_especificas.obtenerELC_id("capitulos", {TMDB_id: datos.resultados[i].TMDB_id});
			if (YaEnBD) {
				capitulo = await BD_genericas.obtenerPorId("capitulos", YaEnBD);
				coleccion = await BD_genericas.obtenerPorId("colecciones", capitulo.coleccion_id);
				datos.resultados[i].entidad = "capitulos";
				datos.resultados[i].prodNombre =
					'Capítulo de Colección "' + coleccion.nombre_castellano + '"';
			}
		}
		datos.resultados[i] = {
			...datos.resultados[i],
			YaEnBD: YaEnBD,
		};
	}
	return datos;
};

let hayMas = (datos, page, entidadesTMDB) => {
	return (
		page < datos.cantPaginasAPI[entidadesTMDB[0]] ||
		page < datos.cantPaginasAPI[entidadesTMDB[1]] ||
		page < datos.cantPaginasAPI[entidadesTMDB[2]]
	);
};

let ordenarDatos = (datos) => {
	if (datos.resultados.length > 1) {
		// Ordenar desde la más reciente hacia la más antigua
		datos.resultados.sort((a, b) =>
			a.desempate3 > b.desempate3 ? -1 : a.desempate3 < b.desempate3 ? 1 : 0
		);
		// Ordenar primero por colecciones y luego por películas
		datos.resultados.sort((a, b) => (a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0));
	}
	return datos;
};
