// ************ Requires ************
let detailsTMDB = require("../APIs_TMDB/2-Details");
let creditsTMDB = require("../APIs_TMDB/3-Credits");
let BD_varias = require("../BD/varias");
let varias = require("../Varias/varias");

module.exports = {
	// ControllerVista (desambiguarGuardar)
	infoTMDBparaDD_movie: async (datos) => {
		let datosIniciales = {fuente: "TMDB", ...datos};
		// Obtener las API
		let general = detailsTMDB("movie", datos.TMDB_id);
		let credits = creditsTMDB(datos.TMDB_id);
		let datosAPI = await Promise.all([general, credits]).then(([a, b]) => {
			return {...a, ...b};
		});
		// Cambiarle el nombre a los campos y procesar la información
		let datosAPI_renamed = {};
		if (Object.keys(datosAPI).length > 0) {
			// Datos de la colección a la que pertenece, si corresponde
			if (datosAPI.belongs_to_collection != null) {
				datosAPI_renamed.en_coleccion = true;
				datosAPI_renamed.en_colec_TMDB_id = datosAPI.belongs_to_collection.id;
				datosAPI_renamed.en_colec_nombre = datosAPI.belongs_to_collection.name;
				// ELC_id de la colección
				datosAPI_renamed.en_colec_id = await BD_varias.obtenerELC_id({
					entidad: "colecciones",
					campo: "TMDB_id",
					valor: datosAPI_renamed.en_colec_TMDB_id,
				});
				datosIniciales.producto = "Capítulo";
				datosIniciales.entidad = "capitulos";
			} else {
				datosAPI_renamed.en_coleccion = false;
				datosIniciales.producto = "Película";
				datosIniciales.entidad = "peliculas";
			}
			// IMDB_id, nombre_original, nombre_castellano
			if (datosAPI.IMDB_id) datosAPI_renamed.IMDB_id = datosAPI.imdb_id;
			if (datosAPI.original_title) datosAPI_renamed.nombre_original = datosAPI.original_title;
			if (datosAPI.title) datosAPI_renamed.nombre_castellano = datosAPI.title;
			// Idioma
			if (datosAPI.original_language) {
				datosAPI_renamed.idioma_original = datosAPI.original_language;
				if (
					datosAPI.original_language == "es" ||
					(datosAPI.spoken_languages &&
						datosAPI.spoken_languages.find((n) => n.iso_639_1 == "es"))
				)
					datosAPI_renamed.en_castellano_id = 1;
			}
			// año de estreno, duración, país de origen
			if (datosAPI.release_date)
				datosAPI_renamed.ano_estreno = parseInt(datosAPI.release_date.slice(0, 4));
			if (datosAPI.runtime != null) datosAPI_renamed.duracion = datosAPI.runtime;
			if (datosAPI.production_countries.length > 0)
				datosAPI_renamed.paises_id = datosAPI.production_countries
					.map((n) => n.iso_3166_1)
					.join(", ");
			// sinopsis, avatar
			if (datosAPI.overview)
				datosAPI_renamed.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path)
				datosAPI_renamed.avatar =
					"https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// Credits
			if (datosAPI.production_companies.length > 0)
				datosAPI_renamed.productor = datosAPI.production_companies
					.map((n) => n.name)
					.join(", ");
			if (datosAPI.crew.length > 0)
				datosAPI_renamed = {
					...datosAPI_renamed,
					...funcionCrew(datosAPI.crew, "director", "Directing"),
					...funcionCrew(datosAPI.crew, "guion", "Writing"),
					...funcionCrew(datosAPI.crew, "musica", "Sound"),
				};
			if (datosAPI.cast.length > 0)
				datosAPI_renamed.actores = datosAPI.cast
					.map((n) => n.name + (n.character ? " (" + n.character + ")" : ""))
					.join(", ");
			while (datosAPI.cast.length > 0 && datosAPI_renamed.actores.length > 500) {
				aux = datosAPI_renamed.actores;
				datosAPI_renamed.actores = aux.slice(0, aux.lastIndexOf(","));
			}
		}
		// Consolidar los resultados
		let resultado = {
			...datosIniciales,
			...datosAPI_renamed,
		};

		return varias.convertirLetrasAlCastellano(resultado);
	},

	// ControllerVista (confirmar)
	agregarCapitulosDeCollection: async function (coleccion_id, capitulos_TMDB_id) {
		// Replicar para todos los capítulos de la colección
		for (let i = 0; i < capitulos_TMDB_id.length; i++) {
			// Si el capítulo no existe, agregarlo
			existe = await BD_varias.obtenerELC_id({
				entidad: "capitulos",
				campo: "TMDB_id",
				valor: capitulos_TMDB_id[i],
			});
			if (!existe)
				await this.infoTMDBparaDD_movie({
					TMDB_id: capitulos_TMDB_id[i],
				})
					.then((n) => {
						return {
							...n,
							coleccion_id,
							capitulo: i + 1,
							creada_por_id: 2,
							entidad: "capitulos",
						};
					})
					.then((n) => BD_varias.agregarRegistro(n));
		}
		return;
	},

	// ControllerVista (desambiguarGuardar)
	infoTMDBparaDD_tv: async (datos) => {
		// Datos obtenidos sin la API
		datosIniciales = {
			producto: "Colección",
			entidad: "colecciones",
			fuente: "TMDB",
			...datos,
		};
		// Obtener las API
		let datosAPI = await detailsTMDB("tv", datos.TMDB_id);
		// Cambiarle el nombre a los campos y procesar la información
		let datosAPI_renamed = {};
		if (Object.keys(datosAPI).length > 0) {
			// nombre_original, nombre_castellano, duración de capítulos
			if (datosAPI.original_name) datosAPI_renamed.nombre_original = datosAPI.original_name;
			if (datosAPI.name) datosAPI_renamed.nombre_castellano = datosAPI.name;
			if (datosAPI.episode_run_time && datosAPI.episode_run_time.length == 1)
				datosAPI_renamed.duracion = datosAPI.episode_run_time[0];
			// Idioma
			if (datosAPI.original_language) {
				datosAPI_renamed.idioma_original = datosAPI.original_language;
				if (
					datosAPI.original_language == "es" ||
					(datosAPI.spoken_languages &&
						datosAPI.spoken_languages.find((n) => n.iso_639_1 == "es"))
				)
					datosAPI_renamed.en_castellano_id = 1;
			}
			// año de estreno, año de fin, país de origen
			if (datosAPI.first_air_date)
				datosAPI_renamed.ano_estreno = parseInt(datosAPI.first_air_date.slice(0, 4));
			if (datosAPI.last_air_date)
				datosAPI_renamed.ano_fin = parseInt(datosAPI.last_air_date.slice(0, 4));
			if (datosAPI.production_countries.length > 0)
				datosAPI_renamed.paises_id = datosAPI.production_countries
					.map((n) => n.iso_3166_1)
					.join(", ");
			// sinopsis, avatar
			if (datosAPI.overview)
				datosAPI_renamed.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path)
				datosAPI_renamed.avatar =
					"https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// Credits
			if (datosAPI.created_by.length > 0)
				datosAPI_renamed.guion = datosAPI.created_by.map((n) => n.name).join(", ");
			if (datosAPI.production_companies.length > 0)
				datosAPI_renamed.productor = datosAPI.production_companies
					.map((n) => n.name)
					.join(", ");
			// Temporadas
			datosAPI.seasons = datosAPI.seasons.filter((n) => n.season_number > 0);
			datosAPI_renamed.cantTemporadas = datosAPI.seasons.length;
			datosAPI_renamed.cantCapitulos = datosAPI.seasons
				.map((n) => n.episode_count)
				.reduce((a, b) => {
					return a + b;
				});
			console.log(datosAPI_renamed.cantCapitulos);
		}
		let resultado = {
			...datosIniciales,
			...datosAPI_renamed,
		};
		return varias.convertirLetrasAlCastellano(resultado);
	},

	infoTMDBparaAgregarCapitulosDeTV: (datosCol, datosTemp, datosCap) => {
		// Datos fijos
		let datos = {entidad: "capitulos", fuente: "TMDB", creada_por_id: 2};

		// Datos de la colección
		datos.coleccion_id = datosCol.id;
		if (datosCol.duracion) datos.duracion = datosCol.duracion;
		if (datosCol.idioma_original) datos.idioma_original = datosCol.idioma_original;
		if (datosCol.en_castellano_id != 2) datos.en_castellano_id = datosCol.en_castellano_id;
		if (datosCol.en_color_id != 2) datos.en_color_id = datosCol.en_color_id;
		datos.categoria_id = datosCol.categoria_id;
		datos.subcategoria_id = datosCol.subcategoria_id;
		datos.publico_sugerido_id = datosCol.publico_sugerido_id;

		// Datos de la temporada
		if (!datosCol.tempUnica) datos.temporada = datosTemp.season_number;

		// Datos distintivos del capítulo
		datos.capitulo = datosCap.episode_number;
		datos.TMDB_id = datosCap.id;
		if (datosCap.name) datos.nombre_castellano = datosCap.name;
		if (datosCap.air_date) datos.ano_estreno = datosCap.air_date;
		if (datosCap.crew.length > 0) {
			datos = {
				...datos,
				...funcionCrew(datosCap.crew, "director", "Directing"),
				...funcionCrew(datosCap.crew, "guion", "Writing"),
				...funcionCrew(datosCap.crew, "musica", "Sound"),
			};
		}
		if (datosCap.guest_stars.length > 0) {
			datos.actores = datosCap.guest_stars
				.map((n) => n.name + (n.character ? " (" + n.character + ")" : ""))
				.join(", ");
		}
		while (datosCap.guest_stars.length > 0 && datos.actores.length > 500) {
			aux = datos.actores;
			datos.actores = aux.slice(0, aux.lastIndexOf(","));
		}
		if (datosCap.overview) datos.sinopsis = datosCap.overview;
		avatar = datosCap.still_path
			? datosCap.still_path
			: datosCap.poster_path
			? datosCap.poster_path
			: "";
		if (avatar) datos.avatar = "https://image.tmdb.org/t/p/original" + avatar;
		return datos;
	},

	// ControllerVista (confirmar)
	agregarCapitulosDeTV: async function (datosCol) {
		// Detectar si es una única temporada
		datosCol.tempUnica = datosCol.cantTemporadas == 1;
		// Loop de TEMPORADAS ***********************************************
		for (temporada = 1; temporada <= datosCol.cantTemporadas; temporada++) {
			// Datos de UNA TEMPORADA
			datosTemp = await detailsTMDB(temporada, registro.TMDB_id);
			// Loop de CAPITULOS ********************************************
			for (episode of datosTemp.episodes) {
				datosCap = this.infoTMDBparaAgregarCapitulosDeTV(datosCol, datosTemp, episode);
				await BD_varias.agregarRegistro(datosCap);
			}
		}
		return;
	},

	// ControllerVista (desambiguarGuardar)
	infoTMDBparaDD_collection: async (datos) => {
		// Datos obtenidos sin la API
		datosIniciales = {
			producto: "Colección",
			entidad: "colecciones",
			fuente: "TMDB",
			...datos,
		};
		// Obtener las API
		let datosAPI = await detailsTMDB("collection", datos.TMDB_id);
		// Cambiarle el nombre a los campos y procesar la información
		let datosAPI_renamed = {};
		if (Object.keys(datosAPI).length > 0) {
			// Datos obtenidos de la API
			// nombre_castellano
			if (datosAPI.name) datosAPI_renamed.nombre_castellano = datosAPI.name;
			// Idioma
			if (datosAPI.original_language) {
				datosAPI_renamed.idioma_original = datosAPI.original_language;
				if (datosAPI.original_language == "es") datosAPI_renamed.en_castellano_id = 1;
			}
			// año de estreno, año de fin
			if (datosAPI.parts.length > 0) {
				datosAPI_renamed.ano_estreno = Math.min(
					...datosAPI.parts.map((n) => parseInt(n.release_date.slice(0, 4)))
				);
				datosAPI_renamed.ano_fin = Math.max(
					...datosAPI.parts.map((n) => parseInt(n.release_date.slice(0, 4)))
				);
			}
			// sinopsis, avatar
			if (datosAPI.overview)
				datosAPI_renamed.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path)
				datosAPI_renamed.avatar =
					"https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// ID de los capitulos
			datosAPI_renamed.capitulosId = datosAPI.parts.map((n) => n.id);
		}
		let resultado = {
			...datosIniciales,
			...datosAPI_renamed,
		};
		return varias.convertirLetrasAlCastellano(resultado);
	},

	// ControllerVista (copiarFA_Guardar)
	infoFAparaDD: async function (dato) {
		// Obtener los campos del formulario
		let {entidad, en_coleccion, direccion, avatar, contenido} = dato;
		// Generar la información
		producto = entidad == "peliculas" ? "Película" : "Colección";
		FA_id = this.obtenerFA_id(direccion);
		contenido = this.contenidoFA(contenido.split("\r\n"));
		if (contenido.pais_nombre) {
			contenido.paises_id = await varias.paisNombreToId(contenido.pais_nombre);
			delete contenido.pais_nombre;
		}
		// Generar el resultado
		let resultado = {
			producto,
			entidad,
			fuente: "FA",
			FA_id,
			en_coleccion,
			avatar,
			...contenido,
		};
		resultado = varias.convertirLetrasAlCastellano(resultado);
		return resultado;
	},

	// ControllerVista (copiarFA_Guardar)
	// ControllerAPI (obtenerFA_id)
	obtenerFA_id: (url) => {
		// Output para FE y BE
		aux = url.indexOf("www.filmaffinity.com/");
		url = url.slice(aux + 21);
		aux = url.indexOf("/film");
		url = url.slice(aux + 5);
		aux = url.indexOf(".html");
		FA_id = url.slice(0, aux);
		return FA_id;
	},

	// Función validar (copiarFA)
	// This (infoFAparaDD)
	contenidoFA: (contenido) => {
		// Output para FE y BE
		// Limpiar espacios innecesarios
		for (let i = 0; i < contenido.length; i++) {
			contenido[i] = contenido[i].trim();
		}
		// Armar el objeto literal
		let resultado = {};
		if (contenido.indexOf("Ficha") > 0)
			resultado.nombre_castellano = funcionParentesis(
				contenido[contenido.indexOf("Ficha") - 1]
			);
		if (contenido.indexOf("Título original") > 0)
			resultado.nombre_original = funcionParentesis(
				contenido[contenido.indexOf("Título original") + 1]
			);
		if (contenido.indexOf("Año") > 0)
			resultado.ano_estreno = parseInt(contenido[contenido.indexOf("Año") + 1]);
		if (contenido.indexOf("Duración") > 0) {
			let duracion = contenido[contenido.indexOf("Duración") + 1];
			resultado.duracion = parseInt(duracion.slice(0, duracion.indexOf(" ")));
		}
		if (contenido.indexOf("País") > 0) {
			let pais_nombre = contenido[contenido.indexOf("País") + 1];
			resultado.pais_nombre = pais_nombre.slice((pais_nombre.length + 1) / 2);
		}
		if (contenido.indexOf("Dirección") > 0)
			resultado.director = contenido[contenido.indexOf("Dirección") + 1];
		if (contenido.indexOf("Guion") > 0)
			resultado.guion = contenido[contenido.indexOf("Guion") + 1];
		if (contenido.indexOf("Música") > 0)
			resultado.musica = contenido[contenido.indexOf("Música") + 1];
		if (contenido.indexOf("Reparto") > 0)
			resultado.actores = contenido[contenido.indexOf("Reparto") + 1];
		if (contenido.indexOf("Productora") > 0)
			resultado.productor = contenido[contenido.indexOf("Productora") + 1];
		if (contenido.indexOf("Sinopsis") > 0) {
			aux = contenido[contenido.indexOf("Sinopsis") + 1];
			if (!aux.includes("(FILMAFFINITY)")) aux += " (FILMAFFINITY)";
			resultado.sinopsis = aux.replace(/"/g, "'");
		}
		return resultado;
	},

	agregarCapitulosFaltantes: async function (coleccion_id, TMDB_id) {
		// Obtener el API actualizada de la colección
		let datosAPI = await detailsTMDB("collection", TMDB_id);
		// Obtener el ID de los capitulos
		capitulos_TMDB_id = datosAPI.parts.map((n) => n.id);
		// Agregar los capítulos que correspondan
		await this.agregarCapitulosDeCollection(coleccion_id, capitulos_TMDB_id);
		return;
	},
};

// Funciones *********************
let fuenteSinopsisTMDB = (sinopsis) => {
	if (sinopsis && !sinopsis.includes("(FILMAFFINITY)")) sinopsis = sinopsis + " (TMDB)";
	return sinopsis;
};

let funcionCrew = (crew, campo_ELC, campo_TMDB) => {
	datos = valores = crew.filter((n) => n.department == campo_TMDB);
	if (datos.length > 0) {
		valores = datos.map((m) => m.name);
		let i = 1;
		while (i < valores.length) {
			if (valores[i] == valores[i - 1]) {
				valores.splice(i, 1);
			} else i++;
		}
		valores = valores.join(", ");
		return {[campo_ELC]: valores};
	}
	return;
};

let funcionParentesis = (dato) => {
	desde = dato.indexOf(" (");
	hasta = dato.indexOf(")");
	return desde > 0 ? dato.slice(0, desde) + dato.slice(hasta + 1) : dato;
};
