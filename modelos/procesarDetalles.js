const details_TMDB = require("./API/details_TMDB_fetch");
const credits_TMDB = require("./API/credits_TMDB_fetch");

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
		datosForm = {
			// Datos obtenidos del formulario
			fuente: form.fuente,
			rubroAPI: form.rubroAPI,
			tmdb_id: form.tmdb_id,
			nombre_original: form.nombre_original,
		};
		// Datos obtenidos de la API
		let datosLectura = {};
		if (form.fuente == "TMDB") {
			// Función para 'Crew'
			let funcionCrew = (campo_ELC, campo_TMDB) => {
				if (
					lectura.crew.filter((n) => n.department == campo_TMDB)
						.length > 0
				) {
					valor = lectura.crew
						.filter((n) => n.department == campo_TMDB)
						.map((m) => m.name)
						.join(", ");
					return { [campo_ELC]: valor };
				}
				return;
			};
			let funcionPersonaje = (personaje) => {
				desde = personaje.indexOf(" (");
				hasta = personaje.indexOf(")");
				desde > 0 ? personaje = personaje.slice(0, desde) + personaje.slice(hasta+1): ""
				return personaje
			}

			// Datos obtenidos de la API
			lectura.belongs_to_collection != null
				? (datosLectura.coleccion_tmdb_id =
						lectura.belongs_to_collection)
				: "";
			lectura.imdb_id != ""
				? (datosLectura.imdb_id = lectura.imdb_id)
				: "";
			lectura.overview != ""
				? (datosLectura.sinopsis = fuenteSinopsis(lectura.overview))
				: "";
			lectura.poster_path != ""
				? (datosLectura.avatar =
						"https://image.tmdb.org/t/p/original" +
						lectura.poster_path)
				: "";
			lectura.release_date != ""
				? (datosLectura.ano_estreno = parseInt(
						lectura.release_date.slice(0, 4)
				  ))
				: "";
			lectura.runtime != null
				? (datosLectura.duracion = lectura.runtime)
				: "";
			lectura.title != ""
				? (datosLectura.nombre_castellano = lectura.title)
				: "";
			lectura.production_companies.length > 0
				? (datosLectura.productor = lectura.production_companies
						.map((n) => n.name)
						.join(", "))
				: "";
			lectura.crew.length > 0
				? (datosLectura = {
						...datosLectura,
						...funcionCrew("director", "Directing"),
						...funcionCrew("guion", "Writing"),
						...funcionCrew("musica", "Sound"),
				  })
				: "";
			lectura.production_countries.length > 0
				? (datosLectura.pais_id = lectura.production_countries.map(
						(n) => n.iso_3166_1
				  ))
				: "";
			lectura.cast.length > 0
				? (datosLectura.actores = lectura.cast
						.map((n) => n.name + " (" + funcionPersonaje(n.character) + ")")
						.join(", "))
				: "";
		}
		//console.log(resultado);
		let resultado = {
			...datosForm,
			...datosLectura,
		};
		return resultado;
	},

	procesarTV_TMDB: async (form, lectura) => {
		resultado = {
			// Datos obtenidos del formulario
			fuente: form.fuente,
			rubroAPI: form.rubroAPI,
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
						cant_capitulos: n.episode_count,
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
			// Datos obtenidos del formulario
			fuente: form.fuente,
			rubroAPI: form.rubroAPI,
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
					...lectura.parts.map((n) =>
						parseInt(n.release_date.slice(0, 4))
					)
				),
				ano_fin: Math.max(
					...lectura.parts.map((n) =>
						parseInt(n.release_date.slice(0, 4))
					)
				),
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
	sinopsis != "" && !sinopsis.includes("(FILMAFFINITY)")
		? (sinopsis = sinopsis + " (TMDB)")
		: "";
	return sinopsis;
};
