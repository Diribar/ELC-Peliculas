const search_TMDB = require("../API/1-search-TMDB");
const search_FA = require("../API/1-search-FA");
const details_FA = require("../API/2-details-FA");

module.exports = {
	searchCollection: async (palabras_clave) => {
		var datos = [];
		var rubro=["collection", "tv"]
		for (let i = 0; i < 2; i++) {
			let lectura = await search_TMDB(palabras_clave, rubro[i]);
			if (lectura.total_results) {
				lectura.results.map((m) => {
					datos.push({
						fuente: "TMDB",
						rubro: rubro[i],
						id: m.id,
						nombre: m.name,
						nombre_original: m.original_name,
						imagen1: m.backdrop_path,
						imagen2: m.poster_path,
						idioma: m.original_language,
					});
				});
			}
		}
		return datos;
	},

	searchMovie: async (palabras_clave) => {
		var datos = [];
		let lecturaTMDB = {total_results: 0};
		// lecturaTMDB = await search_TMDB(palabras_clave, "movie");
		// if (lecturaTMDB.total_results && lecturaTMDB.total_results <= 20) {
		// 	lecturaTMDB.results.map((m) => {
		// 		datos.push({
		// 			fuente: "TMDB",
		// 			rubro: "movie",
		// 			id: m.id,
		// 			nombre: m.title,
		// 			nombre_original: m.original_title,
		// 			imagen1: m.backdrop_path,
		// 			imagen2: m.poster_path,
		// 			idioma: m.original_language,
		// 			lanzamiento: parseInt(m.release_date.substring(0, 4)),
		// 		});
		// 		//console.log(m.original_title.toLowerCase() + "/")
		// 	});
		// }

		console.log(lecturaTMDB.total_results)
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
		return lecturaFA
	},

};
