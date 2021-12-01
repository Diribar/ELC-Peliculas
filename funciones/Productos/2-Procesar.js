// ************ Requires ************
let detailsTMDB = require("../APIs_TMDB/2-Details");
let creditsTMDB = require("../APIs_TMDB/3-Credits");
let BD_varias = require("../BD/varias");
let varias = require("../Varias/varias");

module.exports = {
	// ControllerVista (desambiguarGuardar)
	infoParaDD_movie: async (datos) => {
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
				await this.infoParaDD_movie({
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
	infoParaDD_tv: async (datos) => {
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
			// nombre_original, nombre_castellano
			if (datosAPI.original_name) datosAPI_renamed.nombre_original = datosAPI.original_name;
			if (datosAPI.name) datosAPI_renamed.nombre_castellano = datosAPI.name;
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
			datosAPI_renamed.cantTemporadas = datosAPI.seasons.length;
			datosAPI_renamed.numeroPrimeraTemp = Math.min(
				...datosAPI.seasons.map((n) => n.season_number)
			);
		}
		let resultado = {
			...datosIniciales,
			...datosAPI_renamed,
		};
		return varias.convertirLetrasAlCastellano(resultado);
	},

	infoParaAgregarCapitulosDeTV: (datos, indice, tempUnica) => {
		capitulo = datos.episodes[indice];
		let datosAPI_renamed = {
			entidad: "capitulos",
			creada_por_id: 2,
			coleccion_id: datos.coleccion_id,
			TMDB_id: capitulo.id,
			capitulo: capitulo.episode_number,
		};
		if (!tempUnica) datosAPI_renamed.temporada = datos.season_number;
		if (capitulo.name) datosAPI_renamed.nombre_castellano = capitulo.name;
		if (capitulo.air_date) datosAPI_renamed.ano_estreno = capitulo.air_date;
		if (capitulo.crew.length > 0) {
			datosAPI_renamed = {
				...datosAPI_renamed,
				...funcionCrew(capitulo.crew, "director", "Directing"),
				...funcionCrew(capitulo.crew, "guion", "Writing"),
				...funcionCrew(capitulo.crew, "musica", "Sound"),
			};
		}
		if (capitulo.guest_stars.length > 0) {
			datosAPI_renamed.actores = capitulo.guest_stars
				.map((n) => n.name + (n.character ? " (" + n.character + ")" : ""))
				.join(", ");
		}
		while (capitulo.guest_stars.length > 0 && datosAPI_renamed.actores.length > 500) {
			aux = datosAPI_renamed.actores;
			datosAPI_renamed.actores = aux.slice(0, aux.lastIndexOf(","));
		}
		if (capitulo.overview) datosAPI_renamed.sinopsis = capitulo.overview;
		avatar =
			"https://image.tmdb.org/t/p/original" +
			(capitulo.still_path
				? capitulo.still_path
				: capitulo.poster_path
				? capitulo.poster_path
				: "");
		if (avatar) datosAPI_renamed.avatar = avatar;
		return datosAPI_renamed;
	},

	// ControllerVista (confirmar)
	agregarCapitulosDeTV: async function (
		registro,
		coleccion_TMDB_id,
		cantTemporadas,
		numeroPrimeraTemp
	) {
		// Variables iniciales
		tempUnica = false;
		// Loop de TEMPORADAS ***********************************************
		// Descarta las temporadas 0 (generalmente son "Especiales")
		for (temporada = 0; temporada < cantTemporadas; temporada++) {
			// Datos de UNA TEMPORADA
			entidad_TMDB = temporada + numeroPrimeraTemp;
			datosAPI = await detailsTMDB(entidad_TMDB, coleccion_TMDB_id);
			// Detectar si es una única temporada
			if (!datosAPI.season_number && cantTemporadas == 2) tempUnica = true;
			if (datosAPI.season_number == 1 && cantTemporadas == 1) tempUnica = true;
			if (!datosAPI.season_number) continue;
			datosAPI.coleccion_id = registro.id;
			// Loop de CAPITULOS ********************************************
			for (indice = 0; indice < datosAPI.episodes.length; indice++) {
				datosAPI_renamed = this.infoParaAgregarCapitulosDeTV(datosAPI, indice, tempUnica);
				await BD_varias.agregarRegistro(datosAPI_renamed);
			}
		}
		return;
	},

	// ControllerVista (desambiguarGuardar)
	infoParaDD_collection: async (datos) => {
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
	infoParaDD_prodFA: async function (dato) {
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
	// This (infoParaDD_prodFA)
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
