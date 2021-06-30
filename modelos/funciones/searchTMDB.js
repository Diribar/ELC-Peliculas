const search_TMDB = require("../API/1-search-TMDB");
const details_TMDB = require("../API/2-details-TMDB");

module.exports = {
	searchTMDB: async (palabras_clave) => {
		let lectura = [];
		let datos = {};
		let rubros = ["movie", "tv", "collection"];
		let i = 0;
		let page = 1
		while (true) {
			for (let i = 0; i<3; i++) {
				rubro = rubros[i];
				lectura[i] = await search_TMDB(palabras_clave, rubro, page)
					// Dejar sólo resultados y total
					.then((n) => {
						return {
							resultados: n.results,
							cantPaginasAPI: n.total_pages,
						};
					})
					// Dejar sólo algunos campos y estandarizar los nombres
					.then((n) => {
						return estandarizarNombres(n, rubro);
					})
					// Marcar los registros que no tienen coincidencias con la palabra_clave
					.then((n) => {
						return coincideConPalabraClave(
							n,
							palabras_clave
						);
					})
					// Eliminar los registros incompletos
					.then((n) => {
						return eliminarIncompletos(n);
					});
				// Agregarle lanzamiento a las colecciones
				rubro == "collection"
					? (lectura[i].resultados = await agregarLanzamiento(
							lectura[i].resultados
						))
					: "";
			}
			// Terminacion
			datos = unificarLaInfo(lectura, rubros);
			datos = eliminarDuplicados(datos);
			break
		}
		datos = ordenarCronologicamente(datos);
		return datos;
	},
};

let estandarizarNombres = (dato, rubro) => {
	let resultados = dato.resultados.map((m) => {
		// Estandarizar los nombres
		if (rubro == "collection") {
			if (typeof m.poster_path == "undefined" || m.poster_path == null)
				return;
			ano = "-";
			nombre_original = m.original_name;
			nombre_castellano = m.name;
			desempate2 = "-";
		}
		if (rubro == "tv") {
			if (
				typeof m.first_air_date == "undefined" ||
				typeof m.poster_path == "undefined" ||
				m.first_air_date == "" ||
				m.first_air_date < "1900" ||
				m.poster_path == null
			)
				return;
			ano = parseInt(m.first_air_date.slice(0, 4));
			nombre_original = m.original_name;
			nombre_castellano = m.name;
			desempate2 = m.first_air_date;
		}
		if (rubro == "movie") {
			if (
				typeof m.release_date == "undefined" ||
				typeof m.poster_path == "undefined" ||
				m.release_date == "" ||
				m.release_date < "1900" ||
				m.poster_path == null
			)
				return;
			ano = parseInt(m.release_date.slice(0, 4));
			nombre_original = m.original_title;
			nombre_castellano = m.title;
			desempate2 = m.release_date;
		}
		// Definir el título sin "distractores", para encontrar duplicados
		if (nombre_original) {
			desempate1 = nombre_original
				.replace(/ /g, "")
				.replace(/-/g, "")
				.replace(/:/g, "")
				.replace(/!/g, "")
				.toLowerCase();
		} else {
			desempate1 = "";
		}
		// Dejar sólo algunos campos
		return {
			fuente: "TMDB",
			rubro: rubro,
			tmdb_id: m.id,
			nombre_original: nombre_original,
			nombre_castellano: nombre_castellano,
			lanzamiento: ano,
			avatar: m.poster_path,
			comentario: m.overview,
			desempate1: desempate1,
			desempate2: desempate2,
		};
	});
	return {
		resultados: resultados,
		cantPaginasAPI: dato.cantPaginasAPI,
	};
};

let coincideConPalabraClave = (dato, palabras_clave) => {
	let palabras = palabras_clave.split(" ");
	let resultados = dato.resultados.map((m) => {
		for (palabra of palabras) {
			if (m == null) {
				return;
			}
			compNO = letrasIngles(m.nombre_original);
			compNC = letrasIngles(m.nombre_castellano);
			compCom = letrasIngles(m.comentario);
			if (
				compNO.includes(palabra) ||
				compNC.includes(palabra) ||
				compCom.includes(palabra)
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
		.replace(/!/g, "");

	return word;
};

let agregarLanzamiento = async (dato) => {
	if (dato.length > 0) {
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
			dato[j].desempate2 = ano
		}
	}
	return dato;
};

let unificarLaInfo = (lectura, rubros) => {
	let datos = {};
	// Consolidar cantPaginasAPI
	datos.cantPaginasAPI = {
		[rubros[0]]: lectura[0].cantPaginasAPI,
		[rubros[1]]: lectura[1].cantPaginasAPI,
		[rubros[2]]: lectura[2].cantPaginasAPI,
	};
	// Consolidar resultados
	datos.resultados = lectura[0].resultados
		.concat(lectura[1].resultados)
		.concat(lectura[2].resultados);
	datos.hayMas =
		lectura[0].cantPaginasAPI > 1 ||
		lectura[1].cantPaginasAPI > 1 ||
		lectura[2].cantPaginasAPI > 1
			? true
			: false;
	return datos;
};

let eliminarDuplicados = (datos) => {
	datos.resultados.map((n) => {
		contar = datos.resultados.filter(
			(m) => m.desempate1 == n.desempate1 && m.desempate2 == n.desempate2
		);
		if (contar.length > 1) {
			indice = datos.resultados.findIndex(
				(m) =>
					m.desempate1 == n.desempate1 &&
					m.desempate2 == n.desempate2 &&
					m.rubro == "tv"
			);
			indice != -1 ? datos.resultados.splice(indice, 1) : "";
		}
	});
	return datos;
};

let ordenarCronologicamente = (datos) => {
	datos.resultados.length > 1
		? datos.resultados.sort((a, b) => {
				return b.desempate2 < a.desempate2
					? -1
					: b.desempate2 > a.desempate2
					? 1
					: 0;
		  })
		: "";
	return datos;
};
