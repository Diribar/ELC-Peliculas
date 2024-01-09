"use strict";
// Variables
const APIsTMDB = require("../../funciones/2-Procesos/APIsTMDB");
const procsComp = require("./PA-FN5-Compartidos");

module.exports = {
	movie: {
		obtieneInfo: async (datos) => {
			return procsComp.obtieneInfoDeMovie(datos);
		},
	},
	collection: {
		obtieneInfo: async function (datos) {
			// Obtiene información de la colección
			datos = {
				...datos,
				entidadNombre: "Colección",
				entidad: "colecciones",
				fuente: "TMDB",
				TMDB_entidad: "collection",
				cantTemps: 1,
			};
			const datosColec = await APIsTMDB.details("collection", datos.TMDB_id);

			// Obtiene y procesa información
			if (Object.keys(datosColec).length) {
				// Procesa la información de la colección
				datos = {...datos, ...this.datosColec(datosColec)};

				// Obtiene la información de los capítulos y la procesa
				datos = {...datos, ...(await this.datosCaps(datos.capsTMDB_id))};
			}

			// Limpia el resultado de caracteres especiales
			const avatar = datos.avatar;
			datos = comp.convierteLetras.alCastellano(datos);
			if (avatar) datos.avatar = avatar;

			// Fin
			return datos;
		},
		datosColec: (datosColec) => {
			// Variables
			let datos = {};

			// nombreCastellano
			if (datosColec.name) datos.nombreCastellano = datosColec.name;

			// año de estreno, año de fin
			if (datosColec.parts.length) {
				let release_date = datosColec.parts
					.map((n) => n.release_date)
					.filter((n) => !!n)
					.map((n) => parseInt(n.slice(0, 4)));
				if (release_date.length) {
					datos.anoEstreno = Math.min(...release_date);
					datos.anoFin = Math.max(...release_date);
					datos.epocaEstreno_id = epocasEstreno.find((n) => n.desde <= datos.anoEstreno).id;
				}
			}

			// sinopsis, avatar
			if (datosColec.overview) datos.sinopsis = procsComp.fuenteSinopsisTMDB(datosColec.overview);
			if (datosColec.poster_path) datos.avatar = "https://image.tmdb.org/t/p/original" + datosColec.poster_path;

			// ID de los capitulos
			datos.capsTMDB_id = datosColec.parts.map((n) => n.id);

			// Fin
			return datos;
		},
		datosCaps: async (capsTMDB_id) => {
			// Variables
			let paises_id, produccion, direccion, guion, musica, actores;
			paises_id = produccion = direccion = guion = musica = actores = "";
			let detalles = [];
			let creditos = [];
			let capitulos = [];
			let datos = {};

			// Obtiene la info de los capítulos
			for (let capTMDB_id of capsTMDB_id) {
				detalles.push(APIsTMDB.details("movie", capTMDB_id));
				creditos.push(APIsTMDB.credits("movie", capTMDB_id));
			}
			detalles = await Promise.all(detalles);
			creditos = await Promise.all(creditos);
			for (let i = 0; i < capsTMDB_id.length; i++) capitulos.push({...detalles[i], ...creditos[i]});

			// Toma información de cada capítulo, para alimentar la colección
			for (let capitulo of capitulos) {
				// Paises_id
				if (capitulo.production_countries.length)
					paises_id += capitulo.production_countries.map((n) => n.iso_3166_1).join(", ") + ", ";
				// Producción
				if (capitulo.production_companies.length) produccion += procsComp.valores(capitulo.production_companies) + ", ";
				// Crew
				if (capitulo.crew.length) {
					direccion += procsComp.valores(capitulo.crew.filter((n) => n.department == "Directing")) + ", ";
					guion += procsComp.valores(capitulo.crew.filter((n) => n.department == "Writing")) + ", ";
					musica += procsComp.valores(capitulo.crew.filter((n) => n.department == "Sound")) + ", ";
				}
				// Cast
				if (capitulo.cast.length) actores += procsComp.actores(capitulo.cast) + ", ";
			}

			// Procesa los resultados
			let cantCaps = capitulos.length;
			if (paises_id) datos.paises_id = consolidaValoresColeccion(paises_id, cantCaps).replace(/,/g, "");
			if (produccion) datos.produccion = consolidaValoresColeccion(produccion, cantCaps);
			if (direccion) datos.direccion = consolidaValoresColeccion(direccion, cantCaps);
			if (guion) datos.guion = consolidaValoresColeccion(guion, cantCaps);
			if (musica) datos.musica = consolidaValoresColeccion(musica, cantCaps);
			if (actores) datos.actores = consolidaValoresColeccion(actores, cantCaps);

			// Fin
			return datos;
		},
	},
	tv: {
		obtieneInfo: async function (datos) {
			// Datos obtenidos sin la API
			datos = {...datos, entidadNombre: "Colección", entidad: "colecciones", fuente: "TMDB", TMDB_entidad: "tv"};

			// Obtiene las API
			const resultados = [APIsTMDB.details("tv", datos.TMDB_id), APIsTMDB.credits("tv", datos.TMDB_id)];
			const datosAPI = await Promise.all(resultados).then(([a, b]) => ({...a, ...b}));

			// Procesa la información
			if (Object.keys(datosAPI).length) datos = {...datos, ...this.DS_tv_info(datosAPI)};

			// Limpia el resultado de caracteres especiales
			const avatar = datos.avatar;
			datos = comp.convierteLetras.alCastellano(datos);
			if (avatar) datos.avatar = avatar;

			// Fin
			return datos;
		},
		DS_tv_info: (datosAPI) => {
			// Variables
			let datos = {};

			// nombreOriginal, nombreCastellano, duración de capítulos
			if (datosAPI.original_name) datos.nombreOriginal = datosAPI.original_name;
			if (datosAPI.name) datos.nombreCastellano = datosAPI.name;
			// Idioma
			if (datosAPI.original_language) datos.idiomaOriginal_id = datosAPI.original_language.toUpperCase();

			// año de estreno, año de fin, país de origen
			if (datosAPI.first_air_date) {
				datos.anoEstreno = parseInt(datosAPI.first_air_date.slice(0, 4));
				datos.epocaEstreno_id = epocasEstreno.find((n) => n.desde <= datos.anoEstreno).id;
			}
			if (datosAPI.last_air_date) datos.anoFin = parseInt(datosAPI.last_air_date.slice(0, 4));
			if (datosAPI.origin_country.length > 0) {
				datos.paises_id = datosAPI.origin_country.join(" ");
				if (!datos.idiomaOriginal_id && datos.paises_id.length == 2) {
					const pais = paises.find((n) => n.id == datos.paises_id);
					if (pais) datos.idiomaOriginal_id = pais.idioma_id;
				}
			}
			// sinopsis, avatar
			if (datosAPI.overview) datos.sinopsis = procsComp.fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path) datos.avatar = "https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// Guión, produccion
			if (datosAPI.created_by.length > 0) datos.guion = datosAPI.created_by.map((n) => n.name).join(", ");
			if (datosAPI.production_companies.length > 0) datos.produccion = procsComp.valores(datosAPI.production_companies);
			// Crew
			if (datosAPI.crew.length > 0) {
				const direccion = procsComp.valores(datosAPI.crew.filter((n) => n.department == "Directing"));
				if (direccion) datos.direccion = direccion;
				const guion = procsComp.valores(datosAPI.crew.filter((n) => n.department == "Writing"));
				if (guion) datos.guion = guion;
				const musica = procsComp.valores(datosAPI.crew.filter((n) => n.department == "Sound"));
				if (musica) datos.musica = musica;
			}
			// Cast
			if (datosAPI.cast.length > 0) datos.actores = procsComp.actores(datosAPI.cast);

			// Temporadas
			datosAPI.seasons = datosAPI.seasons.filter((n) => n.season_number > 0);
			datos.cantTemps = datosAPI.seasons.length;

			// Fin
			return datos;
		},
	},
	prodsIMFA: async ({palabrasClave, userID}) => {
		// Variables
		const entidades = ["peliculas", "colecciones"];
		const campos = ["nombreCastellano", "nombreOriginal"];
		let resultados = [];

		// Rutina por entidad
		for (let entidad of entidades) {
			// Variables
			const datos = {familia: "producto", entidad, campos};

			// Obtiene las condiciones de palabras y status
			let condiciones = comp.quickSearchCondics(palabrasClave, campos, userID);

			// Agrega la condición de que no provenga de 'TMDB'
			condiciones[Op.and].push({fuente: {[Op.ne]: "TMDB"}});

			// Obtiene los registros que cumplen las condiciones
			const resultadoPorEntidad = await BD_especificas.quickSearchRegistros(condiciones, datos);
			if (resultadoPorEntidad.length) resultados.push(...resultadoPorEntidad);
		}

		// Rutina por producto
		if (resultados.length)
			resultados.forEach((resultado, i) => {
				resultados[i] = {
					...resultado,
					yaEnBD_id: resultado.id,
					anoEstreno: resultado.anoEstreno,
					epocaEstreno_id: epocasEstreno.find((n) => n.desde <= resultado.anoEstreno).id,
					nombreCastellano: resultado.nombre,
					entidadNombre: comp.obtieneDesdeEntidad.entidadNombre(resultado.entidad),
				};
			});

		// Envia
		return resultados;
	},
};

