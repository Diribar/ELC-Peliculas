"use strict";
// ************ Requires ************
const API_key = process.env.API_key;
const fetch = require("node-fetch");

module.exports = async (TMDB_entidad, TMDB_id) => {
	// PARTES DEL URL
	// https://api.themoviedb.org/3/movie/38516/credits?api_key=&language=es-ES
	// https://api.themoviedb.org/3/tv/1781/credits?api_key=&language=es
	
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
