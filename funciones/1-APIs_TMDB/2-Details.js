"use strict";
// ************ Requires ************
const API_key = process.env.API_key;
const fetch = require("node-fetch");

module.exports = async (TMDB_entidad, TMDB_id) => {
	// PARTES DEL URL
	// https://api.themoviedb.org/3/movie/    218275?api_key=&language=es&append_to_response=credits
	// https://api.themoviedb.org/3/collection/97919?api_key=&language=es
	// https://api.themoviedb.org/3/tv/        61865?api_key=&language=es
	// https://api.themoviedb.org/3/tv/		   61865/season/0?api_key=&language=es

	// Generar el agregado para consultar una temporada de TV
	let season
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
		"?api_key=" +
		API_key +
		"&language=es-ES" +
		(TMDB_entidad == "movie" ? "&append_to_response=credits" : "");
		// Se usa "credits", porque mejora el resultado de la API
	// BUSCAR LA INFO
	let resultado = await fetch(url).then((n) => n.json());
	if (resultado.hasOwnProperty("success") && !resultado.success) {
		console.log("detailsTMDB_fetch", url, resultado);
		resultado = {
			page: 1,
			results: [],
			total_pages: 1,
			total_results: 0,
		};
	}
	if (resultado.credits) delete resultado.credits
	return resultado;
};
