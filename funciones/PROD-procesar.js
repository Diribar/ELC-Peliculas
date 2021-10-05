// ************ Requires ************
let detailsTMDB = require("./API/detailsTMDB_fetch");
let creditsTMDB = require("./API/creditsTMDB_fetch");
let BD_varios = require("./BD/varios");
let BD_peliculas = require("./BD/peliculas");
let BD_colecciones = require("./BD/colecciones");

module.exports = {
	obtenerAPI: async (id, rubroAPI) => {
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

	pelicula_TMDB: async (form, lectura) => {
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
						.map(
							(n) =>
								n.name +
								(n.character != ""
									? " (" + n.character + ")"
									: "")
						)
						.join(", "))
				: "";
			while (
				lectura.cast.length > 0 &&
				datosLectura.actores.length > 500
			) {
				aux = datosLectura.actores;
				datosLectura.actores = aux.slice(0, aux.lastIndexOf(","));
			}
		}
		let resultado = {
			...datosForm,
			...datosLectura,
		};
		resultado = convertirLetrasAlCastellano(resultado);
		return resultado;
	},

	TV_TMDB: async (form, lectura) => {
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
		resultado = convertirLetrasAlCastellano(resultado);
		return resultado;
	},

	coleccion_TMDB: async (form, lectura) => {
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
		resultado = convertirLetrasAlCastellano(resultado);
		return resultado;
	},

	producto_FA: async (dato) => {
		// Obtener los campos del formulario
		let { rubroAPI, direccion, avatar, contenido } = dato;
		fa_id = this.obtenerFA_id(direccion);
		// Procesar el contenido
		contenido = contenido.split("\r\n");
		contenido = this.procesarContenidoFA(contenido);
		let resultado = {
			fuente: "FA",
			rubroAPI,
			fa_id,
			avatar,
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
		resultado = convertirLetrasAlCastellano(resultado);
		return resultado;
	},

	contenidoFA: (contenido) => {
		// Output para FE y BE
		// Limpiar espacios innecesarios
		for (let i = 0; i < contenido.length; i++) {
			contenido[i] = contenido[i].trim();
		}
		// Armar el objeto literal
		let resultado = {};
		contenido.indexOf("Ficha") > 0
			? (resultado.nombre_castellano = funcionParentesis(
					contenido[contenido.indexOf("Ficha") - 1]
			  ))
			: "";
		contenido.indexOf("Título original") > 0
			? (resultado.nombre_original = funcionParentesis(
					contenido[contenido.indexOf("Título original") + 1]
			  ))
			: "";
		contenido.indexOf("Año") > 0
			? (resultado.ano_estreno = parseInt(
					contenido[contenido.indexOf("Año") + 1]
			  ))
			: "";
		if (contenido.indexOf("Duración") > 0) {
			let duracion = contenido[contenido.indexOf("Duración") + 1];
			resultado.duracion = parseInt(
				duracion.slice(0, duracion.indexOf(" "))
			);
		}
		if (contenido.indexOf("País") > 0) {
			let pais_nombre = contenido[contenido.indexOf("País") + 1];
			resultado.pais_nombre = pais_nombre.slice(
				(pais_nombre.length + 1) / 2
			);
		}
		contenido.indexOf("Dirección") > 0
			? (resultado.director =
					contenido[contenido.indexOf("Dirección") + 1])
			: "";
		contenido.indexOf("Guion") > 0
			? (resultado.guion = contenido[contenido.indexOf("Guion") + 1])
			: "";
		contenido.indexOf("Música") > 0
			? (resultado.musica = contenido[contenido.indexOf("Música") + 1])
			: "";
		contenido.indexOf("Reparto") > 0
			? (resultado.actores = contenido[contenido.indexOf("Reparto") + 1])
			: "";
		contenido.indexOf("Productora") > 0
			? (resultado.productor =
					contenido[contenido.indexOf("Productora") + 1])
			: "";
		if (contenido.indexOf("Sinopsis") > 0) {
			aux = contenido[contenido.indexOf("Sinopsis") + 1];
			!aux.includes("(FILMAFFINITY)")
				? (aux = aux + " (FILMAFFINITY)")
				: "";
			resultado.sinopsis = aux.replace(/"/g, "'");
		}
		return resultado;
	},

	obtenerFA_id: (url) => {
		// Output para FE y BE
		// Obtener el FA_id a partir de la dirección
		aux = url.indexOf("www.filmaffinity.com/");
		url = url.slice(aux + 21);
		aux = url.indexOf("/film");
		url = url.slice(aux + 5);
		aux = url.indexOf(".html");
		fa_id = url.slice(0, aux);
		return fa_id;
	},

	obtenerELC_id: async (datos) => {
		// Definir variables
		rubro = datos.rubroAPI;
		tmdb_id = datos.tmdb_id;
		fa_id = datos.fa_id;
		// Verificar YaEnBD
		TMDB_enBD = tmdb_id ? await rutinaELC_id(rubro, "TMDB", tmdb_id) : "";
		FA_enBD = fa_id ? await rutinaELC_id(rubro, "FA", fa_id) : "";
		//console.log([TMDB_YaEnBD, FA_YaEnBD]);
		// Enviar el resultado
		return [TMDB_enBD, FA_enBD];
	},
};

// Funciones *********************
let fuenteSinopsis = (sinopsis) => {
	sinopsis != "" && !sinopsis.includes("(FILMAFFINITY)")
		? (sinopsis = sinopsis + " (TMDB)")
		: "";
	return sinopsis;
};
let funcionCrew = (crew, campo_ELC, campo_TMDB) => {
	if (crew.filter((n) => n.department == campo_TMDB).length > 0) {
		valor = crew
			.filter((n) => n.department == campo_TMDB)
			.map((m) => m.name)
			.join(", ");
		return { [campo_ELC]: valor };
	}
	return;
};
let convertirLetrasAlCastellano = (resultado) => {
	campos = Object.keys(resultado);
	valores = Object.values(resultado);
	for (let i = 0; i < campos.length; i++) {
		typeof valores[i] == "string"
			? (resultado[campos[i]] = valores[i]
					.replace(/ç/g, "c")
					.replace(/ë/g, "e")
					.replace(/ê/g, "e")
					.replace(/ľ/g, "l")
					.replace(/ö/g, "o")
					.replace(/ò/g, "o"))
			: "";
	}
	return resultado;
};
let funcionParentesis = (dato) => {
	desde = dato.indexOf(" (");
	hasta = dato.indexOf(")");
	return desde > 0 ? dato.slice(0, desde) + dato.slice(hasta + 1) : dato;
};
let rutinaELC_id = async (rubroAPI, fuente, id) => {
	// La respuesta se espera que sea 'true' or 'false'
	if (!rubroAPI || !id) return false;
	let parametro = fuente == "TMDB" ? "tmdb_id" : "fa_id";
	let resultado =
		rubroAPI == "movie"
			? await BD_peliculas.ObtenerELC_id(parametro, id)
			: await BD_colecciones.ObtenerELC_id(parametro, id);
	return resultado;
};
