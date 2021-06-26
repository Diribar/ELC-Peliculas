const search_TMDB = require("../API/1-search-TMDB");

module.exports = {
	searchTMDB: async (palabras_clave) => {
		let rubros = ["movie", "tv", "collection"];
		let lectura = [{}, {}, {}];
		let i = 0;
		while (true) {
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
					if (n.total > 20) {
						return { masDe20: true };
					} else {
						return {
							resultados: n.resultados.map((m) => {
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
							}),
							masDe20: false,
						};
					}
				})
				// Eliminar los registros incompletos
				.then((n) => {
					if (!n.masDe20) {
						while (true) {
							indice = n.resultados.findIndex((m) => m == null);
							if (indice == -1) break;
							n.resultados.splice(indice, 1);
						}
					};
					return n;
				});
			if (lectura[i].masDe20 || i == 2) break;
			i = i + 1;
		}
		// Unificar la info en un mismo nivel
		let datos = {};
		// Consolidar masDe20
		i == 2 && !lectura[2].masDe20
			? (datos.masDe20 = false)
			: (datos.masDe20 = true);
		// Consolidar resultados
		if (!datos.masDe20) {
			datos.resultados = lectura[0].resultados
				.concat(lectura[1].resultados)
				.concat(lectura[2].resultados);
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
		} else {datos.resultados = []};
		return datos;
	}
};
