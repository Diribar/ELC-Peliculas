const details_TMDB = require("./details_TMDB_fetch");
const credits_TMDB = require("./credits_TMDB_fetch");

module.exports = {
	API: async (id, rubroAPI) => {
		let lectura = await details_TMDB(id, rubroAPI);
		if (rubroAPI == "movie") {
			credits = await credits_TMDB(id);
			lectura = {
				...lectura,
				...credits,
			};
		}
		return lectura;
	},

	procesarPelicula_TMDB: async (form, lectura) => {
		resultado = {
			rubroVista: "Película",
			// Datos obtenidos del formulario
			fuente: form.fuente,
			tmdb_id: form.tmdb_id,
			nombre_original: form.nombre_original,
		};
		// Datos obtenidos de la API
		if (form.fuente == "TMDB") {
			resultado = {
				...resultado,
				coleccion_tmdb_id: lectura.belongs_to_collection,
				imdb_id: lectura.imdb_id,
				idioma_original: lectura.original_language,
				sinopsis: fuenteSinopsis(lectura.overview),
				avatar:
					"https://image.tmdb.org/t/p/original" + lectura.poster_path,
				pais_id: lectura.production_countries.map((n) => n.iso_3166_1),
				ano_estreno: parseInt(lectura.release_date.slice(0, 4)),
				duracion: lectura.runtime,
				nombre_castellano: lectura.title,
				director: lectura.crew
					.filter((n) => n.department == "Directing")
					.map((n) => n.name)
					.join(", "),
				guion: lectura.crew
					.filter((n) => n.department == "Writing")
					.map((n) => n.name)
					.join(", "),
				musica: lectura.crew
					.filter((n) => n.department == "Sound")
					.map((n) => n.name)
					.join(", "),
				actores: lectura.cast
					.map((n) => n.name + " (" + n.character + ")")
					.join(", "),
				productor: lectura.production_companies
					.map((n) => n.name)
					.join(", "),
			};
		}
		//console.log(resultado);
		return resultado;
	},

	procesarTV_TMDB: async (form, lectura) => {
		resultado = {
			rubroVista: "Colección",
			// Datos obtenidos del formulario
			fuente: form.fuente,
			tmdb_id: form.tmdb_id,
			nombre_original: form.nombre_original,
		};
		// Datos obtenidos de la API
		if (form.fuente == "TMDB") {
			resultado = {
				...resultado,
				guion: lectura.created_by.map((n) => n.name).join(", "),
				nombre_castellano: lectura.name,
				pais_id: lectura.production_countries.map((n) => n.iso_3166_1),
				idioma_original: lectura.original_language,
				sinopsis: fuenteSinopsis(lectura.overview),
				avatar:
					"https://image.tmdb.org/t/p/original" + lectura.poster_path,
				ano_estreno: parseInt(lectura.first_air_date.slice(0, 4)),
				ano_fin: parseInt(lectura.last_air_date.slice(0, 4)),
				productor: lectura.production_companies
					.map((n) => n.name)
					.join(", "),
				partes: lectura.seasons.map((n) => {
					return {
						tmdb_id: n.id,
						nombre_castellano: n.name,
						ano_estreno: parseInt(n.air_date.slice(0, 4)),
						sinopsis: n.overview,
						avatar:
							"https://image.tmdb.org/t/p/original" +
							n.poster_path,
						orden_secuencia: n.season_number,
					};
				}),
			};
		}
		//console.log(resultado);
		return resultado;
	},

	procesarColeccion_TMDB: async (form, lectura) => {
		resultado = {
			rubroVista: "Colección",
			// Datos obtenidos del formulario
			fuente: form.fuente,
			tmdb_id: form.tmdb_id,
			nombre_original: form.nombre_original,
		};
		// Datos obtenidos de la API
		if (form.fuente == "TMDB") {
			resultado = {
				...resultado,
				nombre_castellano: lectura.name,
				sinopsis: fuenteSinopsis(lectura.overview),
				avatar:
					"https://image.tmdb.org/t/p/original" + lectura.poster_path,
				ano_estreno: Math.min(
					...lectura.parts.map((n) => n.release_date)
				),
				ano_fin: Math.max(...lectura.parts.map((n) => n.release_date)),
				partes: lectura.parts.map((n) => {
					return {
						tmdb_id: n.id,
						nombre_castellano: n.title,
						nombre_original: n.original_title,
						sinopsis: fuenteSinopsis(n.overview),
						avatar:
							"https://image.tmdb.org/t/p/original" +
							n.poster_path,
						ano_estreno: parseInt(n.release_date.slice(0, 4)),
					};
				}),
			};
		}
		//console.log(resultado);
		return resultado;
	},
};

const fuenteSinopsis = (sinopsis) => {
	(sinopsis != "" && !sinopsis.includes("FILMAFFINITY")) ? sinopsis = sinopsis + " (TMDB)" : ""
	return sinopsis
}
// res.cookie("fuente", req.body.fuente, { maxAge: 60 * 60 * 1000 });
