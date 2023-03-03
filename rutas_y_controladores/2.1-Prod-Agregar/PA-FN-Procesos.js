"use strict";
// Definir variables
const fs = require("fs");
const detailsTMDB = require("../../funciones/1-APIs_TMDB/2-Details");
const creditsTMDB = require("../../funciones/1-APIs_TMDB/3-Credits");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

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
			"datosAdics",
			"confirma",
			"terminaste",
		];
		let indice = pasos.indexOf(paso) + 1;
		for (indice; indice < pasos.length; indice++) {
			if (req.session && req.session[pasos[indice]]) delete req.session[pasos[indice]];
			if (req.cookies && req.cookies[pasos[indice]]) res.clearCookie(pasos[indice]);
		}
	},

	// DesambiguarForm
	agregaCapituloDeCollection: async function (datosCol, capituloID_TMDB, indice) {
		// Toma los datos de la colección
		let {cfc, ocurrio, musical, color, tipo_actuacion_id, publico_id} = datosCol;
		// Prepara los datos del capítulo
		let datosCap = {
			coleccion_id: datosCol.id,
			temporada: 1,
			capitulo: indice + 1,
			creado_por_id: 2,
			...{cfc, ocurrio, musical, color, tipo_actuacion_id, publico_id},
		};
		// Guarda los datos del capítulo
		await this.DS_movie({TMDB_id: capituloID_TMDB})
			.then((n) => (n = {...n, ...datosCap}))
			.then((n) => BD_genericas.agregaRegistro("capitulos", n));

		// Fin
		return;
	},
	// DesambiguarGuardar
	DS_movie: async (datos) => {
		// La entidad puede ser 'peliculas' o 'capitulos', y se agrega más adelante
		datos = {...datos, fuente: "TMDB", TMDB_entidad: "movie"};
		// Obtiene las API
		let detalles = detailsTMDB("movie", datos.TMDB_id);
		let creditos = creditsTMDB("movie", datos.TMDB_id);
		let datosAPI = await Promise.all([detalles, creditos]).then(([a, b]) => {
			return {...a, ...b};
		});
		// Procesa la información
		if (Object.keys(datosAPI).length) {
			if (!datosAPI.belongs_to_collection) {
				datos.prodNombre = "Película";
				datos.entidad = "peliculas";
			}
			// IMDB_id, nombre_original, nombre_castellano
			if (datosAPI.imdb_id) datos.IMDB_id = datosAPI.imdb_id;
			if (datosAPI.original_title) datos.nombre_original = datosAPI.original_title;
			if (datosAPI.title) datos.nombre_castellano = datosAPI.title;
			// Idioma
			if (datosAPI.original_language) datos.idioma_original_id = datosAPI.original_language;

			// año de estreno, duración, país de origen
			if (datosAPI.release_date) datos.ano_estreno = parseInt(datosAPI.release_date.slice(0, 4));
			if (datosAPI.runtime) datos.duracion = datosAPI.runtime;
			if (datosAPI.production_countries.length > 0)
				datos.paises_id = datosAPI.production_countries.map((n) => n.iso_3166_1).join(" ");
			// sinopsis, avatar
			if (datosAPI.overview) datos.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path) datos.avatar = "https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// Producción
			if (datosAPI.production_companies.length > 0) datos.produccion = limpiaValores(datosAPI.production_companies);
			// Crew
			if (datosAPI.crew.length > 0) {
				datos.direccion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Directing"));
				datos.guion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Writing"));
				datos.musica = limpiaValores(datosAPI.crew.filter((n) => n.department == "Sound"));
			}
			// Cast
			if (datosAPI.cast.length > 0) datos.actores = FN_actores(datosAPI.cast);
		}
		return comp.convierteLetrasAlCastellano(datos);
	},
	DS_collection: async (datos) => {
		// Fórmula
		let completaColeccion = async (datos) => {
			// Definir variables
			let paises_id, produccion, direccion, guion, musica, actores;
			paises_id = produccion = direccion = guion = musica = actores = "";
			let exportar = {};
			// Obtiene la info de los capítulos
			let datosAPI = [];
			let capitulos = [];
			datos.capitulosID_TMDB.forEach((capTMDB_id, orden) => {
				datosAPI.push(detailsTMDB("movie", capTMDB_id), creditsTMDB("movie", capTMDB_id), {orden});
			});
			await Promise.all(datosAPI).then((n) => {
				for (let i = 0; i < datosAPI.length; i += 3) capitulos.push({...n[i], ...n[i + 1], ...n[i + 2]});
			});
			// Ordena los registros
			capitulos.sort((a, b) => (a.orden < b.orden ? -1 : a.orden > b.orden ? 1 : 0));

			// Por cada capítulo, agrega un método de cada campo con sus valores sin repetir
			for (let capitulo of capitulos) {
				// Paises_id
				if (capitulo.production_countries.length)
					paises_id += capitulo.production_countries.map((n) => n.iso_3166_1).join(", ") + ", ";
				// Producción
				if (capitulo.production_companies.length) produccion += limpiaValores(capitulo.production_companies) + ", ";
				// Crew
				if (capitulo.crew.length) {
					direccion += limpiaValores(capitulo.crew.filter((n) => n.department == "Directing")) + ", ";
					guion += limpiaValores(capitulo.crew.filter((n) => n.department == "Writing")) + ", ";
					musica += limpiaValores(capitulo.crew.filter((n) => n.department == "Sound")) + ", ";
				}
				// Cast
				if (capitulo.cast.length) actores += FN_actores(capitulo.cast) + ", ";
			}
			// Procesa los resultados
			let cantCaps = capitulos.length;
			if (paises_id) exportar.paises_id = consValsColeccion(paises_id, cantCaps).replace(/,/g, "");
			if (produccion) exportar.produccion = consValsColeccion(produccion, cantCaps);
			if (direccion) exportar.direccion = consValsColeccion(direccion, cantCaps);
			if (guion) exportar.guion = consValsColeccion(guion, cantCaps);
			if (musica) exportar.musica = consValsColeccion(musica, cantCaps);
			if (actores) exportar.actores = consValsColeccion(actores, cantCaps);
			// Fin
			return exportar;
		};

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
		// Procesa la información
		if (Object.keys(datosAPI).length) {
			// nombre_castellano
			if (datosAPI.name) datos.nombre_castellano = datosAPI.name;
			// año de estreno, año de fin
			if (datosAPI.parts.length) {
				let release_date = datosAPI.parts
					.map((n) => n.release_date)
					.filter((n) => n)
					.map((n) => parseInt(n.slice(0, 4)));
				datos.ano_estreno = release_date.length ? Math.min(...release_date) : "";
				datos.ano_fin = release_date.length ? Math.max(...release_date) : "";
			}
			// sinopsis, avatar
			if (datosAPI.overview) datos.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path) datos.avatar = "https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// ID de los capitulos
			datos.capitulosID_TMDB = datosAPI.parts.map((n) => n.id);
		}
		// Datos de los capítulos para completar la colección
		let otrosDatos = await completaColeccion(datos);
		datos = {...datos, ...otrosDatos};
		// Convierte las letras al castellano
		datos = comp.convierteLetrasAlCastellano(datos);
		// Fin
		return datos;
	},
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
		let datosAPI = await Promise.all([detailsTMDB("tv", datos.TMDB_id), creditsTMDB("tv", datos.TMDB_id)]).then(([a, b]) => {
			return {...a, ...b};
		});
		// Procesar la información
		if (Object.keys(datosAPI).length) {
			// nombre_original, nombre_castellano, duración de capítulos
			if (datosAPI.original_name) datos.nombre_original = datosAPI.original_name;
			if (datosAPI.name) datos.nombre_castellano = datosAPI.name;
			// Idioma
			if (datosAPI.original_language) datos.idioma_original_id = datosAPI.original_language;

			// año de estreno, año de fin, país de origen
			if (datosAPI.first_air_date) datos.ano_estreno = parseInt(datosAPI.first_air_date.slice(0, 4));
			if (datosAPI.last_air_date) datos.ano_fin = parseInt(datosAPI.last_air_date.slice(0, 4));
			if (datosAPI.origin_country.length > 0) datos.paises_id = datosAPI.origin_country.join(" ");
			// sinopsis, avatar
			if (datosAPI.overview) datos.sinopsis = fuenteSinopsisTMDB(datosAPI.overview);
			if (datosAPI.poster_path) datos.avatar = "https://image.tmdb.org/t/p/original" + datosAPI.poster_path;
			// Guión, produccion
			if (datosAPI.created_by.length > 0) datos.guion = datosAPI.created_by.map((n) => n.name).join(", ");
			if (datosAPI.production_companies.length > 0) datos.produccion = limpiaValores(datosAPI.production_companies);
			// Crew
			if (datosAPI.crew.length > 0) {
				datos.direccion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Directing"));
				datos.guion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Writing"));
				datos.musica = limpiaValores(datosAPI.crew.filter((n) => n.department == "Sound"));
			}
			// Cast
			if (datosAPI.cast.length > 0) datos.actores = FN_actores(datosAPI.cast);

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
		let {direccion, guion, musica, produccion} = datosCol;
		let {cfc, ocurrio, musical, color, tipo_actuacion_id, publico_id} = datosCol;
		datos = {
			...datos,
			...{direccion, guion, musica, produccion},
			...{cfc, ocurrio, musical, color, tipo_actuacion_id, publico_id},
		};
		datos.coleccion_id = datosCol.id;
		if (datosCap.runtime) datos.duracion = datosCap.runtime;
		if (datosCol.idioma_original_id) datos.idioma_original_id = datosCol.idioma_original_id;

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
		let actores = [];
		if (datosTemp.cast.length) actores.push(...datosTemp.cast);
		if (datosCap.guest_stars.length) actores.push(...datosCap.guest_stars);
		if (actores.length) datos.actores = FN_actores(actores);
		if (datosCap.overview) datos.sinopsis = datosCap.overview;
		let avatar = datosCap.still_path ? datosCap.still_path : datosCap.poster_path ? datosCap.poster_path : "";
		if (avatar) datos.avatar = "https://image.tmdb.org/t/p/original" + avatar;
		return datos;
	},

	// Datos Adicionales
	quitaCamposRCLV: (datos) => {
		// Variables
		let camposDA = variables.camposDA;
		let camposRCLV = camposDA.filter((n) => n.grupo == "RCLV").map((m) => m.nombre);
		if (datos.sinRCLV) for (let campo of camposRCLV) delete datos[campo];

		// Fin
		return datos;
	},
	valorParaActores: (datos) => {
		// Variables
		let anime = tipos_actuacion.find((n) => n.anime);
		let documental = tipos_actuacion.find((n) => n.documental);

		// Acciones si no hay un valor para actores
		return datos.tipo_actuacion_id == anime.id
			? "Dibujos Animados"
			: datos.tipo_actuacion_id == documental.id
			? "Documental"
			: "Desconocido";
	},

	// Confirma Guardar
	verificaQueExistanLosRCLV: async (confirma) => {
		// Variables
		let entidadesRCLV = variables.entidadesRCLV;
		let resultado = true;
		// Revisa que exista el RCLV
		for (let entidad of entidadesRCLV) {
			let campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
			// Averigua si existe, para los RCLV_id que existan y no sean 'ninguno' ni 'varios'
			if (confirma[campo_id] && confirma[campo_id] > 2) {
				let existe = await BD_genericas.obtienePorId(entidad, confirma[campo_id]);
				if (!existe) {
					resultado = false;
					break;
				}
			}
		}
		// Fin
		return resultado;
	},
	agregaCapitulosDeCollection: async function (datos) {
		// Replica para todos los capítulos de la colección
		datos.capitulosID_TMDB.forEach(async (capituloID_TMDB, indice) => {
			await this.agregaCapituloDeCollection(datos, capituloID_TMDB, indice);
		});
		// Fin
		return;
	},
	agregaCapitulosDeTV: async function (datosCol) {
		// Loop de TEMPORADAS
		for (let temporada = 1; temporada <= datosCol.cant_temporadas; temporada++) this.agregaCapituloDeTV(datosCol, temporada);
		// Fin
		return;
	},
	agregaCapituloDeTV: async function (datosCol, temporada) {
		// Datos de UNA TEMPORADA
		let datosTemp = await Promise.all([
			detailsTMDB(temporada, datosCol.TMDB_id),
			creditsTMDB(temporada, datosCol.TMDB_id),
		]).then(([a, b]) => ({...a, ...b}));

		// Loop de CAPITULOS ********************************************
		for (let episode of datosTemp.episodes) {
			let datosCap = this.infoTMDBparaAgregarCapitulosDeTV(datosCol, datosTemp, episode);
			// Obtiene las API
			await BD_genericas.agregaRegistro(datosCap.entidad, datosCap);
		}
		// Fin
		return;
	},
	// Terminaste
	imagenMuchasGracias: () => {
		// Obtiene el listado de archivos
		let muchasGracias = fs.readdirSync("./publico/imagenes/0-Base/Muchas-gracias/");
		// Elije al azar el n° de imagen
		let indice = parseInt(Math.random() * muchasGracias.length);
		// Si se pasó del n°, lo reduce en 1 unidad
		if (indice == muchasGracias.length) indice--;
		// Genera la ruta y el nombre del archivo
		let imagenMuchasGracias = "/imagenes/0-Base/Muchas-gracias/" + muchasGracias[indice];
		// Fin
		return imagenMuchasGracias;
	},

	// FILM AFFINITY **********************
	// ControllerVista (copiarFA_Guardar)
	infoFAparaDD: async function (datos) {
		// Obtiene los campos del formulario
		let {entidad, coleccion_id, avatar_url, contenido, FA_id} = datos;
		// Generar la información
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		contenido = this.contenidoFA(contenido.split("\r\n"));
		if (contenido.pais_nombre) {
			let paisNombreToId = async (pais_nombre) => {
				// Función para convertir 'string de nombre' en  'string de ID'
				let resultado = [];
				if (pais_nombre.length) {
					let pais_nombreArray = pais_nombre.split(", ");
					// Convertir 'array de nombres' en 'string de ID"
					for (let pais_nombre of pais_nombreArray) {
						let aux = paises.find((n) => n.nombre == pais_nombre);
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
		let respuesta = {
			prodNombre,
			entidad,
			fuente: "FA",
			FA_id,
			coleccion_id,
			avatar_url,
			...contenido,
		};
		// Fin
		return comp.convierteLetrasAlCastellano(respuesta);
	},
	// Función validar (FA)
	contenidoFA: (texto) => {
		// Convierte en array
		let contenidos = typeof texto == "string" ? texto.split("\n") : texto;
		// Limpia espacios innecesarios
		for (let contenido of contenidos) contenido = contenido.trim();

		// Arma el objeto literal
		let resultado = {};
		let indice = (queBuscar) => {
			return contenidos.findIndex((n) => n.startsWith(queBuscar));
		};
		if (indice("Ficha") > 0) resultado.nombre_castellano = eliminaParentesis(contenidos[indice("Ficha") - 1]);
		if (indice("Título original") > 0)
			resultado.nombre_original = eliminaParentesis(contenidos[indice("Título original") + 1]);
		if (indice("Año") > 0) resultado.ano_estreno = parseInt(contenidos[indice("Año") + 1]);
		if (indice("Duración") > 0) {
			let duracion = contenidos[indice("Duración") + 1];
			resultado.duracion = parseInt(duracion.slice(0, duracion.indexOf(" ")));
		}
		if (indice("País") > 0) {
			let pais_nombre = contenidos[indice("País") + 1];
			resultado.pais_nombre = pais_nombre.slice((pais_nombre.length + 1) / 2);
		}
		if (indice("Dirección") > 0) resultado.direccion = contenidos[indice("Dirección") + 1];
		if (indice("Guion") > 0) resultado.guion = contenidos[indice("Guion") + 1];
		if (indice("Música") > 0) resultado.musica = contenidos[indice("Música") + 1];
		if (indice("Reparto") > 0) resultado.actores = contenidos[indice("Reparto") + 1];
		if (indice("Productora") > 0) resultado.produccion = contenidos[indice("Productora") + 1];
		else if (indice("Compañías") > 0) resultado.produccion = contenidos[indice("Compañías") + 1];
		if (indice("Sinopsis") > 0) {
			let aux = contenidos[contenidos.indexOf("Sinopsis") + 1];
			if (!aux.includes("(FILMAFFINITY)")) aux += " (FILMAFFINITY)";
			resultado.sinopsis = aux.replace(/"/g, "'");
		}
		// Fin
		return resultado;
	},
	// ControllerVista (copiarFA_Guardar)
	// ControllerAPI (obtieneFA_id)
	obtieneFA_id: (url) => {
		// Protección
		if (!url) return;

		// Quita "/film" y lo previo
		indice = url.indexOf("/film");
		if (indice) url = url.slice(indice + 5);
		else return;

		// Quita la terminación
		indice = url.indexOf(".html");
		if (indice) url = url.slice(0, indice);
		else return

		// Fin
		return url;
	},
};

// Funciones *********************
let fuenteSinopsisTMDB = (sinopsis) => {
	if (sinopsis && !sinopsis.includes("(FILMAFFINITY)")) sinopsis += " (Fuente: TMDB)";
	return sinopsis;
};
let eliminaParentesis = (dato) => {
	let desde = dato.indexOf(" (");
	let hasta = dato.indexOf(")");
	return desde > 0 ? dato.slice(0, desde) + dato.slice(hasta + 1) : dato;
};
let consValsColeccion = (datos, cantCapitulos) => {
	// Corrige defectos
	datos = datos.replace(/(, )+/g, ", ");
	datos = datos.trim();
	// Quita el último ', '
	if (datos.slice(-1) == ",") datos = datos.slice(0, -1);
	// Convierte los valores en un array
	datos = datos.split(", ");
	// Crea un objeto literal para el campo
	let objeto = {};
	// En el objeto literal, hace un método por cada valor, con la cantidad de veces que aparece
	for (let dato of datos) objeto[dato] ? objeto[dato]++ : (objeto[dato] = 1);
	// Averigua cuántas veces se repite el método más frecuente
	let valores = Object.keys(objeto);
	let frecuencias = Object.values(objeto);
	let frecMaxima = Math.max(...frecuencias);
	// Copia el nombre del método
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
	// Fin
	resultado = resultado.join(", ");
	return resultado;
};
let limpiaValores = (datos) => {
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
};
let FN_actores = (dato) => {
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
};
