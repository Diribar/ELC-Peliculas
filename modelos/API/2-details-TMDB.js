// ************ Requires ************
const API_key = "e90d1beb11c74cdf9852d97a354a6d45";
const fetch = require("node-fetch");

module.exports = async (ID, rubro) => {
	// PARTES DEL URL
	// "https://api.themoviedb.org/3/movie/     99049?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es"
	// "https://api.themoviedb.org/3/collection/97919?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es"
	// "https://api.themoviedb.org/3/tv/        61865?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es"
	let url =
		"https://api.themoviedb.org/3/" +
		rubro +
		"/" +
		ID +
		"?api_key=" +
		API_key +
		"&language=es";
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
