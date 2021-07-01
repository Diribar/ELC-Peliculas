// ************ Requires ************
const API_key = "e90d1beb11c74cdf9852d97a354a6d45";
const fetch = require('node-fetch');

module.exports = async (palabras_clave, rubro) => {
	// PARTES DEL URL
	// "https://api.themoviedb.org/4/search/movie      ?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es&query=karol%20uomo%20papa&page=1&include_adult=false"
	// "https://api.themoviedb.org/3/search/collection ?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es&query=karol%20uomo%20papa&page=1
	// "https://api.themoviedb.org/4/search/tv         ?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es&query=karol%20uomo%20papa&page=1&include_adult=false"
	let A_prefijoRubro = "https://api.themoviedb.org/3/search/";
	let B_rubro = rubro
	let C_prefijoClave = "?api_key=";
	let D_clave = API_key;
	let E_prefijoQuery = "&language=es&query=";
	let F_query = "";
	let G_pagina = "&page=1"
	let H_adult = "&include_adult=false";
	// Convertir "palabras_clave" en el query
	let palabras = palabras_clave.includes(" ")
		? palabras_clave.split(" ").filter((n) => n != "")
		: palabras_clave;
	let prefijo = "";
	F_query = palabras[0];
	if (Array.isArray(palabras)) {
		for (let i = 1; i < palabras.length; i++) {
			i > 0 && prefijo == "" ? (prefijo = "%20") : "";
			F_query = F_query + prefijo + palabras[i];
		}
	}
	let url =
		A_prefijoRubro +
		B_rubro +
		C_prefijoClave +
		D_clave +
		E_prefijoQuery +
		F_query +
		G_pagina +
		H_adult;
	// BUSCAR LA INFO
	let resultados = await fetch(url).then((n) => n.json());
	return resultados;
}