// Funciones auxiliares
let consolidaValoresColeccion = (datos, cantCapitulos) => {
	// Corrige defectos y convierte los valores en un array
	datos = datos.replace(/(, )+/g, ", ");
	datos = datos.trim();
	if (datos.slice(-1) == ",") datos = datos.slice(0, -1);
	datos = datos.split(", ");
	for (let i = datos.length - 1; i >= 0; i--) if (!datos[i]) datos.splice(i, 1);

	// Averigua cuántas veces se repite el dato más frecuente
	let objeto = {};
	for (let dato of datos) objeto[dato] ? objeto[dato]++ : (objeto[dato] = 1);
	let valores = Object.keys(objeto);
	let frecuencias = Object.values(objeto);
	let frecMaxima = Math.max(...frecuencias);

	// Obtiene los datos más frecuentes
	let resultado = [];
	for (let frecuencia = frecMaxima; frecuencia > 0; frecuencia--) {
		frecuencias.forEach((cantidad, indice) => {
			if (cantidad == frecuencia) resultado.push(valores[indice]);
		});
		// FRENOS
		// 1. Si el resultado ya es demasiado largo, ¡STOP!
		if (resultado.join(", ").length > 500) {
			let texto = resultado.join(", ");
			texto = texto.slice(0, 500);
			if (texto.includes(",")) texto = texto.slice(0, texto.lastIndexOf(","));
			resultado = texto.split(", ");
			break;
		}
		// 2. Los máximos, siempre que:
		//     - Sean más de uno y se hayan hecho por lo menos 2 ruedas
		//     - Se haya hecho la primera de dos ruedas
		if ((resultado.length > 1 && frecuencia == frecMaxima - 1) || frecMaxima == 2) break;
		// 3. Los máximos tres
		if (resultado.length > 2) break;
		// 4. Si hay resultados y la frecuencia ya es muy baja, ¡STOP!
		if (resultado.length && frecuencia - 1 < cantCapitulos * 0.25) break;
	}
	resultado = resultado.join(", ");

	// Fin
	return resultado;
};
