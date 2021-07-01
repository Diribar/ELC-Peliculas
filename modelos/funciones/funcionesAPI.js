const search_TMDB = require("../API/1-search-TMDB");
const search_FA = require("../API/1-search-FA");
const details_FA = require("../API/2-details-FA");

module.exports = {
	search: async (palabras_clave) => {
		let buscar = [{}];
		buscar[0] = await searchTMDB(palabras_clave);
		let datos = {
			palabras_clave: palabras_clave,
			tmdb: buscar[0].resultados,
			masDe20: buscar[0].masDe20,
			menor: Math.max(buscar[0].resultados.length, 0),
			mayor: buscar[0].resultados.length + 0,
		};
		return datos;
	},
};

searchTMDB = async (palabras_clave) => {
	let rubros = ["collection", "tv", "movie"];
	let lectura = [{}, {}, {}];
	for (let i = 0; i < rubros.length; i++) {
		let rubro = rubros[i];
		lectura[i] = await search_TMDB(palabras_clave, rubro)
			// Dejar sólo resultados y total
			.then((n) => {
				return {
					resultados: n.results,
					total: n.total_results,
				};
			})
			// Dejar sólo algunos campos y estandarizar los nombres
			.then((n) => {
				n.total > 20 ? (masDe20 = true) : (masDe20 = false);
				if (!masDe20) {
					resultados = n.resultados.map((m) => {
						// Estandarizar los nombres
						if (rubro == "collection") {
							ano = "-";
							nombre_original = m.original_name;
							nombre_castellano = m.name;
							desempate2 = "-";
						}
						if (rubro == "tv") {
							if (m.first_air_date == null) return;
							ano = parseInt(m.first_air_date.slice(0, 4));
							nombre_original = m.original_name;
							nombre_castellano = m.name;
							desempate2 = m.first_air_date;
						}
						if (rubro == "movie") {
							if (m.release_date == null) return;
							ano = parseInt(m.release_date.slice(0, 4));
							nombre_original = m.original_title;
							nombre_castellano = m.title;
							desempate2 = m.release_date;
						}
						// Elegir un avatar
						avatar = m.poster_path;
						avatar == null ? (avatar = m.backdrop_path) : "";
						// Definir el título sin "distractores", para encontrar repeticiones
						//console.log([nombre_original, m.id, rubro])
						if (nombre_original) {
							desempate1 = nombre_original
								.replace(/ /g, "")
								.replace(/:/g, "")
								.replace(/-/g, "")
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
							avatar: avatar,
							desempate1: desempate1,
							desempate2: desempate2,
						};
					});
				} else {
					resultados = [];
				}
				return {
					resultados: resultados,
					masDe20: masDe20,
				};
			})
			// Eliminar los registros incompletos
			.then((n) => {
				while (true) {
					indice = n.resultados.findIndex((m) => m == null);
					if (indice == -1) break;
					n.resultados.splice(indice, 1);
				}
			});
	}
	// await Promise.all([
	// 	lectura[0],
	// 	lectura[1],
	// 	lectura[2],
	// ]).then(n => {return n})

	// Unificar la info en un mismo nivel
	let datos = [];
	datos.masDe20 =
		lectura[0].masDe20 || lectura[1].masDe20 || lectura[2].masDe20;
	if (!datos.masDe20) {
		datos.resultados = lectura[0].resultados
			.concat(lectura[1].resultados)
			.concat(lectura[2].resultados);
	} else datos.resultados = [];

	// Detectar si se repite algún registro y eliminar el de la TV
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
	// Ordenar cronológicamente
	datos.resultados.length > 1
		? datos.resultados.sort((a, b) => {
				//return b.lanzamiento - a.lanzamiento;
				return b.desempate2 < a.desempate2
					? -1
					: b.desempate2 > a.desempate2
					? 1
					: 0;
		  })
		: "";
	return datos;
};
