// Require
const search_TMDB = require("./search_TMDB_fetch");
const details_TMDB = require("./details_TMDB_fetch");
const funciones = require("../funcionesVarias");

// Función a exportar
module.exports = {
	search: async (palabras_clave) => {
		palabras_clave = letrasIngles(palabras_clave);
		let lectura = [];
		let datos = { resultados: [] };
		let rubrosAPI = ["movie", "tv", "collection"];
		let page = 1;
		while (true) {
			for (rubroAPI of rubrosAPI) {
				if (page == 1 || page <= datos.cantPaginasAPI[rubroAPI]) {
					lectura = await search_TMDB(palabras_clave, rubroAPI, page)
						.then((n) => {return infoQueQueda(n);})
						.then((n) => {return estandarizarNombres(n, rubroAPI);})
						.then((n) => {return eliminarSiNoCoincideConPalabraClave(n, palabras_clave);})
						.then((n) => {return eliminarIncompletos(n);});
					lectura.resultados = await agregarLanzamiento(lectura.resultados, rubroAPI);
					datos = unificarResultados(lectura, rubroAPI, datos, page);
				}
			}
			// Terminacion
			datos = eliminarDuplicados(datos);
			datos = await averiguarSiYaEnBD(datos);
			datos.hayMas = hayMas(datos, page, rubrosAPI)
			if (datos.resultados.length >= 20 || !datos.hayMas) {
				break;
			} else page = page + 1;
		}
		datos = ordenarDatos(datos, palabras_clave);
		return datos;
	},
};

let hayMas = (datos, page, rubrosAPI) => {
	return page < datos.cantPaginasAPI[rubrosAPI[0]] ||
		page < datos.cantPaginasAPI[rubrosAPI[1]] ||
		page < datos.cantPaginasAPI[rubrosAPI[2]]
}

let infoQueQueda = (n) => {
	return {
		resultados: n.results,
		cantPaginasAPI: Math.min(n.total_pages, n.total_results),
	};
};

