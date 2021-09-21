// ************ Requires ************
const fetch = require('node-fetch');

module.exports = async (palabras_clave) => {
	// PARTES DEL URL
	// "https://filmaffinity-unofficial.p.rapidapi.com/movie/search/?query=padre%20pio&lang=es"
	let A_prefijo = "https://filmaffinity-unofficial.p.rapidapi.com/movie/search/?query=";
	let B_query = "";
	let C_sufijo = "&lang=es";
	// Convertir "palabras_clave" en el query
	let palabras = palabras_clave.includes(" ")
		? palabras_clave.split(" ").filter((n) => n != "")
		: palabras_clave;
	let prefijo = "";
	B_query = palabras[0];
	if (Array.isArray(palabras)) {
		for (let i = 1; i < palabras.length; i++) {
			i > 0 && prefijo == "" ? (prefijo = "%20") : "";
			B_query = B_query + prefijo + palabras[i];
		}
	}
	let url = A_prefijo + B_query + C_sufijo;
	// BUSCAR LA INFO
	let lectura = await fetch(url, {
		"method": "GET",
		"headers": {
			"x-rapidapi-key": "38160617ffmsh5c000753ddfbdacp171ef4jsne7960856af04",
			"x-rapidapi-host": "filmaffinity-unofficial.p.rapidapi.com"
		}
	})
	.then((n) => n.json())
	.catch(err => err);

	let resultados = []
	lectura == {"movies": []} || lectura == {type: 'invalid-json'} ? resultados = lectura.movies : ""

	return lectura
	//return resultados;
}
