"use strict";
// Definir variables
const APIsTMDB = require("../../funciones/1-Procesos/APIsTMDB");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");

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

	// DESAMBIGUAR - GUARDAR
	// 1. Películas
	DS_movie: async function (datos) {
		// La entidad puede ser 'peliculas' o 'capitulos', y se agrega más adelante
		datos = {...datos, fuente: "TMDB", TMDB_entidad: "movie"};

		// Obtiene las API
		let detalles = APIsTMDB.details("movie", datos.TMDB_id);
		let creditos = APIsTMDB.credits("movie", datos.TMDB_id);
		let datosAPI = await Promise.all([detalles, creditos]).then(([a, b]) => ({...a, ...b}));

		// Procesa la información
		if (Object.keys(datosAPI).length) datos = {...datos, ...this.datosPelis(datosAPI)};
		datos = comp.convierteLetras.alCastellano(datos);

		// Fin
		return datos;
	},
	datosPelis: (datosAPI) => {
		// Variables
		let datos = {};

		// Procesa la información
		if (!datosAPI.belongs_to_collection) {
			datos.entidadNombre = "Película";
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
			const direccion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Directing"));
			if (direccion) datos.direccion = direccion;
			const guion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Writing"));
			if (guion) datos.guion = guion;
			const musica = limpiaValores(datosAPI.crew.filter((n) => n.department == "Sound"));
			if (musica) datos.musica = musica;
		}
		// Cast
		if (datosAPI.cast.length > 0) datos.actores = FN_actores(datosAPI.cast);

		// Fin
		return datos;
	},

	// 2. Colecciones de Películas
	DS_collection: async function (datos) {
		// Obtiene información de la colección
		datos = {
			...datos,
			entidadNombre: "Colección",
			entidad: "colecciones",
			fuente: "TMDB",
			TMDB_entidad: "collection",
			cant_temps: 1,
		};
		const datosColec = await APIsTMDB.details("collection", datos.TMDB_id);

		// Obtiene y procesa información
		if (Object.keys(datosColec).length) {
			// Procesa la información de la colección
			datos = {...datos, ...this.datosColec(datosColec)};

			// Obtiene la información de los capítulos y la procesa
			datos = {...datos, ...(await this.datosCaps(datos.capitulosID_TMDB))};
		}

		// Convierte las letras al castellano
		datos = comp.convierteLetras.alCastellano(datos);

		// Fin
		return datos;
	},
	datosColec: (datosColec) => {
		// Variables
		let datos = {};

		// nombre_castellano
		if (datosColec.name) datos.nombre_castellano = datosColec.name;

		// año de estreno, año de fin
		if (datosColec.parts.length) {
			let release_date = datosColec.parts
				.map((n) => n.release_date)
				.filter((n) => !!n)
				.map((n) => parseInt(n.slice(0, 4)));
			if (release_date.length) {
				datos.ano_estreno = Math.min(...release_date);
				datos.ano_fin = Math.max(...release_date);
			}
		}

		// sinopsis, avatar
		if (datosColec.overview) datos.sinopsis = fuenteSinopsisTMDB(datosColec.overview);
		if (datosColec.poster_path) datos.avatar = "https://image.tmdb.org/t/p/original" + datosColec.poster_path;

		// ID de los capitulos
		datos.capitulosID_TMDB = datosColec.parts.map((n) => n.id);

		// Fin
		return datos;
	},
	datosCaps: async (capitulosID_TMDB) => {
		// Variables
		let paises_id, produccion, direccion, guion, musica, actores;
		paises_id = produccion = direccion = guion = musica = actores = "";
		let datosAPI = [];
		let capitulos = [];
		let datos = {};

		// Obtiene la info de los capítulos
		capitulosID_TMDB.forEach((capTMDB_id, orden) => {
			const detalles = APIsTMDB.details("movie", capTMDB_id);
			const creditos = APIsTMDB.credits("movie", capTMDB_id);
			datosAPI.push(detalles, creditos, {orden});
		});
		await Promise.all(datosAPI).then((n) => {
			for (let i = 0; i < n.length; i += 3) capitulos.push({...n[i], ...n[i + 1], ...n[i + 2]});
		});

		// Ordena los registros
		capitulos.sort((a, b) => (a.orden < b.orden ? -1 : a.orden > b.orden ? 1 : 0));

		// Toma información de cada capítulo, para alimentar la colección
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
		if (paises_id) datos.paises_id = consolidaValoresColeccion(paises_id, cantCaps).replace(/,/g, "");
		if (produccion) datos.produccion = consolidaValoresColeccion(produccion, cantCaps);
		if (direccion) datos.direccion = consolidaValoresColeccion(direccion, cantCaps);
		if (guion) datos.guion = consolidaValoresColeccion(guion, cantCaps);
		if (musica) datos.musica = consolidaValoresColeccion(musica, cantCaps);
		if (actores) datos.actores = consolidaValoresColeccion(actores, cantCaps);

		// Fin
		return datos;
	},

	// 3. Colecciones de series de TV
	DS_tv: async function (datos) {
		// Datos obtenidos sin la API
		datos = {...datos, entidadNombre: "Colección", entidad: "colecciones", fuente: "TMDB", TMDB_entidad: "tv"};

		// Obtiene las API
		const resultados = [APIsTMDB.details("tv", datos.TMDB_id), APIsTMDB.credits("tv", datos.TMDB_id)];
		const datosAPI = await Promise.all(resultados).then(([a, b]) => ({...a, ...b}));

		// Procesa la información
		if (Object.keys(datosAPI).length) datos = {...datos, ...this.DS_tv_info(datosAPI)};
		datos = comp.convierteLetras.alCastellano(datos);

		// Fin
		return datos;
	},
	DS_tv_info: (datosAPI) => {
		// Variables
		let datos = {};

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
			const direccion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Directing"));
			if (direccion) datos.direccion = direccion;
			const guion = limpiaValores(datosAPI.crew.filter((n) => n.department == "Writing"));
			if (guion) datos.guion = guion;
			const musica = limpiaValores(datosAPI.crew.filter((n) => n.department == "Sound"));
			if (musica) datos.musica = musica;
		}
		// Cast
		if (datosAPI.cast.length > 0) datos.actores = FN_actores(datosAPI.cast);

		// Temporadas
		datosAPI.seasons = datosAPI.seasons.filter((n) => n.season_number > 0);
		datos.cant_temps = datosAPI.seasons.length;

		// Fin
		return datos;
	},

	// DATOS ADICIONALES - GUARDAR
	quitaCamposRCLV: (datos) => {
		// Variables
		const camposDA = variables.camposDA;
		const camposRCLV = camposDA.filter((n) => n.grupo == "RCLV").map((m) => m.nombre);
		if (datos.sinRCLV) for (let campo of camposRCLV) delete datos[campo];

		// Fin
		return datos;
	},
	valorParaActores: (datos) => {
		// Acciones si no hay un valor para actores
		return datos.tipo_actuacion_id == anime_id
			? "Dibujos Animados"
			: datos.tipo_actuacion_id == documental_id
			? "Documental"
			: datos.actores
			? datos.actores
			: "Desconocido";
	},

	// CONFIRMA - GUARDAR
	verificaQueExistanLosRCLV: async (confirma) => {
		// Variables
		const entidadesRCLV = variables.entidades.rclvs;
		let existe = true;
		let epoca_id = null;

		// Revisa que exista el RCLV
		for (let entidad of entidadesRCLV) {
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			// Averigua si existe, para los RCLV_id que existan y no sean 'ninguno' ni 'varios'
			if (confirma[campo_id] && confirma[campo_id] > 2) {
				const registro = await BD_genericas.obtienePorId(entidad, confirma[campo_id]);
				if (!registro) {
					existe = false;
					break;
				} else if (registro.epoca_id && !confirma.epoca_id) epoca_id = registro.epoca_id;
			}
		}

		// Fin
		return {existe, epoca_id};
	},
	// Agrega capítulos de colección
	agregaCaps_Colec: async function (datos) {
		// Replica para todos los capítulos de la colección - ¡No se debe usar 'forEach' porque no respeta el await!
		let indice = 0;
		for (let capituloID_TMDB of datos.capitulosID_TMDB) {
			indice++;
			await this.agregaUnCap_Colec(datos, capituloID_TMDB, indice);
		}

		// Fin
		return;
	},
	// Agregado de Capítulos de TV
	agregaCaps_TV: function (datosCol) {
		// Loop de TEMPORADAS
		for (let temporada = 1; temporada <= datosCol.cant_temps; temporada++) this.agregaUnCap_TV(datosCol, temporada);

		// Fin
		return;
	},

	// AUXILIARES
	agregaUnCap_Colec: async function (datosCol, capituloID_TMDB, indice) {
		// Toma los datos de la colección
		const {paises_id, idioma_original_id} = datosCol;
		const {direccion, guion, musica, actores, produccion} = datosCol;
		// const {cfc, ocurrio, musical, color, tipo_actuacion_id} = datosCol;
		// const {personaje_id, hecho_id, tema_id} = datosCol;

		// Genera la información a guardar
		const datosCap = {
			...{fuente: "TMDB", coleccion_id: datosCol.id, temporada: 1, capitulo: indice},
			...{paises_id, idioma_original_id},
			...{direccion, guion, musica, actores, produccion},
			// ...{cfc, ocurrio, musical, color, tipo_actuacion_id},
			// ...{personaje_id, hecho_id, tema_id},
			...{creado_por_id: 2, sugerido_por_id: 2},
		};

		// Obtiene los datos del capítulo
		await this.DS_movie({TMDB_id: capituloID_TMDB})
			// Le agrega los datos de cabecera
			.then((n) => (n = {...datosCap, ...n}))
			// Le corrige los actores si no es actuada
			.then((n) => (tipo_actuacion_id != 1 ? (n = {...n, actores}) : n))
			// Guarda los datos del capítulo
			.then(async (n) => BD_genericas.agregaRegistro("capitulos", n));

		// Fin
		return;
	},
	agregaUnCap_TV: async function (datosCol, temporada) {
		// Datos de UNA TEMPORADA
		let datosTemp = await Promise.all([
			APIsTMDB.details(temporada, datosCol.TMDB_id),
			APIsTMDB.credits(temporada, datosCol.TMDB_id),
		]).then(([a, b]) => ({...a, ...b}));

		// Loop de CAPITULOS ********************************************
		for (let episode of datosTemp.episodes) {
			// Obtiene la información del registro
			let datosCap = this.infoTMDB_capsTV(datosCol, datosTemp, episode);

			// Guarda el registro
			await BD_genericas.agregaRegistro("capitulos", datosCap);
		}

		// Fin
		return;
	},
	infoTMDB_capsTV: (datosCol, datosTemp, datosCap) => {
		// Toma los datos de la colección
		const {paises_id, idioma_original_id} = datosCol;
		let {direccion, guion, musica, actores, produccion} = datosCol;
		// const {cfc, ocurrio, musical, color, tipo_actuacion_id} = datosCol;
		// const {personaje_id, hecho_id, tema_id} = datosCol;

		// Genera la información a guardar
		let datos = {
			...{fuente: "TMDB", coleccion_id: datosCol.id},
			...{paises_id, idioma_original_id},
			...{direccion, guion, musica, actores, produccion},
			// ...{cfc, ocurrio, musical, color, tipo_actuacion_id},
			// ...{personaje_id, hecho_id, tema_id},
			...{creado_por_id: 2, sugerido_por_id: 2},
		};
		if (datosCap.runtime) datos.duracion = datosCap.runtime;

		// Datos de la temporada
		datos.temporada = datosTemp.season_number;

		// Datos distintivos del capítulo
		datos.capitulo = datosCap.episode_number;
		datos.TMDB_id = datosCap.id;
		if (datosCap.name) datos.nombre_castellano = datosCap.name;
		if (datosCap.air_date) datos.ano_estreno = datosCap.air_date;
		if (datosCap.crew.length > 0) {
			direccion = limpiaValores(datosCap.crew.filter((n) => n.department == "Directing"));
			if (direccion) datos.direccion = direccion;
			guion = limpiaValores(datosCap.crew.filter((n) => n.department == "Writing"));
			if (guion) datos.guion = guion;
			musica = limpiaValores(datosCap.crew.filter((n) => n.department == "Sound"));
			if (musica) datos.musica = musica;
		}
		if (tipo_actuacion_id == actuada_id) {
			actores = [];
			if (datosTemp.cast.length) actores = [...datosTemp.cast];
			if (datosCap.guest_stars.length) actores.push(...datosCap.guest_stars);
			if (actores.length) datos.actores = FN_actores(actores);
		}
		if (datosCap.overview) datos.sinopsis = datosCap.overview;
		let avatar = datosCap.still_path ? datosCap.still_path : datosCap.poster_path ? datosCap.poster_path : "";
		if (avatar) datos.avatar = "https://image.tmdb.org/t/p/original" + avatar;

		// Procesa la información
		datos = comp.convierteLetras.alCastellano(datos);

		// Fin
		return datos;
	},

	// FILM AFFINITY **********************
	// ControllerVista (copiarFA_Guardar)
	infoFAparaDD: function (datos) {
		// Obtiene los campos del formulario
		let {entidad, coleccion_id, avatar_url, contenido, FA_id} = datos;
		// Generar la información
		let entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		contenido = this.contenidoFA(contenido.split("\r\n"));
		if (contenido.pais_nombre) {
			let paisNombreToId = (pais_nombre) => {
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
			contenido.paises_id = paisNombreToId(contenido.pais_nombre);
			delete contenido.pais_nombre;
		}
		// Generar el resultado
		let respuesta = {
			entidadNombre,
			entidad,
			fuente: "FA",
			FA_id,
			coleccion_id,
			avatar_url,
			...contenido,
		};
		// Fin
		return comp.convierteLetras.alCastellano(respuesta);
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
	// ControllerVista (copiarFA_Guardar), ControllerAPI (obtieneFA_id)
	obtieneFA_id: (url) => {
		// Protección
		if (!url) return;

		// Quita "/film" y lo previo
		let indice = url.indexOf("/film");
		if (indice) url = url.slice(indice + 5);
		else return;

		// Quita la terminación
		indice = url.indexOf(".html");
		if (indice) url = url.slice(0, indice);
		else return;

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
let consolidaValoresColeccion = (datos, cantCapitulos) => {
	// Corrige defectos y convierte los valores en un array
	datos = datos.replace(/(, )+/g, ", ");
	datos = datos.trim();
	if (datos.slice(-1) == ",") datos = datos.slice(0, -1);
	datos = datos.split(", ");

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
