// ************ Requires ************
let detailsTMDB = require("../API/detailsTMDB_fetch");
let creditsTMDB = require("../API/creditsTMDB_fetch");
let BD_varias = require("../BD/varias");
let varias = require("../Varias/varias");

module.exports = {
	// ControllerVista (desambiguarGuardar)
	obtenerDatosDelProducto_TMDB: async function ({TMDB_id, entidad_TMDB}) {
		// Obtener el "método" a partir de la entidad_TMDB
		entidad_TMDB == "movie"
			? (metodo = "pelicula_TMDB")
			: entidad_TMDB == "tv"
			? (metodo = "TV_TMDB")
			: (metodo = "coleccion_TMDB");
		// Obtener la lectura de la API
		lectura = await detailsTMDB({TMDB_id, entidad_TMDB});
		if (entidad_TMDB == "movie") lectura = {...lectura, ...(await creditsTMDB(TMDB_id))};
		// Procesar la info para la vista 'Datos Duros'
		return await this[metodo]({TMDB_id, entidad_TMDB}, lectura);
	},

	obtenerCapitulosTV_TMDB: async function ({TMDB_id, season}) {
		// Obtener la lectura de la API
		let lectura = await detailsTMDB({TMDB_id, entidad_TMDB: season});
		// Procesar la info para la vista 'Datos Duros'
		return await this.capitulosTV_TMDB({TMDB_id, season}, lectura);
	},

	// ControllerVista (desambiguarGuardar)
	pelicula_TMDB: async (form, lectura) => {
		// Datos obtenidos del formulario
		datosForm = {
			producto: "Película",
			entidad: "peliculas",
			fuente: "TMDB",
			...form,
		};
		let datosLectura = {};
		if (Object.keys(lectura).length > 0) {
			// Datos obtenidos de la API
			if (lectura.belongs_to_collection != null) {
				// Datos de la colección a la que pertenece, si corresponde
				datosLectura.en_coleccion = true;
				datosLectura.en_colec_TMDB_id = lectura.belongs_to_collection.id;
				datosLectura.en_colec_nombre = lectura.belongs_to_collection.name;
				// ELC_id de la colección
				datosLectura.en_colec_id = await BD_varias.obtenerELC_id({
					entidad: "colecciones",
					campo: "TMDB_id",
					valor: datosLectura.en_colec_TMDB_id,
				});
			} else datosLectura.en_coleccion = false;
			// IMDB_id, nombre_original, nombre_castellano
			if (lectura.IMDB_id != "") datosLectura.IMDB_id = lectura.imdb_id;
			if (lectura.original_title != "") datosLectura.nombre_original = lectura.original_title;
			if (lectura.title != "") datosLectura.nombre_castellano = lectura.title;
			// año de estreno, duración, país de origen
			if (lectura.release_date != "")
				datosLectura.ano_estreno = parseInt(lectura.release_date.slice(0, 4));
			if (lectura.runtime != null) datosLectura.duracion = lectura.runtime;
			if (lectura.production_countries.length > 0)
				datosLectura.pais_id = lectura.production_countries
					.map((n) => n.iso_3166_1)
					.join(", ");
			// sinopsis, avatar
			if (lectura.overview != "")
				datosLectura.sinopsis = fuenteSinopsisTMDB(lectura.overview);
			if (lectura.poster_path != "")
				datosLectura.avatar = "https://image.tmdb.org/t/p/original" + lectura.poster_path;
			// Credits
			if (lectura.production_companies.length > 0)
				datosLectura.productor = lectura.production_companies.map((n) => n.name).join(", ");
			if (lectura.crew.length > 0)
				datosLectura = {
					...datosLectura,
					...funcionCrew(lectura.crew, "director", "Directing"),
					...funcionCrew(lectura.crew, "guion", "Writing"),
					...funcionCrew(lectura.crew, "musica", "Sound"),
				};
			if (lectura.cast.length > 0)
				datosLectura.actores = lectura.cast
					.map((n) => n.name + (n.character != "" ? " (" + n.character + ")" : ""))
					.join(", ");
			while (lectura.cast.length > 0 && datosLectura.actores.length > 500) {
				aux = datosLectura.actores;
				datosLectura.actores = aux.slice(0, aux.lastIndexOf(","));
			}
		}
		let resultado = {
			...datosForm,
			...datosLectura,
		};
		resultado = varias.convertirLetrasAlCastellano(resultado);
		return resultado;
	},

	// ControllerVista (desambiguarGuardar)
	TV_TMDB: (form, lectura) => {
		// Datos obtenidos del formulario
		datosForm = {
			producto: "Colección",
			entidad: "colecciones",
			fuente: "TMDB",
			...form,
		};
		let datosLectura = {};
		if (Object.keys(lectura).length > 0) {
			// Datos obtenidos de la API
			// nombre_original, nombre_castellano
			if (lectura.original_name != "") datosLectura.nombre_original = lectura.original_name;
			if (lectura.name != "") datosLectura.nombre_castellano = lectura.name;
			// año de estreno, año de fin, país de origen
			if (lectura.first_air_date != "")
				datosLectura.ano_estreno = parseInt(lectura.first_air_date.slice(0, 4));
			if (lectura.last_air_date != "")
				datosLectura.ano_fin = parseInt(lectura.last_air_date.slice(0, 4));
			if (lectura.production_countries.length > 0)
				datosLectura.pais_id = lectura.production_countries
					.map((n) => n.iso_3166_1)
					.join(", ");
			// sinopsis, avatar
			if (lectura.overview != "")
				datosLectura.sinopsis = fuenteSinopsisTMDB(lectura.overview);
			if (lectura.poster_path != "")
				datosLectura.avatar = "https://image.tmdb.org/t/p/original" + lectura.poster_path;
			// Credits
			if (lectura.created_by.length > 0)
				datosLectura.guion = lectura.created_by.map((n) => n.name).join(", ");
			if (lectura.production_companies.length > 0)
				datosLectura.productor = lectura.production_companies.map((n) => n.name).join(", ");
			// Temporadas
			datosLectura.cantTemporadas = lectura.seasons.length;
		}
		let resultado = {
			...datosForm,
			...datosLectura,
		};
		resultado = varias.convertirLetrasAlCastellano(resultado);
		return resultado;
	},

	// ControllerVista (desambiguarGuardar)
	coleccion_TMDB: (form, lectura) => {
		// Datos obtenidos del formulario
		datosForm = {
			producto: "Colección",
			entidad: "colecciones",
			fuente: "TMDB",
			...form,
		};
		let datosLectura = {};
		if (Object.keys(lectura).length > 0) {
			// Datos obtenidos de la API
			// nombre_original, nombre_castellano
			if (lectura.name != "") datosLectura.nombre_castellano = lectura.name;

			// año de estreno, año de fin
			if (lectura.parts.length > 0) {
				datosLectura.ano_estreno = Math.min(
					...lectura.parts.map((n) => parseInt(n.release_date.slice(0, 4)))
				);
				datosLectura.ano_fin = Math.max(
					...lectura.parts.map((n) => parseInt(n.release_date.slice(0, 4)))
				);
			}
			// sinopsis, avatar
			if (lectura.overview != "")
				datosLectura.sinopsis = fuenteSinopsisTMDB(lectura.overview);
			if (lectura.poster_path != "")
				datosLectura.avatar = "https://image.tmdb.org/t/p/original" + lectura.poster_path;
			// ID de los capitulos
			datosLectura.capitulosId = lectura.parts.map((n) => n.id);
		}
		let resultado = {
			...datosForm,
			...datosLectura,
		};
		resultado = varias.convertirLetrasAlCastellano(resultado);
		return resultado;
	},

	// ControllerVista (copiarFA_Guardar)
	producto_FA: async function (dato) {
		// Obtener los campos del formulario
		let {entidad, en_coleccion, direccion, avatar, contenido} = dato;
		// Generar la información
		producto = entidad == "peliculas" ? "Película" : "Colección";
		FA_id = this.obtenerFA_id(direccion);
		contenido = this.contenidoFA(contenido.split("\r\n"));
		if (contenido.pais_nombre) {
			contenido.pais_id = await varias.paisNombreToId(contenido.pais_nombre);
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
	// This (producto_FA)
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
			!aux.includes("(FILMAFFINITY)") ? (aux = aux + " (FILMAFFINITY)") : "";
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
	sinopsis != "" && !sinopsis.includes("(FILMAFFINITY)") ? (sinopsis = sinopsis + " (TMDB)") : "";
	return sinopsis;
};

let funcionCrew = (crew, campo_ELC, campo_TMDB) => {
	if (crew.filter((n) => n.department == campo_TMDB).length > 0) {
		valores = crew.filter((n) => n.department == campo_TMDB).map((m) => m.name);
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
