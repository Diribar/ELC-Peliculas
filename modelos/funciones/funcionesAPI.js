const search_TMDB = require("../API/1-search-TMDB");
const search_FA = require("../API/1-search-FA");

module.exports = {
	searchCollection: async (palabras_clave) => {
		var datos = [];
		for (let i = 1; i <= 2; i++) {
			i == 1 ? (rubro = "collection") : (rubro = "tv");
			let lectura = await search_TMDB(palabras_clave, rubro);
			if (lectura.total_results) {
				lectura.results.map((m) => {
					datos.push({
						fuente: "TMDB",
						rubro: rubro,
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
		let lectura = []
		// TMDB
		lectura = await search_TMDB(palabras_clave, "movie");
		if (lectura.total_results) {
			lectura.results.map((m) => {
				datos.push({
					fuente: "TMDB",
					rubro: "movie",
					id: m.id,
					nombre: m.title,
					nombre_original: m.original_title,
					imagen1: m.backdrop_path,
					imagen2: m.poster_path,
					idioma: m.original_language,
					lanzamiento: m.release_date,
				});
			});
		}
		// FA
		lectura = await search_FA(palabras_clave);
		//return palabras_clave;
		if (lectura.length > 0 && lectura.length <= 20 ) {
			// let ID = 
		}
		return lectura

		//return datos;
	},

	contadorBackup: (palabras_clave, rubro) => {
		return TMDB_search(palabras_clave, rubro).then((n) => n.total_results);
	},

	buscarTitulos: async (palabras_clave, rubro) => {
		let entidades = await TMDB_search(palabras_clave, rubro);
		let colecciones = [];
		if (entidades.total_results > 0) {
			entidadesID = entidades.results.map((n) => n.id);
			for (n of entidadesID) {
				coleccion = await TMDB_details(n, rubro);
				colecciones.push(coleccion);
			}
		}
		return colecciones;
	},
};
