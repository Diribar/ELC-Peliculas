// ************ Requires ************
const detailsTMDB = require("./API/detailsTMDB_fetch");
const creditsTMDB = require("./API/creditsTMDB_fetch");
const funciones = require("./funcionesVarias");
const BD_varios = require("./base_de_datos/BD_varios");

module.exports = {
	API: async (id, rubroAPI) => {
		let lectura = await detailsTMDB(id, rubroAPI);
		if (rubroAPI == "movie") {
			credits = await creditsTMDB(id);
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
		if (form.fuente == "TMDB" && Object.keys(lectura).length > 0) {
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
						...funcionCrew(lectura.crew, "director", "Directing"),
						...funcionCrew(lectura.crew, "guion", "Writing"),
						...funcionCrew(lectura.crew, "musica", "Sound"),
				  })
				: "";
			lectura.production_countries.length > 0
				? (datosLectura.pais_id = lectura.production_countries.map(
						(n) => n.iso_3166_1
				  ))
				: "";
			lectura.cast.length > 0
				? (datosLectura.actores = lectura.cast
						.map((n) =>
							n.character != ""
								? n.name +
								  " (" +
								  funcionParentesis(n.character) +
								  ")"
								: n.name
						)
						.join(", "))
				: "";
		}
		let resultado = {
			...datosForm,
			...datosLectura,
		};
		return resultado;
	},

	procesarTV_TMDB: async (form, lectura) => {
		datosForm = {
			// Datos obtenidos del formulario
			fuente: form.fuente,
			rubroAPI: form.rubroAPI,
			tmdb_id: form.tmdb_id,
			nombre_original: form.nombre_original,
		};
		// Datos obtenidos de la API
		let datosLectura = {};
		if (form.fuente == "TMDB" && Object.keys(lectura).length > 0) {
			lectura.created_by.length > 0
				? (datosLectura.guion = lectura.created_by
						.map((n) => n.name)
						.join(", "))
				: "";
			lectura.name != ""
				? (datosLectura.nombre_castellano = lectura.name)
				: "";
			lectura.production_countries.length > 0
				? (datosLectura.pais_id = lectura.production_countries.map(
						(n) => n.iso_3166_1
				  ))
				: "";
			lectura.original_language != ""
				? (datosLectura.idioma_original = lectura.original_language)
				: "";
			lectura.overview != ""
				? (datosLectura.sinopsis = fuenteSinopsis(lectura.overview))
				: "";
			lectura.poster_path != ""
				? (datosLectura.avatar =
						"https://image.tmdb.org/t/p/original" +
						lectura.poster_path)
				: "";
			lectura.first_air_date != ""
				? (datosLectura.ano_estreno = parseInt(
						lectura.first_air_date.slice(0, 4)
				  ))
				: "";
			lectura.last_air_date != ""
				? (datosLectura.ano_fin = parseInt(
						lectura.last_air_date.slice(0, 4)
				  ))
				: "";
			lectura.production_companies.length > 0
				? (datosLectura.productor = lectura.production_companies
						.map((n) => n.name)
						.join(", "))
				: "";
			if (lectura.seasons.length > 0) {
				datosLectura.partes = lectura.seasons.map((n) => {
					partes = {
						tmdb_id: n.id,
						nombre_castellano: n.name,
						ano_estreno: parseInt(n.air_date.slice(0, 4)),
						cant_capitulos: n.episode_count,
						sinopsis: n.overview,
						orden_secuencia: n.season_number,
					};
					n.poster_path != ""
						? (partes.avatar =
								"https://image.tmdb.org/t/p/original" +
								n.poster_path)
						: "";
					return partes;
				});
			}
		}
		let resultado = {
			...datosForm,
			...datosLectura,
		};
		return resultado;
	},

	procesarColeccion_TMDB: async (form, lectura) => {
		datosForm = {
			// Datos obtenidos del formulario
			fuente: form.fuente,
			rubroAPI: form.rubroAPI,
			tmdb_id: form.tmdb_id,
			nombre_original: form.nombre_original,
		};
		// Datos obtenidos de la API
		let datosLectura = {};
		if (form.fuente == "TMDB" && Object.keys(lectura).length > 0) {
			lectura.name != ""
				? (datosLectura.nombre_castellano = lectura.name)
				: "";
			lectura.overview != ""
				? (datosLectura.sinopsis = fuenteSinopsis(lectura.overview))
				: "";
			lectura.poster_path != ""
				? (datosLectura.avatar =
						"https://image.tmdb.org/t/p/original" +
						lectura.poster_path)
				: "";
			if (lectura.parts.length > 0) {
				datosLectura.ano_estreno = Math.min(
					...lectura.parts.map((n) =>
						parseInt(n.release_date.slice(0, 4))
					)
				);
				datosLectura.ano_fin = Math.max(
					...lectura.parts.map((n) =>
						parseInt(n.release_date.slice(0, 4))
					)
				);
				datosLectura.partes = lectura.parts.map((n) => {
					partes = {
						tmdb_id: n.id,
						nombre_castellano: n.title,
						nombre_original: n.original_title,
						sinopsis: fuenteSinopsis(n.overview),
						ano_estreno: parseInt(n.release_date.slice(0, 4)),
					};
					n.poster_path != ""
						? (partes.avatar =
								"https://image.tmdb.org/t/p/original" +
								n.poster_path)
						: "";
					return partes;
				});
			}
		}
		let resultado = {
			...datosForm,
			...datosLectura,
		};
		return resultado;
	},

	procesarProducto_FA: async (dato) => {
		// Obtener los campos del formulario
		let { rubroAPI, direccion, contenido } = dato;
		// Obtener el FA_id a partir de la dirección
		aux = direccion.indexOf("www.filmaffinity.com/");
		direccion = direccion.slice(aux + 21);
		aux = direccion.indexOf("/");
		direccion = direccion.slice(aux + 5);
		aux = direccion.indexOf(".html");
		direccion = direccion.slice(0, aux);
		fa_id = direccion;
		// Procesar el contenido
		contenido = contenido.split("\r\n");
		contenido = funciones.procesarContenidoFA(contenido);
		let resultado = {
			fuente: "FA",
			rubroAPI,
			fa_id,
			...contenido,
		};
		if (resultado.pais_nombre) {
			pais_id = await BD_varios.ObtenerFiltrandoPorCampo(
				"paises",
				"nombre",
				resultado.pais_nombre
			);
			pais_id.length > 0
				? (resultado.pais_id = pais_id.map((n) => n.id))
				: "";
			delete resultado.pais_nombre;
		}
		return resultado;
	},
};

const fuenteSinopsis = (sinopsis) => {
	sinopsis != "" && !sinopsis.includes("(FILMAFFINITY)")
		? (sinopsis = sinopsis + " (TMDB)")
		: "";
	return sinopsis;
};

const funcionParentesis = (dato) => {
	desde = dato.indexOf(" (");
	hasta = dato.indexOf(")");
	desde > 0 ? (dato = dato.slice(0, desde) + dato.slice(hasta + 1)) : "";
	return dato;
};

const funcionCrew = (crew, campo_ELC, campo_TMDB) => {
	if (crew.filter((n) => n.department == campo_TMDB).length > 0) {
		valor = crew
			.filter((n) => n.department == campo_TMDB)
			.map((m) => m.name)
			.join(", ");
		return { [campo_ELC]: valor };
	}
	return;
};
