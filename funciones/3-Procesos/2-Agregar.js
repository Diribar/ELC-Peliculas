"use strict";
// Definir variables
const detailsTMDB = require("../1-APIs_TMDB/2-Details");
const creditsTMDB = require("../1-APIs_TMDB/3-Credits");
const BD_genericas = require("../2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");
const funciones = require("../3-Procesos/Compartidas");

module.exports = {
	// USO COMPARTIDO *********************
	borrarSessionCookies: (req, res, paso) => {
		let pasos = [
			"borrarTodo",
			"palabrasClave",
			"desambiguar",
			"tipoProducto",
			"datosOriginales",
			"copiarFA",
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
	// ControllerVista (desambiguarForm)
	prepararMensaje: (desambiguar) => {
		let prod_nuevos = desambiguar.resultados.filter((n) => !n.YaEnBD);
		let prod_yaEnBD = desambiguar.resultados.filter((n) => n.YaEnBD);
		let coincidencias = desambiguar.resultados.length;
		let nuevos = prod_nuevos && prod_nuevos.length ? prod_nuevos.length : 0;
		let hayMas = desambiguar.hayMas;
		let mensaje =
			"Encontramos " +
			(coincidencias == 1
				? "una sola coincidencia, que " + (nuevos == 1 ? "no" : "ya")
				: (hayMas ? "muchas" : coincidencias) +
				  " coincidencias" +
				  (hayMas ? ". Te mostramos " + coincidencias : "") +
				  (nuevos == coincidencias ? ", ninguna" : nuevos ? ", " + nuevos + " no" : ", todas ya")) +
			" está" +
			(nuevos > 1 && nuevos < coincidencias ? "n" : "") +
			" en nuestra BD.";
		return [prod_nuevos, prod_yaEnBD, mensaje];
	},

	// MOVIES *****************************
	// ControllerVista (desambiguarGuardar)
	infoTMDBparaDD_movie: async (datos) => {
		// La entidad puede ser 'peliculas' o 'capitulos', y se agrega más adelante
		datos = {...datos, fuente: "TMDB", TMDB_entidad: "movie"};
		// Obtener las API
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
				datos.en_colec_id = await BD_especificas.obtenerELC_id("colecciones", {
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
			if (datosAPI.runtime != null) datos.duracion = datosAPI.runtime;
			if (datosAPI.production_countries.length > 0)
				datos.paises_id = datosAPI.production_countries.map((n) => n.iso_3166_1).join(", ");
			// sinopsis, avatar
			if (datosAPI.overview) datos.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path)
				datos.avatar = "https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// Producción
			if (datosAPI.production_companies.length > 0)
				datos.produccion = consolidarValores(datosAPI.production_companies);
			// Crew
			if (datosAPI.crew.length > 0) {
				datos.direccion = consolidarValores(datosAPI.crew.filter((n) => n.department == "Directing"));
				datos.guion = consolidarValores(datosAPI.crew.filter((n) => n.department == "Writing"));
				datos.musica = consolidarValores(datosAPI.crew.filter((n) => n.department == "Sound"));
			}
			// Cast
			if (datosAPI.cast.length > 0) datos.actuacion = funcionCast(datosAPI.cast);
		}
		return funciones.convertirLetrasAlCastellano(datos);
	},
	averiguarColeccion: async (TMDB_id) => {
		// Obtener la API
		let datosAPI = await detailsTMDB("movie", TMDB_id);
		// Datos de la colección a la que pertenece, si corresponde
		let datos = {};
		if (datosAPI.belongs_to_collection != null) {
			// Obtener datos de la colección
			datos.colec_TMDB_id = datosAPI.belongs_to_collection.id;
			datos.colec_nombre = datosAPI.belongs_to_collection.name;
			// elc_id de la colección
			datos.colec_id = await BD_especificas.obtenerELC_id("colecciones", {
				TMDB_id: datos.colec_TMDB_id,
			});
			if (datos.colec_id) return datos;
		}
		return datos;
	},

	// COLLECTIONS ************************
	// ControllerVista (desambiguarGuardar)
	infoTMDBparaDD_collection: async function (datos) {
		// Datos obtenidos sin la API
		datos = {
			...datos,
			prodNombre: "Colección",
			entidad: "colecciones",
			fuente: "TMDB",
			TMDB_entidad: "collection",
			cant_temporadas: 1,
		};
		// Obtener las API
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
			datos.capitulosTMDB_id = datosAPI.parts.map((n) => n.id);
			datos.cant_capitulos = datosAPI.parts.length;
		}
		// Datos de los capítulos para completar la colección
		let otrosDatos = await this.completarColeccion(datos);
		datos = {...datos, ...otrosDatos};
		// Fin
		return funciones.convertirLetrasAlCastellano(datos);
	},
	completarColeccion: async (datos) => {
		// Definir variables
		let paises_id, produccion, direccion, guion, musica, actuacion;
		paises_id = produccion = direccion = guion = musica = actuacion = "";
		let exportar = {};
		// Rutina por cada capítulo
		for (let capTMDB_id of datos.capitulosTMDB_id) {
			// Obtener las API
			let datosAPI = await Promise.all([
				detailsTMDB("movie", capTMDB_id),
				creditsTMDB("movie", capTMDB_id),
			]).then(([a, b]) => {
				return {...a, ...b};
			});
			// Por cada capítulo, agregar un método de cada campo con sus valores sin repetir
			// Paises_id
			if (datosAPI.production_countries.length > 0)
				paises_id += datosAPI.production_countries.map((n) => n.iso_3166_1).join(", ") + ", ";
			// Producción
			if (datosAPI.production_companies.length > 0)
				produccion += consolidarValores(datosAPI.production_companies) + ", ";
			// Crew
			if (datosAPI.crew.length > 0) {
				direccion +=
					consolidarValores(datosAPI.crew.filter((n) => n.department == "Directing")) + ", ";
				guion += consolidarValores(datosAPI.crew.filter((n) => n.department == "Writing")) + ", ";
				musica += consolidarValores(datosAPI.crew.filter((n) => n.department == "Sound")) + ", ";
			}
			// Cast
			if (datosAPI.cast.length > 0) actuacion += funcionCast(datosAPI.cast) + ", ";
		}
		// Procesar los resultados
		let cantCapitulos = datos.capitulosTMDB_id.length;
		if (paises_id) exportar.paises_id = datosColeccion(paises_id, cantCapitulos);
		if (produccion) exportar.produccion = datosColeccion(produccion, cantCapitulos);
		if (direccion) exportar.direccion = datosColeccion(direccion, cantCapitulos);
		if (guion) exportar.guion = datosColeccion(guion, cantCapitulos);
		if (musica) exportar.musica = datosColeccion(musica, cantCapitulos);
		if (actuacion) exportar.actuacion = datosColeccion(actuacion, cantCapitulos);
		// Fin
		return exportar;
	},
	// ControllerVista (confirma)
	agregarCapitulosDeCollection: async function (datosCol) {
		// Replicar para todos los capítulos de la colección
		let numCapitulo = 0;
		for (let capituloTMDB_Id of datosCol.capitulosTMDB_id) {
			numCapitulo++;
			// Si el capítulo no existe, agregarlo
			let existe = await BD_especificas.obtenerELC_id("capitulos", {TMDB_id: capituloTMDB_Id});
			if (!existe) {
				// Preparar datos del capítulo
				let datosCap = {
					coleccion_id: datosCol.id,
					fuente: "TMDB",
					temporada: 1,
					capitulo: numCapitulo,
					creado_por_id: 2,
					capturado_por_id: 2,
				};
				if (datosCol.en_castellano_id != 2) datosCap.en_castellano_id = datosCol.en_castellano_id;
				if (datosCol.en_color_id != 2) datosCap.en_color_id = datosCol.en_color_id;
				datosCap.categoria_id = datosCol.categoria_id;
				datosCap.subcategoria_id = datosCol.subcategoria_id;
				datosCap.publico_sugerido_id = datosCol.publico_sugerido_id;
				// Guardar los datos del capítulo
				await this.infoTMDBparaDD_movie({TMDB_id: capituloTMDB_Id})
					.then((n) => (n = {...n, ...datosCap}))
					.then((n) => BD_genericas.agregarRegistro("capitulos", n));
			}
		}
		return;
	},
	// ControllerVista (confirma)
	agregarCapitulosNuevos: async function (coleccion_id, TMDB_id) {
		// Obtener el API actualizada de la colección
		let datosAPI = await detailsTMDB("collection", TMDB_id);
		// Obtener el ID de los capitulos
		let capitulos_TMDB_id = datosAPI.parts.map((n) => n.id);
		// Agregar los capítulos que correspondan
		await this.agregarCapitulosDeCollection(coleccion_id, capitulos_TMDB_id);
		return;
	},

	// TV *********************************
	// ControllerVista (desambiguarGuardar)
	infoTMDBparaDD_tv: async (datos) => {
		// Datos obtenidos sin la API
		datos = {
			...datos,
			prodNombre: "Colección",
			entidad: "colecciones",
			fuente: "TMDB",
			TMDB_entidad: "tv",
		};
		// Obtener las API
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
			if (datosAPI.origin_country.length > 0) datos.paises_id = datosAPI.origin_country.join(", ");
			// sinopsis, avatar
			if (datosAPI.overview) datos.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path)
				datos.avatar = "https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// Guión, produccion
			if (datosAPI.created_by.length > 0)
				datos.guion = datosAPI.created_by.map((n) => n.name).join(", ");
			if (datosAPI.production_companies.length > 0)
				datos.produccion = consolidarValores(datosAPI.production_companies);
			// Credits
			// Crew
			if (datosAPI.crew.length > 0) {
				datos.direccion = consolidarValores(datosAPI.crew.filter((n) => n.department == "Directing"));
				datos.guion = consolidarValores(datosAPI.crew.filter((n) => n.department == "Writing"));
				datos.musica = consolidarValores(datosAPI.crew.filter((n) => n.department == "Sound"));
			}
			// Cast
			if (datosAPI.cast.length > 0) datos.actuacion = funcionCast(datosAPI.cast);

			// Temporadas
			datosAPI.seasons = datosAPI.seasons.filter((n) => n.season_number > 0);
			datos.cant_temporadas = datosAPI.seasons.length;
			datos.cant_capitulos = datosAPI.seasons
				.map((n) => n.episode_count)
				.reduce((a, b) => {
					return a + b;
				});
		}
		// Fin
		return funciones.convertirLetrasAlCastellano(datos);
	},
	infoTMDBparaAgregarCapitulosDeTV: (datosCol, datosTemp, datosCap) => {
		// Datos fijos
		let datos = {entidad: "capitulos", fuente: "TMDB", creado_por_id: 2, capturado_por_id: 2};

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
			datos.direccion = consolidarValores(datosCap.crew.filter((n) => n.department == "Directing"));
			datos.guion = consolidarValores(datosCap.crew.filter((n) => n.department == "Writing"));
			datos.musica = consolidarValores(datosCap.crew.filter((n) => n.department == "Sound"));
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
	agregarCapitulosDeTV: async function (datosCol) {
		// Loop de TEMPORADAS ***********************************************
		for (let temporada = 1; temporada <= datosCol.cant_temporadas; temporada++) {
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
				// Obtener las API
				await BD_genericas.agregarRegistro(datosCap.entidad, datosCap);
			}
		}
		return;
	},

	// FILM AFFINITY **********************
	// ControllerVista (copiarFA_Guardar)
	infoFAparaDD: async function (dato) {
		// Obtener los campos del formulario
		let {entidad, en_coleccion, direccion, avatar, contenido} = dato;
		// Generar la información
		let prodNombre = funciones.obtenerEntidadNombre(entidad);
		let FA_id = this.obtenerFA_id(direccion);
		contenido = this.contenidoFA(contenido.split("\r\n"));
		if (contenido.pais_nombre) {
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
		return funciones.convertirLetrasAlCastellano(datos);
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
	// ControllerAPI (obtenerFA_id)
	obtenerFA_id: (url) => {
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
	guardar_cal_registros: (confirma, registro) => {
		let producto_id = funciones.obtenerEntidad_id(confirma.entidad);
		let datos = {
			entidad: "cal_registros",
			usuario_id: registro.creado_por_id,
			[producto_id]: registro.id,
			fe_valores: confirma.fe_valores,
			entretiene: confirma.entretiene,
			calidad_tecnica: confirma.calidad_tecnica,
			resultado: confirma.calificacion,
		};
		BD_genericas.agregarRegistro(datos.entidad, datos);
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
let datosColeccion = (datos, cantCapitulos) => {
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
	// Averiguar cuántas veces se repite el método más frecuente
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
		// 1: Los máximos, siempre que sean más de uno
		if (resultado.length > 1 && frecuencia == frecMaxima - 1) break;
		// 2: Los máximos tres
		if (resultado.length > 2) break;
		// 3: Si hay resultados y la frecuencia ya es muy baja, ¡STOP!
		if (resultado.length && frecuencia - 1 < cantCapitulos * 0.25) break;
	}
	resultado = resultado.join(", ");
	return resultado;
};
let consolidarValores = (datos) => {
	// Variables
	let largo = 100;
	let valores = [];
	// Procesar si hay información
	if (datos.length) {
		// Obtener el nombre y descartar lo demás
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
let paisNombreToId = async (pais_nombre) => {
	// Función para convertir 'string de nombre' en  'string de ID'
	let resultado = [];
	if (pais_nombre.length) {
		let BD_paises = await BD_genericas.obtenerTodos("paises", "nombre");
		pais_nombreArray = pais_nombre.split(", ");
		// Convertir 'array de nombres' en 'string de ID"
		for (let pais_nombre of pais_nombreArray) {
			let aux = BD_paises.find((n) => n.nombre == pais_nombre);
			aux ? resultado.push(aux.id) : "";
		}
	}
	resultado = resultado.length ? resultado.join(", ") : "";
	return resultado;
};
