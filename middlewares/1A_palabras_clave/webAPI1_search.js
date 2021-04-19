// ************ Requires ************
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// ************ Variables ************
const API_key = path.join(__dirname, '../../backup/API_key.json');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

module.exports = async (palabras_clave) => {
	// PARTES DEL URL
	//let url = "https://api.themoviedb.org/3/search/movie?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es-ES&query=karol%20uomo%20papa&page=1&include_adult=false"
	//let query = "karol%20uomo%20papa"
	let A_izquierda = "https://api.themoviedb.org/3/search/movie?api_key=";
	let B_clave = leer(API_key);
	let C_medio = "&language=es-ES&query=";
	let E_derecha  = "&page=1&include_adult=false"
	// QUERY
		let D_query = ""
		let prefijo = ""
		let palabras = palabras_clave.split(" ");
		palabras = palabras.filter(n => n != "")
		if (palabras.length > 1) {
			for (let i=0; i < palabras.length; i++) {
				if (i > 0) {prefijo="%20"}
				D_query = D_query + prefijo + palabras[i]
			}
		}
		let url = A_izquierda + B_clave + C_medio + D_query + E_derecha
		//return url
	// BUSCAR LA INFO
	//console.log(url)
	//fetch(url).then(response => response.json()).then(data => console.log(data))
	let resp = await fetch(url)
	let candidatas = await resp.json()
	//console.log("candidatas: " + candidatas)
	return candidatas
}