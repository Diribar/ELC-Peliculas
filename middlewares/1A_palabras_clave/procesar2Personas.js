// Requires *************************
const path = require('path');

// Funciones y Variables ************
const API_credits = require(path.join(__dirname, '/webAPI3_credits'));

module.exports = async (ID) => {
	// Conseguir los datos
	let personas = await API_credits(ID);
	let imagen = ""
	// Conseguir CREW
	let crew = personas.crew;
	let [Director_Peli, Director, Guion_Peli, Guion, Musica_Peli, Musica] = [[], [], [], [], [], []]
	for (let i=0; i < crew.length; i++) {
		imagen = crew[i].profile_path; if (imagen!=null) {imagen = "https://image.tmdb.org/t/p/original" + imagen}
		if (crew[i].department == "Directing") {
			Director_Peli.push({"director_ID": crew[i].id,"peli_ID": ID})
			Director.push({"director_ID": crew[i].id,"nombre": crew[i].name, "imagen": imagen})
		}
		if (crew[i].department == "Writing") {
			Guion_Peli.push({"guion_ID": crew[i].id,"peli_ID": ID})
			Guion.push({"guion_ID": crew[i].id,"nombre": crew[i].name,"imagen": imagen})
		}
		if (crew[i].department == "Sound") {
			Musica_Peli.push({"musica_ID": crew[i].id,"peli_ID": ID})
			Musica.push({"musica_ID": crew[i].id,"nombre": crew[i].name,"imagen": imagen})
		}
	}

	// Conseguir ACTORES
	let cast = personas.cast;
	let [Actor_Peli, Actores] = [[], []]
	for (let i=0; i < cast.length; i++) {
		imagen = cast[i].profile_path
		if (imagen!=null) {imagen = "https://image.tmdb.org/t/p/original" + imagen}
		Actor_Peli.push({
			"actor_ID": cast[i].id,
			"peli_ID": ID,
			"personaje": cast[i].character, 
			"prioridad": cast[i].order
		})
		Actores.push(
			{"actor_ID": cast[i].id,
			"nombre": cast[i].name,
			"imagen": imagen})
	}

	return [Director, Director_Peli, Guion, Guion_Peli, Musica, Musica_Peli, Actores, Actor_Peli]
}
