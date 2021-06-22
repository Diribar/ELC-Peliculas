// ************ Requires ************
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// ************ Variables ************
const API_key = path.join(__dirname, '../../backup/API_key.json');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

module.exports = async (ID) => {
	// PARTES DEL URL
	//let url = "https://api.themoviedb.org/4/movie/38516/credits?api_key=e90d1beb11c74cdf9852d97a354a6d45&language=es-ES"
	let A_izquierda = "https://api.themoviedb.org/4/movie/";
	let B_ID = ID
	let C_medio = "/credits?api_key=";
	let D_clave = leer(API_key);
	let E_derecha  = "&language=es-ES"
	let url = A_izquierda + B_ID + C_medio + D_clave + E_derecha
	// return url
	// BUSCAR LA INFO
	let resultado = await fetch(url).then(n => n.json())
	return resultado
}