let estandarizarNombres = (dato, rubroAPI) => {
	let resultados = dato.resultados.map((m) => {
		// Estandarizar los nombres
		if (rubroAPI == "collection") {
			if (typeof m.poster_path == "undefined" || m.poster_path == null) return;
			ano = "-";
			nombre_original = m.original_name;
			nombre_castellano = m.name;
			desempate3 = "-";
		}
		if (rubroAPI == "tv") {
			if (
				typeof m.first_air_date == "undefined" ||
				typeof m.poster_path == "undefined" ||
				m.first_air_date == "" ||
				m.first_air_date < "1900" ||
				m.poster_path == null
			) return;
			ano = parseInt(m.first_air_date.slice(0, 4));
			nombre_original = m.original_name;
			nombre_castellano = m.name;
			desempate3 = m.first_air_date;
		}
		if (rubroAPI == "movie") {
			if (
				typeof m.release_date == "undefined" ||
				typeof m.poster_path == "undefined" ||
				m.release_date == "" ||
				m.release_date < "1900" ||
				m.poster_path == null
			) return;
			ano = parseInt(m.release_date.slice(0, 4));
			nombre_original = m.original_title;
			nombre_castellano = m.title;
			desempate3 = m.release_date;
		}
		// Definir el título sin "distractores", para encontrar duplicados
		desempate1 = letrasIngles(nombre_original).replace(/ /g, "").replace(/'/g, "");
		desempate2 = letrasIngles(nombre_castellano).replace(/ /g, "").replace(/'/g, "");
		// Dejar sólo algunos campos
		return {
			rubroAPI: rubroAPI,
			tmdb_id: m.id,
			nombre_original: nombre_original,
			nombre_castellano: nombre_castellano,
			lanzamiento: ano,
			avatar: m.poster_path,
			comentario: m.overview,
			desempate1: desempate1,
			desempate2: desempate2,
			desempate3: desempate3,
		};
	});
	return {
		resultados: resultados,
		cantPaginasAPI: dato.cantPaginasAPI,
	};
};

let eliminarSiNoCoincideConPalabraClave = (dato, palabras_clave) => {
	let palabras = palabras_clave.split(" ");
	let resultados = dato.resultados.map((m) => {
		for (palabra of palabras) {
			if (m == null) {
				return;
			}
			if (
				letrasIngles(m.nombre_original).includes(palabra) ||
				letrasIngles(m.nombre_castellano).includes(palabra) ||
				letrasIngles(m.comentario).includes(palabra)
			) {
				return m;
			}
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

let agregarLanzamiento = async (dato, rubroAPI) => {
	if (rubroAPI == "collection" && dato.length > 0) {
		let detalles = [];
		for (let j = 0; j < dato.length; j++) {
			id = dato[j].tmdb_id;
			// Obtener todas las fechas de lanzamiento
			detalles = await details_TMDB(id, "collection")
				.then((n) => {
					!n.hasOwnProperty("parts") ? console.log(n) : "";
					return n.parts;
				})
				.then((n) =>
					n.map((m) => {
						typeof m.release_date != "undefined"
							? (aux = m.release_date)
							: (aux = "-");
						return aux;
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
	}
	return dato;
};

let eliminarDuplicados = (datos) => {
	datos.resultados.map((n) => {
		contar = datos.resultados.filter(
			(m) =>
				(m.desempate1 == n.desempate1 ||
					m.desempate2 == n.desempate2) &&
				m.desempate3 == n.desempate3
		);
		if (contar.length > 1) {
			indice = datos.resultados.findIndex(
				(m) =>
					(m.desempate1 == n.desempate1 ||
						m.desempate2 == n.desempate2) &&
					m.desempate3 == n.desempate3 &&
					m.rubroAPI == "tv"
			);
			indice != -1 ? datos.resultados.splice(indice, 1) : "";
		}
	});
	return datos;
};

let averiguarSiYaEnBD = async (datos) => {
	for (let i=0; i<datos.resultados.length; i++) {
		let dato = {
			rubroAPI: datos.resultados[i].rubroAPI,
			tmdb_id: datos.resultados[i].tmdb_id,
		};
		let [YaEnBD] = await funciones.productoYaEnBD(dato);
		datos.resultados[i] = {
			...datos.resultados[i],
			YaEnBD: YaEnBD,
		};
	}
	return datos;
};

let unificarResultados = (lectura, rubroAPI, datos, page) => {
	// Consolidar cantPaginasAPI
	if (page == 1) {
		datos.cantPaginasAPI = {
			...datos.cantPaginasAPI,
			[rubroAPI]: lectura.cantPaginasAPI,
		};
	}
	// Unificar resultados
	datos.resultados = datos.resultados.concat(lectura.resultados);
	datos.cantPaginasUsadas = {
		...datos.cantPaginasUsadas,
		[rubroAPI]: Math.min(page, datos.cantPaginasAPI[rubroAPI]),
	};
	return datos
}

let ordenarDatos = (datos, palabras_clave) => {
	datos.resultados.length > 1
		? datos.resultados.sort((a, b) => {
				return b.desempate3 < a.desempate3
					? -1
					: b.desempate3 > a.desempate3
					? 1
					: 0;
		  })
		: "";
	let datosEnOrden = {
		palabras_clave: palabras_clave,
		hayMas: datos.hayMas,
		cantResultados: datos.resultados.length,
		cantPaginasAPI: datos.cantPaginasAPI,
		cantPaginasUsadas: datos.cantPaginasUsadas,
		resultados: datos.resultados,
	};
	return datosEnOrden;
};

let letrasIngles = (palabra) => {
	word = palabra
		.toLowerCase()
		.replace(/-/g, " ")
		.replace(/á/g, "a")
		.replace(/é/g, "e")
		.replace(/í/g, "i")
		.replace(/ó/g, "o")
		.replace(/ú/g, "u")
		.replace(/ü/g, "u")
		.replace(/ñ/g, "n")
		.replace(/:/g, "")
		.replace(/[.]/g, "")
		.replace(/¿/g, "")
		.replace(/[?]/g, "")
		.replace(/!/g, "");

	return word;
};
