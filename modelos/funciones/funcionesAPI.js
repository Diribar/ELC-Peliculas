const search_TMDB = require("../API/1-search-TMDB");
const search_FA = require("../API/1-search-FA");
const details_FA = require("../API/2-details-FA");

module.exports = {
	search: async (palabras_clave) => {
		let buscarTMDB = searchTMDB(palabras_clave);
		// .then((n) => {
		// 	return {
		// 		masDe20: n[0].masDe20 || n[1].masDe20,
		// 		menor: Math.max(n[0].resultados.length, n[1].resultados.length),
		// 		mayor: n[0].resultados.length + n[1].resultados.length,
		// 	};
		// });

		let datos = buscarTMDB;
		return datos;
	},
};

searchTMDB = async (palabras_clave) => {
	let rubros = ["collection", "tv", "movie"];
	let lectura = [{}, {}, {}];
	for (let i = 0; i < rubros.length; i++) {
		let rubro = rubros[i];
		lectura[i] = await search_TMDB(palabras_clave, rubro)
			.then((n) => {
				return {
					resultados: n.results,
					total: n.total_results,
				};
			})
			.then((n) => {
				n.total > 20 ? (masDe20 = true) : (masDe20 = false);
				return {
					resultados: n.resultados.map((m) => {
						if (rubro == "collection") {
							ano = "-";
							nombre_original = m.original_title;
							nombre_castellano = m.title;
						}
						if (rubro == "movie") {
							if (m.release_date == "") return;
							ano = parseInt(m.release_date.slice(0, 4));
							nombre_original = m.original_title;
							nombre_castellano = m.title;
						}
						if (rubro == "tv") {
							if (m.first_air_date == "") return;
							ano = parseInt(m.first_air_date.slice(0, 4));
							nombre_original = m.original_name;
							nombre_castellano = m.name;
						}
						avatar = m.poster_path;
						avatar == null ? (avatar = m.backdrop_path) : "";
						return {
							fuente: "TMDB",
							rubro: rubro,
							tmdb_id: m.id,
							nombre_original: nombre_original,
							nombre_castellano: nombre_castellano,
							lanzamiento: ano,
							avatar: avatar,
						};
					}),
					masDe20: masDe20,
				};
			})
			.then((n) => {
				while (true) {
					indice = n.resultados.findIndex((m) => m == null);
					if (indice == -1) break;
					n.resultados.splice(indice, 1);
				}
				return n;
			});
	}

	// await Promise.all([
	// 	lectura[0],
	// 	lectura[1],
	// 	lectura[2],
	// ]).then(n => {return n})
	let datos = {
		resultados: lectura[0].resultados
			.concat(lectura[1].resultados)
			.concat(lectura[2].resultados),
		masDe20: lectura[0].masDe20 || lectura[1].masDe20 || lectura[2].masDe20,
	};
	datos.resultados.length > 0
		? datos.resultados.sort((a, b) => {return b.lanzamiento - a.lanzamiento;})
		: "";
	return datos;
};
