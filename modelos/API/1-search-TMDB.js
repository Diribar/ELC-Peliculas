// ************ Requires ************
const API_key = "e90d1beb11c74cdf9852d97a354a6d45";
const fetch = require("node-fetch");

module.exports = async (palabras_clave, rubro, page) => {
	// PARTES DEL URL
	// "https://api.themoviedb.org/4/search/movie      ?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es&query=karol%20uomo%20papa&page=1&include_adult=false"
	// "https://api.themoviedb.org/3/search/collection ?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es&query=karol%20uomo%20papa&page=1
	// "https://api.themoviedb.org/4/search/tv         ?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es&query=karol%20uomo%20papa&page=1&include_adult=false"
	let url =
		"https://api.themoviedb.org/3/search/" +
		rubro +
		"?api_key=" +
		API_key +
		"&language=es&query=" +
		palabras_clave +
		"&page=" +
		page +
		"&include_adult=false";
	// BUSCAR LA INFO
	let resultado = await fetch(url).then((n) => n.json());
	if (rubro == "collection" && resultado.hasOwnProperty('success') && resultado.success == false) {
		console.log(url);
		console.log(resultado);
		resultado = {
			page: 1,
			results: [],
			total_pages: 1,
			total_results: 0,
		};
		console.log(resultado);
	}
	return resultado;
};
