// ************ Requires ************
const fetch = require('node-fetch');

module.exports = async (palabras_clave) => {
	// PARTES DEL URL
	// "https://filmaffinity-unofficial.herokuapp.com/api/search?q=preferisco%20paradiso&lang=ES"
	let A_prefijo = "https://filmaffinity-unofficial.herokuapp.com/api/search?q=";
	let B_query = "";
	let C_sufijo = "&lang=ES";
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
	let resultados = await fetch(url).then((n) => n.json());
	return resultados;
}
