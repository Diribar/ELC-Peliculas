// ************ Requires ************
const API_key = "e90d1beb11c74cdf9852d97a354a6d45";
const fetch = require("node-fetch");

module.exports = async (ID) => {
	// PARTES DEL URL
	//let url = "https://api.themoviedb.org/4/movie/38516/credits?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es-ES"
	let url =
		"https://api.themoviedb.org/4/movie/" +
		ID +
		"/credits?api_key=" +
		API_key +
		"&language=es-ES";
	// BUSCAR LA INFO
	let resultado = await fetch(url).then((n) => n.json());
	if (resultado.hasOwnProperty("success") && resultado.success == false) {
		console.log(url);
		console.log(resultado);
		resultado = {
			page: 1,
			results: [],
			total_pages: 1,
			total_results: 0,
		};
	}
	return resultado;
};
