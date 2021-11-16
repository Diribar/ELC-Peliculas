// ************ Requires ************
let detailsTMDB = require("../API/detailsTMDB_fetch");
let creditsTMDB = require("../API/creditsTMDB_fetch");
let BD_varias = require("../BD/varias");
let varias = require("../Varias/varias");

module.exports = {
	// ControllerVista (desambiguarGuardar)
	obtenerAPI_TMDB: async ({ TMDB_id, entidad_TMDB }) => {
		let lectura = await detailsTMDB(TMDB_id, entidad_TMDB);
		if (entidad_TMDB == "movie") {
			credits = await creditsTMDB(TMDB_id);
			lectura = {
				...lectura,
				...credits,
			};
		}
		return lectura;
	},

	// ControllerVista (desambiguarGuardar)
	pelicula_TMDB: (form, lectura) => {
		// Datos obtenidos del formulario
		datosForm = {
			producto: form.producto,
			entidad: form.entidad,
			fuente: form.fuente,
			entidad_TMDB: form.entidad_TMDB,
			TMDB_id: form.TMDB_id,
			nombre_original: form.nombre_original,
		};
		// Datos obtenidos de la API
		let datosLectura = {};
		if (form.fuente == "TMDB" && Object.keys(lectura).length > 0) {
			// Datos obtenidos de la API
			if (lectura.belongs_to_collection != null) {
				datosLectura.en_coleccion = true;
				datosLectura.en_colec_TMDB_id =
					lectura.belongs_to_collection.id;
				datosLectura.en_colec_nombre =
					lectura.belongs_to_collection.name;
			} else datosLectura.en_coleccion = false;
			lectura.IMDB_id != ""
				? (datosLectura.IMDB_id = lectura.imdb_id)
				: "";
			lectura.overview != ""
				? (datosLectura.sinopsis = fuenteSinopsisTMDB(lectura.overview))
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
				? (datosLectura.pais_id = lectura.production_countries
						.map((n) => n.iso_3166_1)
						.join(", "))
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
		return [resultado, ""];
	},

	// ControllerVista (desambiguarGuardar)
	TV_TMDB: (form, lectura) => {
		// Datos obtenidos del formulario
		datosForm = {
			producto: form.producto,
			entidad: form.entidad,
			fuente: form.fuente,
			entidad_TMDB: form.entidad_TMDB,
			TMDB_id: form.TMDB_id,
			nombre_original: form.nombre_original,
		};
		let datosCabecera = {};
		let datosPartes = {};
		if (form.fuente == "TMDB" && Object.keys(lectura).length > 0) {
			// Datos obtenidos de la API - Cabecera
			lectura.created_by.length > 0
				? (datosCabecera.guion = lectura.created_by
						.map((n) => n.name)
						.join(", "))
				: "";
			lectura.name != ""
				? (datosCabecera.nombre_castellano = lectura.name)
				: "";
			lectura.production_countries.length > 0
				? (datosCabecera.pais_id = lectura.production_countries
						.map((n) => n.iso_3166_1)
						.join(", "))
				: "";
			lectura.original_language != ""
				? (datosCabecera.idioma_original = lectura.original_language)
				: "";
			lectura.overview != ""
				? (datosCabecera.sinopsis = fuenteSinopsisTMDB(
						lectura.overview
				  ))
				: "";
			lectura.poster_path != ""
				? (datosCabecera.avatar =
						"https://image.tmdb.org/t/p/original" +
						lectura.poster_path)
				: "";
			lectura.first_air_date != ""
				? (datosCabecera.ano_estreno = parseInt(
						lectura.first_air_date.slice(0, 4)
				  ))
				: "";
			lectura.last_air_date != ""
				? (datosCabecera.ano_fin = parseInt(
						lectura.last_air_date.slice(0, 4)
				  ))
				: "";
			lectura.production_companies.length > 0
				? (datosCabecera.productor = lectura.production_companies
						.map((n) => n.name)
						.join(", "))
				: "";
			// Datos obtenidos de la API - Partes
			if (lectura.seasons.length > 0) {
				datosPartes = lectura.seasons.map((n) => {
					partes = {
						peli_TMDB_id: n.id,
						nombre_castellano: n.name,
						cant_capitulos: n.episode_count,
						sinopsis: n.overview,
						orden_secuencia: n.season_number,
					};
					if (n.air_date)
						partes.ano_estreno = parseInt(n.air_date.slice(0, 4));
					partes.nombre_original = n.season_number
						? "Season " + n.season_number
						: "Specials";
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
			...datosCabecera,
		};
		resultado = convertirLetrasAlCastellano(resultado);
		datosPartes = convertirLetrasAlCastellano(datosPartes);
		return [resultado, datosPartes];
	},

	// ControllerVista (desambiguarGuardar)
	coleccion_TMDB: (form, lectura) => {
		// Datos obtenidos del formulario
		datosForm = {
			producto: form.producto,
			entidad: form.entidad,
			fuente: form.fuente,
			entidad_TMDB: form.entidad_TMDB,
			TMDB_id: form.TMDB_id,
			nombre_original: form.nombre_original,
		};
		let datosCabecera = {};
		let datosPartes = {};
		if (form.fuente == "TMDB" && Object.keys(lectura).length > 0) {
			// Datos obtenidos de la API - Cabecera
			lectura.name != ""
				? (datosCabecera.nombre_castellano = lectura.name)
				: "";
			lectura.overview != ""
				? (datosCabecera.sinopsis = fuenteSinopsisTMDB(
						lectura.overview
				  ))
				: "";
			lectura.poster_path != ""
				? (datosCabecera.avatar =
						"https://image.tmdb.org/t/p/original" +
						lectura.poster_path)
				: "";
			if (lectura.parts.length > 0) {
				datosCabecera.ano_estreno = Math.min(
					...lectura.parts.map((n) =>
						parseInt(n.release_date.slice(0, 4))
					)
				);
				datosCabecera.ano_fin = Math.max(
					...lectura.parts.map((n) =>
						parseInt(n.release_date.slice(0, 4))
					)
				);
				// Datos obtenidos de la API - Partes
				datosPartes = lectura.parts.map((n) => {
					partes = {
						peli_TMDB_id: n.id,
						nombre_castellano: n.title,
						nombre_original: n.original_title,
						sinopsis: fuenteSinopsisTMDB(n.overview),
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
			...datosCabecera,
		};
		resultado = convertirLetrasAlCastellano(resultado);
		datosPartes = convertirLetrasAlCastellano(datosPartes);
		return [resultado, datosPartes];
	},

	// ControllerVista (copiarFA_Guardar)
	producto_FA: async function (dato) {
		// Obtener los campos del formulario
		let { entidad, en_coleccion, direccion, avatar, contenido } = dato;
		// Generar la información
		producto = entidad == "peliculas" ? "Película" : "Colección";
		FA_id = this.obtenerFA_id(direccion);
		contenido = this.contenidoFA(contenido.split("\r\n"));
		if (contenido.pais_nombre) {
			contenido.pais_id = await varias.paisNombreToId(
				contenido.pais_nombre
			);
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
		resultado = convertirLetrasAlCastellano(resultado);
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
	// This (producto_FA)
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

	// Función buscar_x_PC (buscar_x_PC -> averiguarSiYaEnBD)
	// Middleware (productoYaEnBD)
	// ControllerAPI (obtenerELC_id)
	// ControllerVista (copiarFA_Guardar)
	// ControllerVista (datosDurosGuardar)
	obtenerELC_id: async (datos) => {
		if (!datos.valor) return false;
		let ELC_id = await BD_varias.obtenerELC_id(datos);
		return ELC_id;
	},
};

// Funciones *********************
let fuenteSinopsisTMDB = (sinopsis) => {
	sinopsis != "" && !sinopsis.includes("(FILMAFFINITY)")
		? (sinopsis = sinopsis + " (TMDB)")
		: "";
	return sinopsis;
};
let funcionCrew = (crew, campo_ELC, campo_TMDB) => {
	if (crew.filter((n) => n.department == campo_TMDB).length > 0) {
		valores = crew
			.filter((n) => n.department == campo_TMDB)
			.map((m) => m.name);
		let i = 1;
		while (i < valores.length) {
			if (valores[i] == valores[i - 1]) {
				valores.splice(i, 1);
			} else i++;
		}
		valores = valores.join(", ");
		return { [campo_ELC]: valores };
	}
	return;
};
let convertirLetrasAlCastellano = (resultado) => {
	campos = Object.keys(resultado);
	valores = Object.values(resultado);
	for (let i = 0; i < campos.length; i++) {
		if (typeof valores[i] == "string") {
			resultado[campos[i]] = valores[i]
					.replace(/[ÀÂÃÄÅĀĂĄ]/g, "A")
					.replace(/[àâãäåāăą]/g, "a")
					.replace(/Æ/g, "Ae")
					.replace(/æ/g, "ae")
					.replace(/[ÇĆĈĊČ]/g, "C")
					.replace(/[çćĉċč]/g, "c")
					.replace(/[ÐĎ]/g, "D")
					.replace(/[đď]/g, "d")
					.replace(/[ÈÊËĒĔĖĘĚ]/g, "E")
					.replace(/[èêëēĕėęě]/g, "e")
					.replace(/[ĜĞĠĢ]/g, "G")
					.replace(/[ĝğġģ]/g, "g")
					.replace(/[ĦĤ]/g, "H")
					.replace(/[ħĥ]/g, "h")
					.replace(/[ÌÎÏĨĪĬĮİ]/g, "I")
					.replace(/[ìîïĩīĭįı]/g, "i")
					.replace(/Ĳ/g, "Ij")
					.replace(/ĳ/g, "ij")
					.replace(/Ĵ/g, "J")
					.replace(/ĵ/g, "j")
					.replace(/Ķ/g, "K")
					.replace(/[ķĸ]/g, "k")
					.replace(/[ĹĻĽĿŁ]/g, "L")
					.replace(/[ĺļľŀł]/g, "l")
					.replace(/[ŃŅŇ]/g, "N")
					.replace(/[ńņňŉ]/g, "n")
					.replace(/[ÒÔÕŌŌŎŐ]/g, "O")
					.replace(/[òôõōðōŏő]/g, "o")
					.replace(/[ÖŒ]/g, "Oe")
					.replace(/[ö]/g, "o")
					.replace(/[œ]/g, "oe")
					.replace(/[ŔŖŘ]/g, "R")
					.replace(/[ŕŗř]/g, "r")
					.replace(/[ŚŜŞŠ]/g, "S")
					.replace(/[śŝşš]/g, "s")
					.replace(/[ŢŤŦ]/g, "T")
					.replace(/[ţťŧ]/g, "t")
					.replace(/[ÙÛŨŪŬŮŰŲ]/g, "U")
					.replace(/[ùûũūŭůűų]/g, "u")
					.replace(/Ŵ/g, "W")
					.replace(/ŵ/g, "w")
					.replace(/[ÝŶŸ]/g, "Y")
					.replace(/[ýŷÿ]/g, "y")
					.replace(/[ŽŹŻŽ]/g, "Z")
					.replace(/[žźżž]/g, "z")
					.replace(/[”“]/g, '"')
					.replace(/[º]/g, "°")
		}
	}
	return resultado;
};
let funcionParentesis = (dato) => {
	desde = dato.indexOf(" (");
	hasta = dato.indexOf(")");
	return desde > 0 ? dato.slice(0, desde) + dato.slice(hasta + 1) : dato;
};
