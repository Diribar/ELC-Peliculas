const search_TMDB = require("../API/1-search-TMDB");
const search_FA = require("../API/1-search-FA");
const details_FA = require("../API/2-details-FA");

module.exports = {
	searchCollection: async (palabras_clave) => {
		let lecturaCollection = search_TMDB(palabras_clave, "collection")
			.then((n) => n.results)
			.then((n) => n.map((m) => m.id));
		let lecturaTV = search_TMDB(palabras_clave, "tv")
			.then((n) => n.results)
			.then((n) => n.map((m) => m.id));
		let datos = await Promise.all([lecturaCollection, lecturaTV]).then(
			(n) => {
				return {
					rubro: "colecciones",
					menor: Math.max(n[0].length, n[1].length),
					mayor: n[0].length + n[1].length,
					coleccion: n[0],
					tv: n[1],
				};
			}
		);
		return datos;
	},

	searchMovie: async (palabras_clave) => {
		let lecturaTMDB = search_TMDB(palabras_clave, "movie")
			.then((n) => n.results)
			.then((n) => n.map((m) => m.id));
		let lecturaFA = search_FA(palabras_clave).then((n) =>
			n.map((m) => m.id));
		let datos = await Promise.all([lecturaTMDB, lecturaFA]).then((n) => {
			return {
				rubro: "peliculas",
				menor: Math.max(n[0].length, n[1].length),
				mayor: n[0].length + n[1].length,
				tmdb: n[0],
				fa: n[1],
			};
		});
		return datos;
	},

	searchCollectionBackup: async (palabras_clave) => {
		var datos = [];
		var rubro = ["collection", "tv"];
		for (let i = 0; i < 2; i++) {
			lectura = await search_TMDB(palabras_clave, rubro[i]);
			if (lectura.total_results) {
				lectura.results.map((m) => {
					datos.push({
						tmdb_id: m.id,
						rubro: rubro[i],
						nombre_original: m.original_name,
						nombre_castellano: m.name,
						imagen1: m.backdrop_path,
						imagen2: m.poster_path,
					});
				});
			}
		}
		return datos;
	},

	searchMovieBackup: async (palabras_clave) => {
		var datos = [];
		let lecturaTMDB = { total_results: 0 };
		lecturaTMDB = await search_TMDB(palabras_clave, "movie");
		if (lecturaTMDB.total_results && lecturaTMDB.total_results <= 20) {
			lecturaTMDB.results.map((m) => {
				datos.push({
					fuente: "TMDB",
					rubro: "movie",
					id: m.id,
					nombre_original: m.original_title,
					nombre_castellano: m.title,
					imagen1: m.backdrop_path,
					imagen2: m.poster_path,
					idioma: m.original_language,
					lanzamiento: parseInt(m.release_date.substring(0, 4)),
				});
				//console.log(m.original_title.toLowerCase() + "/")
			});
		}

		console.log(lecturaTMDB.total_results);
		if (lecturaTMDB.total_results <= 20) {
			var lecturaFA = await search_FA(palabras_clave);
			// if (lecturaFA.length > 0 && lecturaFA.length <= 20) {
			// 	for (n of lecturaFA) {
			// 		detalleFA = await details_FA(n.id).then((m) => {
			// 			parentesis = m.title.indexOf(" (");
			// 			parentesis > 0
			// 				? (m.title = m.title.slice(0, parentesis))
			// 				: "";
			// 			return {
			// 				fuente: "FA",
			// 				rubro: "movie",
			// 				id: n.id,
			// 				nombre: m.title,
			// 				imagen1: m.poster_big,
			// 				lanzamiento: m.year,
			// 			};
			// 		});
			// 		if (
			// 			datos.length == 0 ||
			// 			!datos.find((p) => (
			// 				p.lanzamiento == detalleFA.lanzamiento &&
			// 				p.nombre.toLowerCase() == detalleFA.nombre.toLowerCase()
			// 			)) &&
			// 			!datos.find((p) => (
			// 				p.lanzamiento == detalleFA.lanzamiento &&
			// 				p.nombre_original.toLowerCase() == detalleFA.nombre.toLowerCase()
			// 			))
			// 		) {
			// 			datos.push(detalleFA);
			// 			console.log(detalleFA.nombre.toLowerCase() + "/")
			// 		}
			// 	}
			// } else lecturaFA.length > 20 ? datos.push(lecturaFA) : "";
		}

		// datos.sort(function (a, b) {
		// 	if (a.lanzamiento > b.lanzamiento) {
		// 		return 1;
		// 	}
		// 	if (a.lanzamiento < b.lanzamiento) {
		// 		return -1;
		// 	}
		// 	// a must be equal to b
		// 	return 0;
		// });
		// return datos;
		return lecturaFA;
	},
};
