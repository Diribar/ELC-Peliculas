"use strict";
// ************ Requires ************
const API_key = process.env.API_key;
const fetch = require("node-fetch");

module.exports = async (palabrasClave, TMDB_entidad, page) => {
	// PARTES DEL URL
	// "https://api.themoviedb.org/3/search/movie      ?api_key=&language=es&query=karol%20uomo%20papa&page=1&include_adult=false"
	// "https://api.themoviedb.org/3/search/collection ?api_key=&language=es&query=karol%20uomo%20papa&page=1
	// "https://api.themoviedb.org/3/search/tv         ?api_key=&language=es&query=karol%20uomo%20papa&page=1&include_adult=false"
	// let version = TMDB_entidad != "collection" ? 4 : 3;
	let version = 3;
	let url =
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
	// BUSCAR LA INFO
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
};
