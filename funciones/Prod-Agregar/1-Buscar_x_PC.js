"use strict";
// Definir variables
let searchTMDB = require("../APIs_TMDB/1-Search");
let detailsTMDB = require("../APIs_TMDB/2-Details");
let BD_varias = require("../BD/varias");
let varias = require("../Varias/Varias");

module.exports = {
	// ControllerAPI (cantProductos)
	// ControllerVista (palabrasClaveGuardar)
	search: async (palabrasClave) => {
		palabrasClave = varias.convertirLetrasAlIngles(palabrasClave);
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
					entidad_TMDB == "collection" && lectura.resultados.length > 0
						? (lectura.resultados = await agregarLanzamiento(lectura.resultados))
						: "";
					datos = unificarResultados(lectura, entidad_TMDB, datos, page);
				}
			}
			// Terminacion
			datos = eliminarDuplicados(datos);
			datos = await averiguarSiYaEnBD(datos);
			datos.hayMas = hayMas(datos, page, entidadesTMDB);
			if (datos.resultados.length >= 20 || !datos.hayMas) {
				break;
			} else page = page + 1;
		}
		datos = ordenarDatos(datos, palabrasClave);
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
			var producto = "Colección";
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
			var producto = "Colección";
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
			var producto = "Película";
			var entidad = "peliculas";
			var ano = parseInt(m.release_date.slice(0, 4));
			var nombre_original = m.original_title;
			var nombre_castellano = m.title;
			var desempate3 = m.release_date;
		}
		// Definir el título sin "distractores", para encontrar duplicados
		let desempate1 = varias.convertirLetrasAlIngles(nombre_original).replace(/ /g, "").replace(/'/g, "");
		let desempate2 = varias.convertirLetrasAlIngles(nombre_castellano).replace(/ /g, "").replace(/'/g, "");
		// Dejar sólo algunos campos
		return {
			producto,
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
				varias.convertirLetrasAlIngles(m.nombre_original).includes(palabra) ||
				varias.convertirLetrasAlIngles(m.nombre_castellano).includes(palabra) ||
				varias.convertirLetrasAlIngles(m.comentario).includes(palabra)
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
	while (true) {
		indice = dato.resultados.findIndex((m) => m == null);
		if (indice == -1) break;
		dato.resultados.splice(indice, 1);
	}
	return dato;
};

let agregarLanzamiento = async (dato) => {
	let detalles = [];
	for (let j = 0; j < dato.length; j++) {
		// Obtener todas las fechas de lanzamiento
		TMDB_id = dato[j].TMDB_id;
		detalles = await detailsTMDB("collection", TMDB_id)
			.then((n) => n.parts)
			.then((n) =>
				n.map((m) => {
					if (m.release_date) return m.release_date;
				})
			);
		// Ordenar de menor a mayor
		detalles.length > 1
			? detalles.sort((a, b) => {
					return a < b ? -1 : a > b ? 1 : 0;
			  })
			: "";
		let ano = detalles[0];
		dato[j].lanzamiento = ano != "-" ? parseInt(ano.slice(0, 4)) : ano;
		dato[j].desempate3 = ano;
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
	datos.resultados = datos.resultados.concat(lectura.resultados);
	datos.cantPaginasUsadas = {
		...datos.cantPaginasUsadas,
		[entidad_TMDB]: Math.min(page, datos.cantPaginasAPI[entidad_TMDB]),
	};
	return datos;
};

let eliminarDuplicados = (datos) => {
	datos.resultados.map((n) => {
		contar = datos.resultados.filter(
			(m) =>
				(m.desempate1 == n.desempate1 || m.desempate2 == n.desempate2) && m.desempate3 == n.desempate3
		);
		if (contar.length > 1) {
			indice = datos.resultados.findIndex(
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
		let YaEnBD = await BD_varias.obtenerELC_id(entidad, "TMDB_id", datos.resultados[i].TMDB_id);
		if (entidad == "peliculas" && !YaEnBD) {
			// Debe averiguarlo, porque el 'search' no avisa si pertenece a una colección
			YaEnBD = await BD_varias.obtenerELC_id("capitulos", "TMDB_id", datos.resultados[i].TMDB_id);
			if (YaEnBD) {
				capitulo = await BD_varias.obtenerPorId("capitulos", YaEnBD);
				coleccion = await BD_varias.obtenerPorId("colecciones", capitulo.coleccion_id);
				datos.resultados[i].entidad = "capitulos";
				datos.resultados[i].producto = 'Capítulo de Colección "' + coleccion.nombre_castellano + '"';
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

let ordenarDatos = (datos, palabrasClave) => {
	datos.resultados.length > 1
		? datos.resultados.sort((a, b) => {
				return b.desempate3 < a.desempate3 ? -1 : b.desempate3 > a.desempate3 ? 1 : 0;
		  })
		: "";
	let datosEnOrden = {
		palabrasClave: palabrasClave,
		hayMas: datos.hayMas,
		cantResultados: datos.resultados.length,
		cantPaginasAPI: datos.cantPaginasAPI,
		cantPaginasUsadas: datos.cantPaginasUsadas,
		resultados: datos.resultados,
	};
	return datosEnOrden;
};
