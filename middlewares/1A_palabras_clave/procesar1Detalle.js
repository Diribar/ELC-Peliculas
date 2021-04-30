// Requires *************************
const fs = require('fs');
const path = require('path');

// Funciones y Variables ************
const API_details = require(path.join(__dirname, '/webAPI2_details'));
//const BDpaisesPelis = require(path.join(__dirname, '../../bases_de_datos/tablas/BDpaisesPelis'));

module.exports = async (res, ID) => {
	// Conseguir los datos
	let detalle1 = await API_details(ID);
	// Procesar los datos
	let detalle2 = {}
	detalle2.titulo_original = detalle1.original_title
	detalle2.titulo_castellano = detalle1.title
	detalle2.ano_estreno = detalle1.release_date.slice(0,4)
	detalle2.duracion = detalle1.runtime
	detalle2.TMDB_ID = ID
	detalle2.IMDB_ID = detalle1.imdb_id
	detalle2.imagen = "https://image.tmdb.org/t/p/original" + detalle1.poster_path
	detalle2.sinopsis = detalle1.overview

	// Conseguir PRODUCTORA
	let productora = detalle1.production_companies;
	let [Productora_Peli, Productoras] = [[], []]
	for (let i=0; i < productora.length; i++) {
		Productoras.push({"productora_ID": productora[i].id,"nombre": productora[i].name,})
		Productora_Peli.push({"productora_ID": productora[i].id,"peli_ID": ID,})
	}
	
	// Conseguir PAÍS
	let pais = detalle1.production_countries;
	let [Pais_Peli, Paises] = [[], []]
	for (let i=0; i < pais.length; i++) {
		Paises.push({
			"pais_ID": pais[i].iso_3166_1,
			"nombre": BDpaisesPelis.find(n => n.ID == pais[i].iso_3166_1).nombre,
		})
		Pais_Peli.push({"pais_ID": pais[i].iso_3166_1,"peli_ID": ID,})
	}
	
	return [detalle2, Productoras, Productora_Peli, Paises, Pais_Peli]
}
