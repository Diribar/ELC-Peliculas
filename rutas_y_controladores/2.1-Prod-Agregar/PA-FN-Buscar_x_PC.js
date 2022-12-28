"use strict";
// Definir variables
const searchTMDB = require("../../funciones/1-APIs_TMDB/1-Search");
const detailsTMDB = require("../../funciones/1-APIs_TMDB/2-Details");
const creditsTMDB = require("../../funciones/1-APIs_TMDB/3-Credits");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procesos = require("./PA-FN-Procesos");

module.exports = {
	// ControllerAPI (cantProductos)
	// ControllerVista (palabrasClaveGuardar)
	search: async (palabrasClave) => {
		// Funciones
		let funcionesSearchIniciales = (lote, TMDB_entidad, palabrasClave) => {
			// Descarta registros con información incompleta
			(() => {
				let productos = [];
				for (let prod of lote.results) {
					let poster = prod.poster_path;
					let lanzam =
						(prod.first_air_date && prod.first_air_date > "1900") ||
						(prod.release_date && prod.release_date > "1900");
					if ((TMDB_entidad == "collection" && poster) || (poster && lanzam)) productos.push(prod);
				}
				// Fin
				lote = {
					productos,
					TMDB_entidad,
					cantPaginasAPI: Math.min(lote.total_pages, lote.total_results),
				};
			})();
			// Estandariza nombres
			(() => {
				let productos = [];
				for (let prod of lote.productos) {
					// Variables
					let prodNombre,
						entidad,
						nombre_original,
						nombre_castellano,
						idioma_original_id,
						ano_estreno,
						ano_fin;
					ano_estreno = ano_fin = "";
					// Colecciones
					if (TMDB_entidad == "collection") {
						prodNombre = "Colección";
						entidad = "colecciones";
						nombre_original = prod.original_name;
						nombre_castellano = prod.name;
						idioma_original_id = prod.original_language;
					}
					// TV
					else if (TMDB_entidad == "tv") {
						prodNombre = "Colección";
						entidad = "colecciones";
						nombre_original = prod.original_name;
						nombre_castellano = prod.name;
						idioma_original_id = prod.original_language;
						ano_estreno = parseInt(prod.first_air_date.slice(0, 4));
					}
					// Películas
					else if (TMDB_entidad == "movie") {
						prodNombre = "Película";
						entidad = "peliculas";
						nombre_original = prod.original_title;
						nombre_castellano = prod.title;
						idioma_original_id = prod.original_language;
						ano_estreno = ano_fin = parseInt(prod.release_date.slice(0, 4));
					}
					// Define el título sin "distractores", para encontrar duplicados
					let desempate1 = comp
						.convierteLetrasAlIngles(nombre_original)
						.replace(/ /g, "")
						.replace(/'/g, "");
					let desempate2 = comp
						.convierteLetrasAlIngles(nombre_castellano)
						.replace(/ /g, "")
						.replace(/'/g, "");
					// Deja sólo algunos campos
					productos.push({
						TMDB_entidad,
						TMDB_id: prod.id,
						nombre_original,
						nombre_castellano,
						ano_estreno,
						ano_fin,
						idioma_original_id,
						avatar: prod.poster_path,
						prodNombre,
						entidad,
						comentario: prod.overview,
						desempate1,
						desempate2,
					});
				}
				// Fin
				lote.productos = productos;
			})();
			// Descarta los productos que no tienen ninguna palabra clave
			() => {
				let palabras = palabrasClave.split(" ");
				//
				let productos = [];
				lote.productos.forEach((prod) => {
					if (prod)
						for (let palabra of palabras)
							if (
								comp.convierteLetrasAlIngles(prod.nombre_original).includes(palabra) ||
								comp.convierteLetrasAlIngles(prod.nombre_castellano).includes(palabra) ||
								comp.convierteLetrasAlIngles(prod.comentario).includes(palabra)
							) {
								delete prod.comentario;
								productos.push(prod);
								break;
							}
				});
				// Fin
				lote.productos = productos;
			};
			// Fin
			return lote;
		};
		// Variables
		palabrasClave = comp.convierteLetrasAlIngles(palabrasClave);
		let entidadesTMDB = ["collection", "tv", "movie"];
		let acumulador = {productos: [], cantPaginasAPI: {}, cantPaginasUsadas: {}};
		let pagina = 0;
		// Rutina
		while (true) {
			pagina++;
			let lotes = [];
			entidadesTMDB.forEach((TMDB_entidad) => {
				if (pagina == 1 || pagina <= acumulador.cantPaginasAPI[TMDB_entidad]) {
					lotes.push(
						searchTMDB(palabrasClave, TMDB_entidad, pagina)
							// Procesos por lote de productos
							.then((n) => funcionesSearchIniciales(n, TMDB_entidad, palabrasClave))
					);
				}
			});
			// Espera a que las promesas se cumplan
			lotes = await Promise.all(lotes);
			// Acumula los lotes
			(() => {
				// Unifica cantPaginasAPI
				if (pagina == 1)
					for (let lote of lotes)
						acumulador.cantPaginasAPI[lote.TMDB_entidad] = lote.cantPaginasAPI;

				// Unifica productos
				for (let lote of lotes) {
					acumulador.productos.push(...lote.productos);
					acumulador.cantPaginasUsadas[lote.TMDB_entidad] = Math.min(
						pagina,
						acumulador.cantPaginasAPI[lote.TMDB_entidad]
					);
				}
			})();
			// Averigua si hay más productos para 'Search'
			(() => {
				// Para que no haya más, se tiene que haber superado el máximo en las 3 entidades
				acumulador.hayMas =
					pagina < acumulador.cantPaginasAPI[entidadesTMDB[0]] ||
					pagina < acumulador.cantPaginasAPI[entidadesTMDB[1]] ||
					pagina < acumulador.cantPaginasAPI[entidadesTMDB[2]];
			})();

			// Se fija si no hay que buscar más
			if (acumulador.productos.length >= 20 || !acumulador.hayMas) break;
		}
		// Procesos por única vez
		let resultados = acumulador;
		// Elimina los registros duplicados de TV
		(() => {
			for (let indice = resultados.productos.length - 1; indice >= 0; indice--) {
				let registro = resultados.productos[indice];
				let coincidencias;
				if (registro.TMDB_entidad == "tv")
					coincidencias = resultados.productos.filter(
						(n) =>
							(n.desempate1 == registro.desempate1 || n.desempate2 == registro.desempate2) &&
							n.ano_estreno == registro.ano_estreno
					).length;
				// Procesa duplicados
				if (coincidencias && coincidencias > 1) {
					resultados.productos[indice].duplicado = true;
					// resultados.productos.splice(indice, 1);
				}
			}
		})();
		// Agrega el método de palabrasClave
		resultados.palabrasClave = palabrasClave;
		// Fin
		return resultados;
	},

	reemplazoDePeliPorColeccion: async (resultados) => {
		// Revisa y reemplaza las películas por su colección
		await (async () => {
			// Variables
			let colecciones = [];
			// Rutina para el lote de productos
			for (let prod of resultados.productos)
				colecciones.push(prod.entidad == "peliculas" ? detailsTMDB("movie", prod.TMDB_id) : "");
			// Obtiene las promesas
			colecciones = await Promise.all(colecciones);
			// Reemplaza películas por colecciones
			colecciones.forEach((coleccion, indice) => {
				// Si no hay nada que cambiar, interrumpe
				if (!coleccion || !coleccion.belongs_to_collection) return;
				// Idioma original
				let idioma_original_id = resultados.productos[indice].idioma_original_id;
				idioma_original_id = idioma_original_id ? idioma_original_id : "";
				// Si es una película de colección, cambia sus datos por los de la colección
				resultados.productos[indice] = {
					TMDB_entidad: "collection",
					TMDB_id: coleccion.belongs_to_collection.id,
					nombre_original: "",
					nombre_castellano: coleccion.belongs_to_collection.name,
					idioma_original_id,
					avatar: coleccion.belongs_to_collection.poster_path,
					prodNombre: "Colección",
					entidad: "colecciones",
				};
			});
		})();
		// Elimina los registros duplicados
		(() => {
			// Variables
			let productos = [];
			resultados.productos.forEach((prod) => {
				if (!productos.find((n) => n.TMDB_entidad == prod.TMDB_entidad && n.TMDB_id == prod.TMDB_id))
					productos.push(prod);
			});
			// Fin
			resultados.productos = productos;
		})();
		// Averigua qué registros ya tenemos en nuestra base de datos y agrega info
		await (async () => {
			// Variables
			let productos = [];
			// Obtiene los registros de la BD
			for (let prod of resultados.productos) {
				// Obtiene datos
				let TMDB_entidad = prod.TMDB_entidad;
				let TMDB_id = prod.TMDB_id;
				let entidad = TMDB_entidad == "movie" ? "peliculas" : "colecciones";
				// Busca entre las películas o colecciones
				let include = prod.entidad == "colecciones" ? "capitulos" : "";
				productos.push(BD_genericas.obtienePorCamposConInclude(entidad, {TMDB_id}, include));
			}
			// Agrega info de la BD
			productos = await Promise.all(productos);
			productos.forEach((prod, indice) => {
				// Le asigna valores de nuestra BD
				if (prod) {
					resultados.productos[indice].id = prod.id;
					resultados.productos[indice].yaEnBD_id = prod.id;
					resultados.productos[indice].avatar = prod.avatar;
					if (resultados.productos[indice].entidad == "colecciones") {
						resultados.productos[indice].capitulosELC = prod.capitulos.length;
						resultados.productos[indice].capitulosID_ELC = prod.capitulos.map((n) => n.TMDB_id);
					}
				}
			});
		})();
		// Fin
		return resultados;
	},

	organizaLaInformacion: async (resultados) => {
		// Consultando la API, le agrega info a las colecciones y series de tv
		await (async () => {
			// Variables
			let colecciones = [];
			// Obtiene las colecciones/series que se necesitan
			resultados.productos.forEach((prod) => {
				colecciones.push(
					prod.TMDB_entidad != "movie" ? detailsTMDB(prod.TMDB_entidad, prod.TMDB_id) : ""
				);
			});
			colecciones = await Promise.all(colecciones);
			// Completa los campos
			colecciones.forEach((coleccion, indice) => {
				// Interrumpe si no es una colección
				if (!coleccion) return;
				// Acciones si es una collección
				if (coleccion.parts) {
					// Variables para colecciones
					let anos_estreno = coleccion.parts.map((n) => (n.release_date ? n.release_date : "-"));
					let ano_estreno = anos_estreno.reduce((a, b) => (a < b ? a : b));
					let ano_fin = anos_estreno.reduce((a, b) => (a > b && a != "-" ? a : b));
					let capitulosID_TMDB = coleccion.parts.map((n) => n.id);
					// Agrega información
					resultados.productos[indice] = {
						...resultados.productos[indice],
						ano_estreno: ano_estreno != "-" ? parseInt(ano_estreno.slice(0, 4)) : "-",
						ano_fin: ano_fin != "-" ? parseInt(ano_fin.slice(0, 4)) : "-",
						capitulos: anos_estreno.length,
						capitulosID_TMDB,
					};
				}
				// Acciones si es una serie de TV
				else {
					// OBtiene la cantidad de temporadas
					let cant_temporadas = coleccion.seasons.filter((n) => n.season_number).length; // mayor a cero
					// Obtiene los capítulos
					let capitulos = coleccion.seasons
						.filter((n) => n.season_number) // mayor a cero
						.map((n) => n.episode_count)
						.reduce((a, b) => a + b, 0);
					// Agrega información
					resultados.productos[indice] = {
						...resultados.productos[indice],
						ano_fin: coleccion.last_air_date
							? parseInt(coleccion.last_air_date.slice(0, 4))
							: "-",
						capitulos,
						cant_temporadas,
					};
					if (coleccion.episode_run_time && coleccion.episode_run_time.length == 1)
						resultados.productos[indice].duracion = coleccion.episode_run_time[0];
				}
			});
		})();

		// Ordena los productos
		(() => {
			if (resultados.productos.length > 1) {
				// Criterio secundario: primero colecciones, luego películas
				resultados.productos.sort((a, b) =>
					a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0
				);
				// Criterio principal: primero la más reciente
				resultados.productos.sort((a, b) =>
					a.ano_fin > b.ano_fin ? -1 : a.ano_fin < b.ano_fin ? 1 : 0
				);
			}
		})();

		// Genera la info en el formato '{prodsNuevos, prodsYaEnBD, mensaje}'
		(() => {
			// Variables
			let prodsNuevos = resultados.productos.filter((n) => !n.yaEnBD_id);
			let prodsYaEnBD = resultados.productos.filter((n) => n.yaEnBD_id);
			let coincidencias = resultados.productos.length;
			let cantN = prodsNuevos && prodsNuevos.length ? prodsNuevos.length : 0;
			let hayMas = resultados.hayMas;
			// Obtiene el mensaje
			let mensaje =
				"Encontramos " +
				(coincidencias == 1
					? "una sola coincidencia, que " + (cantN == 1 ? "no" : "ya")
					: (hayMas ? "muchas" : coincidencias) +
					  " coincidencias" +
					  (hayMas ? ". Te mostramos " + coincidencias : "") +
					  (cantN == coincidencias ? ", ninguna" : cantN ? ", " + cantN + " no" : ", todas ya")) +
				" está" +
				(cantN > 1 && cantN < coincidencias ? "n" : "") +
				" en nuestra BD.";
			// Fin
			resultados = {prodsNuevos, prodsYaEnBD, mensaje};
		})();

		// Agrega capitulos
		(() => {
			// Si no hay productosYaEnBD o no son de colecciones, saltea la rutina
			if (!resultados.prodsYaEnBD.length) return;
			if (!resultados.prodsYaEnBD.filter((n) => n.entidad == "colecciones").length) return;
			// Rutina
			resultados.prodsYaEnBD.forEach((coleccion) => {
				if (coleccion.capitulos && coleccion.capitulos != coleccion.capitulosELC) {
					if (coleccion.TMDB_entidad == "collection") agregaCapitulosCollection(coleccion);
					if (coleccion.TMDB_entidad == "tv") agregaCapitulosTV(coleccion);
				}
			});
		})();
		// Fin
		return resultados;
	},
};

// Funciones
let agregaCapitulosCollection = async (coleccion) => {
	// Recorre los capítulos
	await coleccion.capitulosID_TMDB.forEach(async (capituloID_TMDB, indice) => {
		// Averigua si algún capítulo es nuevo
		if (!coleccion.capitulosID_ELC.includes(String(capituloID_TMDB))) {
			// Si es nuevo, lo agrega
			await procesos.agregaCapituloDeCollection(coleccion, capituloID_TMDB, indice);
		}
	});
	// Fin
	return;
};
let agregaCapitulosTV = async (coleccion) => {
	// Obtiene los datos de la serieTV
	coleccion = {...coleccion, ...(await BD_genericas.obtienePorId("colecciones", coleccion.id))};
	// Loop de TEMPORADAS
	for (let numTemp = 1; numTemp <= coleccion.cant_temporadas; numTemp++) {
		// Obtiene los datos de la temporada
		let datosTemp = await detailsTMDB(numTemp, coleccion.TMDB_id);
		// Obtiene los ID de los capítulos
		coleccion.capitulosID_TMDB = datosTemp.episodes.map((m) => m.id);
		// Recorre los capítulos TMDB
		for (let capituloID_TMDB of coleccion.capitulosID_TMDB) {
			// Acciones si algún capítulo es nuevo
			if (!coleccion.capitulosID_ELC.includes(String(capituloID_TMDB))) {
				// Amplía la información
				datosTemp = {...datosTemp, ...(await creditsTMDB(numTemp, coleccion.TMDB_id))};
				// Procesa la información
				let episodio = datosTemp.episodes.find((n) => n.id == capituloID_TMDB);
				let datosCap = procesos.infoTMDBparaAgregarCapitulosDeTV(coleccion, datosTemp, episodio);
				// Completar datos
				datosCap = {
					...datosCap,
					alta_analizada_por_id: coleccion.alta_analizada_por_id,
					alta_analizada_en: coleccion.alta_analizada_en,
					status_registro_id: coleccion.status_registro_id,
				};
				// Guarda el registro
				await BD_genericas.agregaRegistro(datosCap.entidad, datosCap);
			}
		}
	}
	// Fin
	return;
};
