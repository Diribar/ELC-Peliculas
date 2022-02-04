"use strict"
// ************ Requires ************
const API_key = "e90d1beb11c74cdf9852d97a354a6d45";
const fetch = require("node-fetch");

module.exports = async (palabrasClave, entidad_TMDB, page) => {
	// PARTES DEL URL
	// "https://api.themoviedb.org/4/search/movie      ?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es&query=karol%20uomo%20papa&page=1&include_adult=false"
	// "https://api.themoviedb.org/3/search/collection ?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es&query=karol%20uomo%20papa&page=1
	// "https://api.themoviedb.org/4/search/tv         ?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es&query=karol%20uomo%20papa&page=1&include_adult=false"
	let version = entidad_TMDB != "collection" ? 4 : 3;
	let url =
		"https://api.themoviedb.org/" +
		version +
		"/search/" +
		entidad_TMDB +
		"?api_key=" +
		API_key +
		"&language=es&query=" +
		palabrasClave +
		"&page=" +
		page +
		"&include_adult=false";
	// BUSCAR LA INFO
	let resultado = await fetch(url).then((n) => n.json());
	if (resultado.hasOwnProperty('success') && resultado.success == false) {
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
