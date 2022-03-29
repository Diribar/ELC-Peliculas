"use strict";
// Definir variables
const searchTMDB = require("../APIs_TMDB/1-Search");
const detailsTMDB = require("../APIs_TMDB/2-Details");
const BD_genericas = require("../BD/Genericas");
const BD_especificas = require("../BD/Especificas");
const especificas = require("../Varias/Especificas");

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
			for (let entidad_TMDB of entidadesTMDB) {
				if (page == 1 || page <= datos.cantPaginasAPI[entidad_TMDB]) {
					lectura = await searchTMDB(palabrasClave, entidad_TMDB, page)
						.then((n) => infoQueQueda(n))
						.then((n) => estandarizarNombres(n, entidad_TMDB))
						.then((n) => eliminarSiPCinexistente(n, palabrasClave))
						.then((n) => eliminarIncompletos(n));
					if (entidad_TMDB == "collection" && lectura.resultados.length && mostrar)
						lectura.resultados = await agregarLanzamiento(lectura.resultados);
					datos = unificarResultados(lectura, entidad_TMDB, datos, page);
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

let estandarizarNombres = (dato, entidad_TMDB) => {
	let resultados = dato.resultados.map((m) => {
		// Estandarizar los nombres
		if (entidad_TMDB == "collection") {
			if (typeof m.poster_path == "undefined" || m.poster_path == null) return;
			var productoNombre = "Colección";
			var entidad = "colecciones";
			var ano = "-";
			var nombre_original = m.original_name;
			var nombre_castellano = m.name;
			var desempate3 = "-";
		}
		if (entidad_TMDB == "tv") {
			if (
				typeof m.first_air_date == "undefined" ||
				typeof m.poster_path == "undefined" ||
				m.first_air_date == "" ||
				m.first_air_date < "1900" ||
				m.poster_path == null
			)
				return;
			var productoNombre = "Colección";
			var entidad = "colecciones";
			var ano = parseInt(m.first_air_date.slice(0, 4));
			var nombre_original = m.original_name;
			var nombre_castellano = m.name;
			var desempate3 = m.first_air_date;
		}
		if (entidad_TMDB == "movie") {
			if (
				typeof m.release_date == "undefined" ||
				typeof m.poster_path == "undefined" ||
				m.release_date == "" ||
				m.release_date < "1900" ||
				m.poster_path == null
			)
				return;
			var productoNombre = "Película";
			var entidad = "peliculas";
			var ano = parseInt(m.release_date.slice(0, 4));
			var nombre_original = m.original_title;
			var nombre_castellano = m.title;
			var desempate3 = m.release_date;
		}
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
			productoNombre,
			entidad,
			entidad_TMDB,
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
	for (let j = 0; j < dato.length; j++) {
		// Obtener todas las fechas de lanzamiento
		let TMDB_id = dato[j].TMDB_id;
		let detalles = await detailsTMDB("collection", TMDB_id)
			.then((n) => n.parts)
			.then((n) =>
				n.map((m) => {
					if (m.release_date) return m.release_date;
				})
			);
		// Obtener el año de lanzamiento
		let ano;
		if (detalles.length > 1)
			for (let detalle of detalles) {
				if (detalle < ano || !ano) ano = detalle;
			}
		dato[j].lanzamiento = ano != "-" ? parseInt(ano.slice(0, 4)) : "-";
		dato[j].desempate3 = dato[j].lanzamiento;
	}
	return dato;
};

let unificarResultados = (lectura, entidad_TMDB, datos, page) => {
	if (page == 1) {
		datos.cantPaginasAPI = {
			...datos.cantPaginasAPI,
			[entidad_TMDB]: lectura.cantPaginasAPI,
		};
	}
	// Unificar resultados
	datos.resultados.push(...lectura.resultados);
	datos.cantPaginasUsadas = {
		...datos.cantPaginasUsadas,
		[entidad_TMDB]: Math.min(page, datos.cantPaginasAPI[entidad_TMDB]),
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
					m.entidad_TMDB == "tv"
			);
			indice != -1 ? datos.resultados.splice(indice, 1) : "";
		}
	});
	return datos;
};

let averiguarSiYaEnBD = async (datos) => {
	for (let i = 0; i < datos.resultados.length; i++) {
		let entidad_TMDB = datos.resultados[i].entidad_TMDB;
		let entidad = entidad_TMDB == "movie" ? "peliculas" : "colecciones";
		let YaEnBD = await BD_especificas.obtenerELC_id(entidad, "TMDB_id", datos.resultados[i].TMDB_id);
		if (entidad == "peliculas" && !YaEnBD) {
			// Debe averiguarlo, porque el 'search' no avisa si pertenece a una colección
			YaEnBD = await BD_especificas.obtenerELC_id("capitulos", "TMDB_id", datos.resultados[i].TMDB_id);
			if (YaEnBD) {
				capitulo = await BD_genericas.obtenerPorId("capitulos", YaEnBD);
				coleccion = await BD_genericas.obtenerPorId("colecciones", capitulo.coleccion_id);
				datos.resultados[i].entidad = "capitulos";
				datos.resultados[i].productoNombre =
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
		datos.resultados.sort((a, b) => {
			return b.desempate3 < a.desempate3 ? -1 : b.desempate3 > a.desempate3 ? 1 : 0;
		});
		datos.resultados.sort((a, b) => {
			return a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0;
		});
	}
	return datos;
};
