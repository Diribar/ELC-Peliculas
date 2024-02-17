"use strict";
const API_key = process.env.API_key;

module.exports = {
	search: async (palabrasClave, TMDB_entidad, page) => {
		// PARTES DEL URL
		// "https://api.themoviedb.org/3/search/movie      ?api_key=&language=es&query=karol%20uomo%20papa&page=1&include_adult=false"
		// "https://api.themoviedb.org/3/search/collection ?api_key=&language=es&query=karol%20uomo%20papa&page=1
		// "https://api.themoviedb.org/3/search/tv         ?api_key=&language=es&query=karol%20uomo%20papa&page=1&include_adult=false"
		// let version = TMDB_entidad != "collection" ? 4 : 3;
		const version = 3;
		const url =
			"https://api.themoviedb.org/" +
			version +
			"/search/" +
			TMDB_entidad +
			"?api_key=" +
			API_key +
			"&language=es&query=" +
			palabrasClave +
			"&page=" +
			page +
			"&include_adult=false";

		// Busca la info
		let resultado = await fetch(url).then((n) => n.json());
		if (resultado.hasOwnProperty("success") && !resultado.success) {
			console.log("searchTMDB_fetch", url, resultado);
			resultado = {
				page: 1,
				results: [],
				total_pages: 1,
				total_results: 0,
			};
		}
		return resultado;
	},
	details: async (TMDB_entidad, TMDB_id) => {
		// Se usa "details", porque mejora el resultado de la API
		// PARTES DEL URL
		// https://api.themoviedb.org/3/movie/    218275?api_key=&language=es&append_to_response=credits
		// https://api.themoviedb.org/3/collection/97919?api_key=&language=es
		// https://api.themoviedb.org/3/tv/        61865?api_key=&language=es
		// https://api.themoviedb.org/3/tv/		   61865/season/0?api_key=&language=es

		// Genera el agregado para consultar una temporada de TV
		let season;
		if (typeof TMDB_entidad == "number") {
			season = "/season/" + TMDB_entidad;
			TMDB_entidad = "tv";
		} else season = "";

		// Genera la url de consulta
		let url =
			"https://api.themoviedb.org/3/" +
			TMDB_entidad +
			"/" +
			TMDB_id +
			season +
			"?api_key=" +
			API_key +
			"&language=es-ES" +
			(TMDB_entidad == "movie" ? "&append_to_response=credits" : "");

		// Busca la información
		let resultado = await fetch(url).then((n) => n.json());

		// Adecuaciones según el éxito/fracaso
		if (resultado.status_message) {
			console.log("detailsTMDB_fetch:", resultado.status_message);
			console.log(url);
			resultado = {};
		}

		// Fin
		return resultado;
	},
	credits: async (TMDB_entidad, TMDB_id) => {
		// Se usa "credits", porque mejora el resultado de la API
		// PARTES DEL URL
		// https://api.themoviedb.org/3/movie/38516/credits?api_key=&language=es-ES
		// https://api.themoviedb.org/3/tv/1781/credits?api_key=&language=es

		// Generar el agregado para consultar una temporada de TV
		let season;
		if (typeof TMDB_entidad == "number") {
			season = "/season/" + TMDB_entidad;
			TMDB_entidad = "tv";
		} else season = "";

		// Generar la url de consulta
		let url =
			"https://api.themoviedb.org/3/" +
			TMDB_entidad +
			"/" +
			TMDB_id +
			season +
			"/credits?api_key=" +
			API_key +
			"&language=es-ES";
		// BUSCAR LA INFO
		let resultado = await fetch(url).then((n) => n.json());
		if (resultado.status_message) {
			console.log("creditsTMDB_fetch:", resultado.status_message);
			console.log(url);
			resultado = {};
		}

		// Fin
		return resultado;
	},
};
