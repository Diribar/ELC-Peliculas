"use strict";
// Definir variables
const APIsTMDB = require("../../funciones/2-Procesos/APIsTMDB");
const procesos = require("./PA-FN4-Procesos");

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
					if (poster && (TMDB_entidad == "collection" || lanzam)) productos.push(prod);
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
					let entidadNombre, entidad, nombreOriginal, nombreCastellano, idiomaOriginal_id, anoEstreno, anoFin;
					anoEstreno = anoFin = "";
					// Colecciones
					if (TMDB_entidad == "collection") {
						entidadNombre = "Colección";
						entidad = "colecciones";
						nombreOriginal = prod.original_name;
						nombreCastellano = prod.name;
						idiomaOriginal_id = prod.original_language;
					}
					// TV
					else if (TMDB_entidad == "tv") {
						entidadNombre = "Colección";
						entidad = "colecciones";
						nombreOriginal = prod.original_name;
						nombreCastellano = prod.name;
						idiomaOriginal_id = prod.original_language;
						anoEstreno = parseInt(prod.first_air_date.slice(0, 4));
					}
					// Películas
					else if (TMDB_entidad == "movie") {
						entidadNombre = "Película";
						entidad = "peliculas";
						nombreOriginal = prod.original_title;
						nombreCastellano = prod.title;
						idiomaOriginal_id = prod.original_language;
						anoEstreno = anoFin = parseInt(prod.release_date.slice(0, 4));
					}
					// Define el título sin "distractores", para encontrar duplicados
					let desempate1 = comp.convierteLetras.alIngles(nombreOriginal).replace(/ /g, "").replace(/'/g, "");
					let desempate2 = comp.convierteLetras.alIngles(nombreCastellano).replace(/ /g, "").replace(/'/g, "");
					// Deja sólo algunos campos
					productos.push({
						TMDB_entidad,
						TMDB_id: prod.id,
						nombreOriginal,
						nombreCastellano,
						anoEstreno,
						anoFin,
						idiomaOriginal_id,
						avatar: prod.poster_path,
						entidadNombre,
						entidad,
						sinopsis: prod.overview,
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
								comp.convierteLetras.alIngles(prod.nombreOriginal).includes(palabra) ||
								comp.convierteLetras.alIngles(prod.nombreCastellano).includes(palabra) ||
								comp.convierteLetras.alIngles(prod.sinopsis).includes(palabra)
							) {
								delete prod.sinopsis;
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
		palabrasClave = comp.convierteLetras.alIngles(palabrasClave);
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
						APIsTMDB.search(palabrasClave, TMDB_entidad, pagina)
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
				if (pagina == 1) for (let lote of lotes) acumulador.cantPaginasAPI[lote.TMDB_entidad] = lote.cantPaginasAPI;

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
							n.anoEstreno == registro.anoEstreno
					).length;
				// Procesa duplicados
				if (coincidencias && coincidencias > 1) resultados.productos.splice(indice, 1);
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
			// Obtiene el detalle de las películas
			for (let prod of resultados.productos)
				colecciones.push(prod.entidad == "peliculas" ? APIsTMDB.details("movie", prod.TMDB_id) : "");
			colecciones = await Promise.all(colecciones);
			// Reemplaza las películas de colección por su colección
			colecciones.forEach((coleccion, indice) => {
				// Si no pertenece a una colección, interrumpe
				if (!coleccion || !coleccion.belongs_to_collection) return;
				// Idioma original
				let idiomaOriginal_id = resultados.productos[indice].idiomaOriginal_id;
				idiomaOriginal_id = idiomaOriginal_id ? idiomaOriginal_id : "";
				// Si es una película de colección, cambia sus datos por los de la colección
				resultados.productos[indice] = {
					TMDB_entidad: "collection",
					TMDB_id: coleccion.belongs_to_collection.id,
					nombreOriginal: "",
					nombreCastellano: coleccion.belongs_to_collection.name,
					idiomaOriginal_id,
					avatar: coleccion.belongs_to_collection.poster_path,
					entidadNombre: "Colección",
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
				productos.push(BD_genericas.obtienePorCondicionConInclude(entidad, {TMDB_id}, include));
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
				colecciones.push(prod.TMDB_entidad != "movie" ? APIsTMDB.details(prod.TMDB_entidad, prod.TMDB_id) : "");
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
					let anoEstreno = anos_estreno.length
						? anos_estreno.reduce((a, b) => ((a < b && a != "-") || b == "-" ? a : b))
						: "-";
					let anoFin = anos_estreno.length ? anos_estreno.reduce((a, b) => (a > b ? a : b)) : "-";
					let capitulosID_TMDB = coleccion.parts.map((n) => n.id);
					// Agrega información
					resultados.productos[indice] = {
						...resultados.productos[indice],
						anoEstreno: anoEstreno != "-" ? parseInt(anoEstreno.slice(0, 4)) : "-",
						anoFin: anoFin != "-" ? parseInt(anoFin.slice(0, 4)) : "-",
						capitulos: anos_estreno.length,
						capitulosID_TMDB,
					};
				}
				// Acciones si es una serie de TV
				else if (coleccion.seasons) {
					// OBtiene la cantidad de temporadas
					let cantTemps = coleccion.seasons.filter((n) => n.season_number).length; // mayor a cero
					// Obtiene los capítulos
					let capitulos = coleccion.seasons
						.filter((n) => n.season_number) // mayor a cero
						.map((n) => n.episode_count)
						.reduce((a, b) => a + b, 0);
					// Agrega información
					resultados.productos[indice] = {
						...resultados.productos[indice],
						anoFin: coleccion.last_air_date ? parseInt(coleccion.last_air_date.slice(0, 4)) : "-",
						capitulos,
						cantTemps,
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
				resultados.productos.sort((a, b) => (a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0));
				// Criterio principal: primero la más reciente
				resultados.productos.sort((a, b) => (a.anoFin > b.anoFin ? -1 : a.anoFin < b.anoFin ? 1 : 0));
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
					  (cantN == coincidencias ? ", ninguna" : cantN ? ", de las cuales " + cantN + " no" : ", todas ya")) +
				" está" +
				(cantN > 1 && cantN < coincidencias ? "n" : "") +
				" en nuestra BD.";
			// Fin
			resultados = {prodsNuevos, prodsYaEnBD, mensaje};
		})();

		// Agrega capitulos
		(() => {
			// Si no hay productosYaEnBD, saltea la rutina
			if (!resultados.prodsYaEnBD.length) return;
			// Si no hay productosYaEnBD de colecciones, saltea la rutina
			if (!resultados.prodsYaEnBD.filter((n) => n.entidad == "colecciones").length) return;
			// Rutina
			resultados.prodsYaEnBD.forEach((coleccion) => {
				// Chequea que sea una colección, y que la cantidad de capítulos sea diferente entre TMDB y ELC
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
			await procesos.confirma.agregaUnCap_Colec(coleccion, capituloID_TMDB, indice);
		}
	});
	// Fin
	return;
};
let agregaCapitulosTV = async (coleccion) => {
	// Obtiene los datos de la serieTV
	coleccion = {...coleccion, ...(await BD_genericas.obtienePorId("colecciones", coleccion.id))};
	// Loop de TEMPORADAS
	for (let numTemp = 1; numTemp <= coleccion.cantTemps; numTemp++) {
		// Obtiene los datos de la temporada
		let datosTemp = await APIsTMDB.details(numTemp, coleccion.TMDB_id);
		// Obtiene los ID de los capítulos
		coleccion.capitulosID_TMDB = datosTemp.episodes.map((m) => m.id);
		// Recorre los capítulos TMDB
		for (let capituloID_TMDB of coleccion.capitulosID_TMDB) {
			// Acciones si algún capítulo es nuevo
			if (!coleccion.capitulosID_ELC.includes(String(capituloID_TMDB))) {
				// Amplía la información
				datosTemp = {...datosTemp, ...(await APIsTMDB.credits(numTemp, coleccion.TMDB_id))};
				// Procesa la información
				let episodio = datosTemp.episodes.find((n) => n.id == capituloID_TMDB);
				let datosCap = procesos.confirma.datosCap(coleccion, datosTemp, episodio);
				// Completar datos
				datosCap = {
					...datosCap,
					altaRevisadaPor_id: coleccion.altaRevisadaPor_id,
					altaRevisadaEn: coleccion.altaRevisadaEn,
					statusRegistro_id: coleccion.statusRegistro_id,
				};
				// Guarda el registro
				await BD_genericas.agregaRegistro(datosCap.entidad, datosCap);
			}
		}
	}
	// Fin
	return;
};
