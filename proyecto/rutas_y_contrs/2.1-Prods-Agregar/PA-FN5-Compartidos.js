"use strict";
const APIsTMDB = require("../../funciones/APIsTMDB");

module.exports = {
	obtieneInfoDeMovie: async function (datos) {
		// Variables
		datos = {...datos, fuente: "TMDB", TMDB_entidad: "movie"}; // La entidad puede ser 'peliculas' o 'capitulos', y se agrega más adelante

		// Obtiene las API
		let detalles = APIsTMDB.details("movie", datos.TMDB_id);
		let creditos = APIsTMDB.credits("movie", datos.TMDB_id);
		let datosAPI = await Promise.all([detalles, creditos]).then(([a, b]) => ({...a, ...b}));

		// Procesa la información
		if (Object.keys(datosAPI).length) datos = {...datos, ...this.datosPelis(datosAPI)};

		// Limpia el resultado de caracteres especiales
		const avatar = datos.avatar;
		datos = comp.letras.convierteAlCastell(datos);
		if (avatar) datos.avatar = avatar;

		// Fin
		return datos;
	},
	datosPelis: function (datosAPI) {
		// Variables
		let datos = {};

		// Procesa la información
		if (!datosAPI.belongs_to_collection) {
			datos.entidadNombre = "Película";
			datos.entidad = "peliculas";
		}
		// IMDB_id, nombreOriginal, nombreCastellano
		if (datosAPI.imdb_id) datos.IMDB_id = datosAPI.imdb_id;
		if (datosAPI.original_title) datos.nombreOriginal = datosAPI.original_title;
		if (datosAPI.title) datos.nombreCastellano = datosAPI.title;

		// Idioma, país de origen
		if (datosAPI.original_language) datos.idiomaOriginal_id = datosAPI.original_language.toUpperCase();
		if (datosAPI.production_countries.length > 0) {
			datos.paises_id = datosAPI.production_countries.map((n) => n.iso_3166_1).join(" ");
			if (!datos.idiomaOriginal_id && datos.paises_id.length == 2) {
				const pais = paises.find((n) => n.id == datos.paises_id);
				if (pais) datos.idiomaOriginal_id = pais.idioma_id;
			}
		}

		// año de estreno, duración
		if (datosAPI.release_date) {
			datos.anoEstreno = parseInt(datosAPI.release_date.slice(0, 4));
			datos.epocaEstreno_id = epocasEstreno.find((n) => n.desde <= datos.anoEstreno).id;
		}
		if (datosAPI.runtime) datos.duracion = datosAPI.runtime;

		// sinopsis, avatar
		if (datosAPI.overview) datos.sinopsis = this.fuenteSinopsisTMDB(datosAPI.overview);
		if (datosAPI.poster_path) datos.avatar = "https://image.tmdb.org/t/p/original" + datosAPI.poster_path;

		// Producción
		if (datosAPI.production_companies.length > 0) datos.produccion = this.valores(datosAPI.production_companies);

		// Crew
		if (datosAPI.crew.length > 0) {
			const direccion = this.valores(datosAPI.crew.filter((n) => n.department == "Directing"));
			if (direccion) datos.direccion = direccion;
			const guion = this.valores(datosAPI.crew.filter((n) => n.department == "Writing"));
			if (guion) datos.guion = guion;
			const musica = this.valores(datosAPI.crew.filter((n) => n.department == "Sound"));
			if (musica) datos.musica = musica;
		}
		// Cast
		if (datosAPI.cast.length > 0) datos.actores = this.actores(datosAPI.cast);

		// Fin
		return datos;
	},
	fuenteSinopsisTMDB: (sinopsis) => {
		if (sinopsis && !sinopsis.includes("(FILMAFFINITY)")) sinopsis += " (Fuente: TMDB)";
		return sinopsis;
	},
	valores: (datos) => {
		// Variables
		let largo = 100;
		let texto = "";

		// Procesa si hay información
		if (datos.length) {
			// Obtiene el nombre y descarta lo demás
			datos = datos.map((n) => n.name);

			// Quita duplicados
			let valores = [];
			for (let dato of datos) if (!valores.length || !valores.includes(dato)) valores.push(dato);

			// Acorta el string excedente
			texto = valores.join(", ");
			if (texto.length > largo) {
				texto = texto.slice(0, largo);
				if (texto.includes(",")) texto = texto.slice(0, texto.lastIndexOf(","));
			}
		}
		// Fin
		return texto;
	},
	actores: (dato) => {
		// Variables
		let actores = "";
		let largo = 500;

		// Acciones
		if (dato.length) {
			// Obtiene los nombres y convierte el array en string
			actores = dato.map((n) => n.name + (n.character ? " (" + n.character.replace(",", " -") + ")" : "")).join(", ");
			// Quita el excedente
			if (actores.length > largo) {
				actores = actores.slice(0, largo);
				if (actores.includes(",")) actores = actores.slice(0, actores.lastIndexOf(","));
			}
		}

		// Fin
		return actores;
	},
};
