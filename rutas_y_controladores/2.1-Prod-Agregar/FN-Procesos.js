"use strict";
// Definir variables
const detailsTMDB = require("../../funciones/1-APIs_TMDB/2-Details");
const creditsTMDB = require("../../funciones/1-APIs_TMDB/3-Credits");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// USO COMPARTIDO *********************
	borraSessionCookies: (req, res, paso) => {
		let pasos = [
			"borrarTodo",
			"palabrasClave",
			"desambiguar",
			"IM",
			"FA",
			"datosOriginales",
			"datosDuros",
			"datosPers",
			"confirma",
		];
		let indice = pasos.indexOf(paso) + 1;
		for (indice; indice < pasos.length; indice++) {
			if (req.session && req.session[pasos[indice]]) delete req.session[pasos[indice]];
			if (req.cookies && req.cookies[pasos[indice]]) res.clearCookie(pasos[indice]);
		}
	},

	// MOVIES *****************************
	// ControllerVista (desambiguarGuardar)
	DS_movie: async (datos) => {
		// La entidad puede ser 'peliculas' o 'capitulos', y se agrega más adelante
		datos = {...datos, fuente: "TMDB", TMDB_entidad: "movie"};
		// Obtiene las API
		let datosAPI = await Promise.all([
			detailsTMDB("movie", datos.TMDB_id),
			creditsTMDB("movie", datos.TMDB_id),
		]).then(([a, b]) => {
			return {...a, ...b};
		});
		// Procesar la información
		if (Object.keys(datosAPI).length) {
			// Datos de la colección a la que pertenece, si corresponde
			if (datosAPI.belongs_to_collection != null) {
				datos.en_coleccion = true;
				datos.en_colec_TMDB_id = datosAPI.belongs_to_collection.id;
				datos.en_colec_nombre = datosAPI.belongs_to_collection.name;
				// elc_id de la colección
				datos.en_colec_id = await BD_especificas.obtieneELC_id("colecciones", {
					TMDB_id: datos.en_colec_TMDB_id,
				});
				datos.prodNombre = "Capítulo";
				datos.entidad = "capitulos";
			} else {
				datos.en_coleccion = false;
				datos.prodNombre = "Película";
				datos.entidad = "peliculas";
			}
			// IMDB_id, nombre_original, nombre_castellano
			if (datosAPI.imdb_id) datos.IMDB_id = datosAPI.imdb_id;
			if (datosAPI.original_title) datos.nombre_original = datosAPI.original_title;
			if (datosAPI.title) datos.nombre_castellano = datosAPI.title;
			// Idioma
			if (datosAPI.original_language) {
				datos.idioma_original_id = datosAPI.original_language;
				if (
					datosAPI.original_language == "es" ||
					(datosAPI.spoken_languages && datosAPI.spoken_languages.find((n) => n.iso_639_1 == "es"))
				)
					datos.en_castellano_id = 1;
			}
			// año de estreno, duración, país de origen
			if (datosAPI.release_date) datos.ano_estreno = parseInt(datosAPI.release_date.slice(0, 4));
			if (datosAPI.runtime) datos.duracion = datosAPI.runtime;
			if (datosAPI.production_countries.length > 0)
				datos.paises_id = datosAPI.production_countries.map((n) => n.iso_3166_1).join(" ");
			// sinopsis, avatar
			if (datosAPI.overview) datos.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path)
				datos.avatar = "https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// Producción
			if (datosAPI.production_companies.length > 0)
				datos.produccion = limpiaValores(datosAPI.production_companies);
			// Crew
			if (datosAPI.crew.length > 0) {
				datos.direccion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Directing"));
				datos.guion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Writing"));
				datos.musica = limpiaValores(datosAPI.crew.filter((n) => n.department == "Sound"));
			}
			// Cast
			if (datosAPI.cast.length > 0) datos.actuacion = funcionCast(datosAPI.cast);
		}
		return comp.convierteLetrasAlCastellano(datos);
	},

	// COLLECTIONS ************************
	// ControllerVista (desambiguarGuardar)
	DS_collection: async function (datos) {
		// Datos obtenidos sin la API
		datos = {
			...datos,
			prodNombre: "Colección",
			entidad: "colecciones",
			fuente: "TMDB",
			TMDB_entidad: "collection",
			cant_temporadas: 1,
		};
		// Obtiene las API
		let datosAPI = await detailsTMDB("collection", datos.TMDB_id);
		// Procesar la información
		if (Object.keys(datosAPI).length) {
			// nombre_castellano
			if (datosAPI.name) datos.nombre_castellano = datosAPI.name;
			// año de estreno, año de fin
			if (datosAPI.parts.length > 0) {
				datos.ano_estreno = Math.min(
					...datosAPI.parts.map((n) => parseInt(n.release_date.slice(0, 4)))
				);
				datos.ano_fin = Math.max(...datosAPI.parts.map((n) => parseInt(n.release_date.slice(0, 4))));
			}
			// sinopsis, avatar
			if (datosAPI.overview) datos.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path)
				datos.avatar = "https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// ID de los capitulos
			datos.capitulosID_TMDB = datosAPI.parts.map((n) => n.id);
		}
		// Datos de los capítulos para completar la colección
		let otrosDatos = await this.completaColeccion(datos);
		datos = {...datos, ...otrosDatos};
		// Fin
		return comp.convierteLetrasAlCastellano(datos);
	},
	completaColeccion: async (datos) => {
		// Definir variables
		let paises_id, produccion, direccion, guion, musica, actuacion;
		paises_id = produccion = direccion = guion = musica = actuacion = "";
		let exportar = {};
		// Rutina por cada capítulo
		for (let capTMDB_id of datos.capitulosID_TMDB) {
			// Obtiene las API
			let datosAPI = await Promise.all([
				detailsTMDB("movie", capTMDB_id),
				creditsTMDB("movie", capTMDB_id),
			]).then(([a, b]) => {
				return {...a, ...b};
			});
			// Por cada capítulo, agregar un método de cada campo con sus valores sin repetir
			// Paises_id
			if (datosAPI.production_countries.length)
				paises_id += datosAPI.production_countries.map((n) => n.iso_3166_1).join(", ") + ", ";
			// Producción
			if (datosAPI.production_companies.length)
				produccion += limpiaValores(datosAPI.production_companies) + ", ";
			// Crew
			if (datosAPI.crew.length) {
				direccion += limpiaValores(datosAPI.crew.filter((n) => n.department == "Directing")) + ", ";
				guion += limpiaValores(datosAPI.crew.filter((n) => n.department == "Writing")) + ", ";
				musica += limpiaValores(datosAPI.crew.filter((n) => n.department == "Sound")) + ", ";
			}
			// Cast
			if (datosAPI.cast.length) actuacion += funcionCast(datosAPI.cast) + ", ";
		}
		// Procesar los resultados
		let cantCapitulos = datos.capitulosID_TMDB.length;
		if (paises_id) exportar.paises_id = consolidaValores(paises_id, cantCapitulos).replace(/,/g, "");
		if (produccion) exportar.produccion = consolidaValores(produccion, cantCapitulos);
		if (direccion) exportar.direccion = consolidaValores(direccion, cantCapitulos);
		if (guion) exportar.guion = consolidaValores(guion, cantCapitulos);
		if (musica) exportar.musica = consolidaValores(musica, cantCapitulos);
		if (actuacion) exportar.actuacion = consolidaValores(actuacion, cantCapitulos);
		// Fin
		return exportar;
	},
	// ControllerVista (confirma)
	agregaCapitulosDeCollection: async function (datosCol) {
		// Replicar para todos los capítulos de la colección
		datosCol.capitulosID_TMDB.forEach(async (capituloID_TMDB, indice) => {
			await this.agregaCapitulosDeCollection(datosCol, capituloID_TMDB, indice);
		});
		// Fin
		return;
	},
	agregaCapituloDeCollection: async function (datosCol, capituloID_TMDB, indice) {
		// Preparar datos del capítulo
		let datosCap = {
			coleccion_id: datosCol.id,
			fuente: "TMDB",
			temporada: 1,
			capitulo: indice + 1,
			creado_por_id: 2,
		};
		if (datosCol.en_castellano_id != 2) datosCap.en_castellano_id = datosCol.en_castellano_id;
		if (datosCol.en_color_id != 2) datosCap.en_color_id = datosCol.en_color_id;
		datosCap.categoria_id = datosCol.categoria_id;
		datosCap.subcategoria_id = datosCol.subcategoria_id;
		datosCap.publico_sugerido_id = datosCol.publico_sugerido_id;
		// Guardar los datos del capítulo
		// console.log(200,capituloID_TMDB,datosCap);
		await this.DS_movie({TMDB_id: capituloID_TMDB})
			.then((n) => (n = {...n, ...datosCap}))
			.then((n) => BD_genericas.agregaRegistro("capitulos", n));

		// Fin
		return;
	},

	// TV *********************************
	// ControllerVista (desambiguarGuardar)
	DS_tv: async (datos) => {
		// Datos obtenidos sin la API
		datos = {
			...datos,
			prodNombre: "Colección",
			entidad: "colecciones",
			fuente: "TMDB",
			TMDB_entidad: "tv",
		};
		// Obtiene las API
		let datosAPI = await Promise.all([
			detailsTMDB("tv", datos.TMDB_id),
			creditsTMDB("tv", datos.TMDB_id),
		]).then(([a, b]) => {
			return {...a, ...b};
		});
		// Procesar la información
		if (Object.keys(datosAPI).length) {
			// nombre_original, nombre_castellano, duración de capítulos
			if (datosAPI.original_name) datos.nombre_original = datosAPI.original_name;
			if (datosAPI.name) datos.nombre_castellano = datosAPI.name;
			if (datosAPI.episode_run_time && datosAPI.episode_run_time.length == 1)
				datos.duracion = datosAPI.episode_run_time[0];
			// Idioma
			if (datosAPI.original_language) {
				datos.idioma_original_id = datosAPI.original_language;
				if (
					datosAPI.original_language == "es" ||
					(datosAPI.spoken_languages && datosAPI.spoken_languages.find((n) => n.iso_639_1 == "es"))
				)
					datos.en_castellano_id = 1;
			}
			// año de estreno, año de fin, país de origen
			if (datosAPI.first_air_date) datos.ano_estreno = parseInt(datosAPI.first_air_date.slice(0, 4));
			if (datosAPI.last_air_date) datos.ano_fin = parseInt(datosAPI.last_air_date.slice(0, 4));
			if (datosAPI.origin_country.length > 0) datos.paises_id = datosAPI.origin_country.join(" ");
			// sinopsis, avatar
			if (datosAPI.overview) datos.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path)
				datos.avatar = "https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// Guión, produccion
			if (datosAPI.created_by.length > 0)
				datos.guion = datosAPI.created_by.map((n) => n.name).join(", ");
			if (datosAPI.production_companies.length > 0)
				datos.produccion = limpiaValores(datosAPI.production_companies);
			// Crew
			if (datosAPI.crew.length > 0) {
				datos.direccion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Directing"));
				datos.guion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Writing"));
				datos.musica = limpiaValores(datosAPI.crew.filter((n) => n.department == "Sound"));
			}
			// Cast
			if (datosAPI.cast.length > 0) datos.actuacion = funcionCast(datosAPI.cast);

			// Temporadas
			datosAPI.seasons = datosAPI.seasons.filter((n) => n.season_number > 0);
			datos.cant_temporadas = datosAPI.seasons.length;
		}
		// Fin
		return comp.convierteLetrasAlCastellano(datos);
	},
	infoTMDBparaAgregarCapitulosDeTV: (datosCol, datosTemp, datosCap) => {
		// Datos fijos
		let datos = {entidad: "capitulos", fuente: "TMDB", creado_por_id: 2};

		// Datos de la colección
		datos.coleccion_id = datosCol.id;
		if (datosCol.duracion) datos.duracion = datosCol.duracion;
		if (datosCol.idioma_original_id) datos.idioma_original_id = datosCol.idioma_original_id;
		if (datosCol.en_castellano_id != 2) datos.en_castellano_id = datosCol.en_castellano_id;
		if (datosCol.en_color_id != 2) datos.en_color_id = datosCol.en_color_id;
		datos.categoria_id = datosCol.categoria_id;
		datos.subcategoria_id = datosCol.subcategoria_id;
		datos.publico_sugerido_id = datosCol.publico_sugerido_id;
		datos.direccion = datosCol.direccion;
		datos.guion = datosCol.guion;
		datos.musica = datosCol.musica;
		datos.produccion = datosCol.produccion;

		// Datos de la temporada
		datos.temporada = datosTemp.season_number;

		// Datos distintivos del capítulo
		datos.capitulo = datosCap.episode_number;
		datos.TMDB_id = datosCap.id;
		if (datosCap.name) datos.nombre_castellano = datosCap.name;
		if (datosCap.air_date) datos.ano_estreno = datosCap.air_date;
		if (datosCap.crew.length > 0) {
			datos.direccion = limpiaValores(datosCap.crew.filter((n) => n.department == "Directing"));
			datos.guion = limpiaValores(datosCap.crew.filter((n) => n.department == "Writing"));
			datos.musica = limpiaValores(datosCap.crew.filter((n) => n.department == "Sound"));
		}
		let actuacion = [];
		if (datosTemp.cast.length) actuacion.push(...datosTemp.cast);
		if (datosCap.guest_stars.length) actuacion.push(...datosCap.guest_stars);
		if (actuacion.length) datos.actuacion = funcionCast(actuacion);
		if (datosCap.overview) datos.sinopsis = datosCap.overview;
		let avatar = datosCap.still_path
			? datosCap.still_path
			: datosCap.poster_path
			? datosCap.poster_path
			: "";
		if (avatar) datos.avatar = "https://image.tmdb.org/t/p/original" + avatar;
		return datos;
	},
	// ControllerVista (confirma)
	agregaCapitulosDeTV: async function (datosCol) {
		// Loop de TEMPORADAS
		for (let temporada = 1; temporada <= datosCol.cant_temporadas; temporada++)
			this.agregaCapituloDeTV(datosCol, temporada);
		// Fin
		return;
	},
	agregaCapituloDeTV: async function (datosCol, temporada) {
		// Datos de UNA TEMPORADA
		let datosTemp = await Promise.all([
			detailsTMDB(temporada, datosCol.TMDB_id),
			creditsTMDB(temporada, datosCol.TMDB_id),
		]).then(([a, b]) => {
			return {...a, ...b};
		});
		// Loop de CAPITULOS ********************************************
		for (let episode of datosTemp.episodes) {
			let datosCap = this.infoTMDBparaAgregarCapitulosDeTV(datosCol, datosTemp, episode);
			// Obtiene las API
			await BD_genericas.agregaRegistro(datosCap.entidad, datosCap);
		}
		// Fin
		return;
	},

	// FILM AFFINITY **********************
	// ControllerVista (copiarFA_Guardar)
	infoFAparaDD: async function (dato) {
		// Obtiene los campos del formulario
		let {entidad, en_coleccion, direccion, avatar, contenido} = dato;
		// Generar la información
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let FA_id = this.obtieneFA_id(direccion);
		contenido = this.contenidoFA(contenido.split("\r\n"));
		if (contenido.pais_nombre) {
			let paisNombreToId = async (pais_nombre) => {
				// Función para convertir 'string de nombre' en  'string de ID'
				let resultado = [];
				if (pais_nombre.length) {
					let BD_paises = await BD_genericas.obtieneTodos("paises", "nombre");
					pais_nombreArray = pais_nombre.split(", ");
					// Convertir 'array de nombres' en 'string de ID"
					for (let pais_nombre of pais_nombreArray) {
						let aux = BD_paises.find((n) => n.nombre == pais_nombre);
						aux ? resultado.push(aux.id) : "";
					}
				}
				resultado = resultado.length ? resultado.join(" ") : "";
				return resultado;
			};
			contenido.paises_id = await paisNombreToId(contenido.pais_nombre);
			delete contenido.pais_nombre;
		}
		// Generar el resultado
		let datos = {
			prodNombre,
			entidad,
			fuente: "FA",
			FA_id,
			en_coleccion,
			avatar,
			...contenido,
		};
		// Fin
		return comp.convierteLetrasAlCastellano(datos);
	},
	// Función validar (FA)
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
			resultado.nombre_castellano = funcionParentesis(contenido[contenido.indexOf("Ficha") - 1]);
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
			resultado.direccion = contenido[contenido.indexOf("Dirección") + 1];
		if (contenido.indexOf("Guion") > 0) resultado.guion = contenido[contenido.indexOf("Guion") + 1];
		if (contenido.indexOf("Música") > 0) resultado.musica = contenido[contenido.indexOf("Música") + 1];
		if (contenido.indexOf("Reparto") > 0)
			resultado.actuacion = contenido[contenido.indexOf("Reparto") + 1];
		if (contenido.indexOf("Productora") > 0)
			resultado.produccion = contenido[contenido.indexOf("Productora") + 1];
		if (contenido.indexOf("Sinopsis") > 0) {
			let aux = contenido[contenido.indexOf("Sinopsis") + 1];
			if (!aux.includes("(FILMAFFINITY)")) aux += " (FILMAFFINITY)";
			resultado.sinopsis = aux.replace(/"/g, "'");
		}
		return resultado;
	},
	// ControllerVista (copiarFA_Guardar)
	// ControllerAPI (obtieneFA_id)
	obtieneFA_id: (url) => {
		// Output para FE y BE
		let aux = url.indexOf("www.filmaffinity.com/");
		url = url.slice(aux + 21);
		aux = url.indexOf("/film");
		url = url.slice(aux + 5);
		aux = url.indexOf(".html");
		let FA_id = url.slice(0, aux);
		return FA_id;
	},
	// ConfirmarGuardar
	guarda_cal_registros: (confirma, registro) => {
		let producto_id = comp.obtieneEntidad_id(confirma.entidad);
		let datos = {
			entidad: "cal_registros",
			usuario_id: registro.creado_por_id,
			[producto_id]: registro.id,
			fe_valores: confirma.fe_valores,
			entretiene: confirma.entretiene,
			calidad_tecnica: confirma.calidad_tecnica,
			resultado: confirma.calificacion,
		};
		BD_genericas.agregaRegistro(datos.entidad, datos);
	},
};

