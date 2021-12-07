// ************ Requires ************
const API_key = "e90d1beb11c74cdf9852d97a354a6d45";
const fetch = require("node-fetch");

module.exports = async (TMDB_id) => {
	// PARTES DEL URL
	// https://api.themoviedb.org/3/movie/38516/credits?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es-ES
	// https://api.themoviedb.org/3/tv/1781/credits?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es
	
	let url =
		"https://api.themoviedb.org/3/movie/" +
		TMDB_id +
		"/credits?api_key=" +
		API_key +
		"&language=es-ES";
	// BUSCAR LA INFO
	let resultado = await fetch(url).then((n) => n.json());
	if (resultado.hasOwnProperty("success") && resultado.success == false) {
		console.log("creditsTMDB_fetch", url, resultado);
		resultado = {
			page: 1,
			results: [],
			total_pages: 1,
			total_results: 0,
		};
	}
	return resultado;
};
