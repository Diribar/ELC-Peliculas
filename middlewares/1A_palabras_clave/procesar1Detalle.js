// Requires *************************
const fs = require('fs');
const path = require('path');

// Funciones y Variables ************
const API_details = require(path.join(__dirname, '/webAPI2_details'));

module.exports = async (ID) => {
	// Conseguir los datos
	let detalle1 = await API_details(ID);
	// Procesar los datos
	let detalle2 = {}
	detalle2.titulo_original = detalle1.original_title
	detalle2.titulo_castellano = detalle1.title
	detalle2.ano_estreno = detalle1.release_date.slice(0,4)
	detalle2.duracion = detalle1.runtime
	detalle2.TMDB_ID = detalle1.id
	detalle2.IMDB_ID = detalle1.imdb_id
	detalle2.imagen = "https://image.tmdb.org/t/p/original" + detalle1.poster_path
	detalle2.sinopsis = detalle1.overview

	return (detalle2)
}