// Funciones *********************
let fuenteSinopsisTMDB = (sinopsis) => {
	if (sinopsis && !sinopsis.includes("(FILMAFFINITY)")) sinopsis += " (Fuente: TMDB)";
	return sinopsis;
};
let funcionParentesis = (dato) => {
	let desde = dato.indexOf(" (");
	let hasta = dato.indexOf(")");
	return desde > 0 ? dato.slice(0, desde) + dato.slice(hasta + 1) : dato;
};
let consolidaValores = (datos, cantCapitulos) => {
	datos = datos.replace(/(, )+/g, ", ");
	// Quitar el último ', '
	if (datos.slice(-2) == ", ") datos = datos.slice(0, -2);
	// Convertir los valores en un array
	datos = datos.split(", ");
	// Crear un objeto literal para el campo
	let campo = {};
	// En el objeto literal, hacer un método por cada valor, con la cantidad de veces que aparece
	for (let dato of datos) {
		campo[dato] ? campo[dato]++ : (campo[dato] = 1);
	}
	// Averigua cuántas veces se repite el método más frecuente
	let valores = Object.keys(campo);
	let repeticiones = Object.values(campo);
	let frecMaxima = Math.max(...repeticiones);
	// Copiar el nombre del método
	let resultado = [];
	for (let frecuencia = frecMaxima; frecuencia > 0; frecuencia--) {
		for (let indice = repeticiones.length - 1; indice >= 0; indice--) {
			if (repeticiones[indice] == frecuencia) {
				resultado.push(valores[indice]);
				delete valores[indice];
				delete repeticiones[indice];
			}
		}
		// 1: Los máximos, siempre que:
		//     - Sean más de uno y se hayan hecho por lo menos 2 ruedas
		//     - Se haya hecho la primera de dos ruedas
		if ((resultado.length > 1 && frecuencia == frecMaxima - 1) || frecMaxima == 2) break;
		// 2: Los máximos tres
		if (resultado.length > 2) break;
		// 3: Si hay resultados y la frecuencia ya es muy baja, ¡STOP!
		if (resultado.length && frecuencia - 1 < cantCapitulos * 0.25) break;
	}
	resultado = resultado.join(", ");
	return resultado;
};
let limpiaValores = (datos) => {
	// Variables
	let largo = 100;
	let valores = [];
	// Procesar si hay información
	if (datos.length) {
		// Obtiene el nombre y descartar lo demás
		datos = datos.map((n) => n.name);
		// Quitar duplicados
		for (let dato of datos) if (!valores.length || !valores.includes(dato)) valores.push(dato);
		// Acortar el string excedente
		let texto = valores.join(", ");
		while (texto.length > largo && valores.length > 1) {
			valores.pop();
			texto = valores.join(", ");
		}
	}
	// Terminar el proceso
	valores = valores.join(", ");
	return valores;
};
let funcionCast = (dato) => {
	let actuacion = dato
		.map((n) => n.name + (n.character ? " (" + n.character.replace(",", " -") + ")" : ""))
		.join(", ");
	while (dato.length > 0 && actuacion.length > 500) {
		actuacion = actuacion.slice(0, actuacion.lastIndexOf(","));
	}
	return actuacion;
};
