"use strict";
// Variables
const APIsTMDB = require("../../funciones/2-Procesos/APIsTMDB");
const procesos = require("./PA-FN4-Procesos");
const procsCRUD = require("../2.0-Familias/FM-Procesos");

module.exports = {
	// ControllerAPI (cantProductos)
	search: async (palabrasClave) => {
		// Variables
		palabrasClave = comp.letras.convierteAlIngles(palabrasClave);
		let entidadesTMDB = ["collection", "tv", "movie"];
		let resultados = {productos: [], cantPaginasAPI: {}, cantPaginasUsadas: {}};
		let pagina = 0;

		// Obtiene información de las API
		while (true) {
			// Variables
			pagina++;
			let prodsPorEnts = [];

			// Rutina por entidad de productos
			for (let entidadTMDB of entidadesTMDB) {
				// Realiza la rutina pareja para las 3 entidades TMDB, avanzando de a una página en c/u
				const paginasPorEntidadTMDB = resultados.cantPaginasAPI[entidadTMDB];
				const condicion =
					pagina == 1 || // es la primera rutina
					pagina <= paginasPorEntidadTMDB; // es menor o igual al máximo
				if (condicion) {
					const prodsPorEnt = APIsTMDB.search(palabrasClave, entidadTMDB, pagina).then((n) =>
						FN.procesaInfoDeAPI(n, entidadTMDB, palabrasClave)
					);
					prodsPorEnts.push(prodsPorEnt);
				}
			}
			prodsPorEnts = await Promise.all(prodsPorEnts); // obtiene un elemento o nada, por cada TMDB_entidad

			// En la primera rutina, obtiene la cantPaginasAPI por entidad
			if (pagina == 1)
				for (let prodsPorEnt of prodsPorEnts)
					resultados.cantPaginasAPI[prodsPorEnt.TMDB_entidad] = prodsPorEnt.cantPaginasAPI;

			// Rutina por TMDB_entidad para consolidar los productos
			for (let prodsPorEnt of prodsPorEnts) {
				if (prodsPorEnt.productos.length) resultados.productos.push(...prodsPorEnt.productos); // agrega los nuevos resultados a los resultados anteriores
				resultados.cantPaginasUsadas[prodsPorEnt.TMDB_entidad] = pagina;
			}

			// Averigua si hay más productos para 'Search' - para que no haya más, se tiene que haber superado el máximo en las 3 entidades
			resultados.hayMas = false;
			for (let entidadTMDB of entidadesTMDB)
				if (!resultados.hayMas) resultados.hayMas = pagina < resultados.cantPaginasAPI[entidadTMDB];

			// Se fija si no hay que buscar más
			if (resultados.productos.length >= 20 || !resultados.hayMas) break;
		}

		// Elimina los registros duplicados de TV
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

		// Fin
		return resultados;
	},
	reemplazoDePeliPorColeccion: async (productos) => {
		// Funciones
		let reemplazaSiCorresponde = async () => {
			// Variables
			let posiblesColecs = [];
			let contador = 0;

			// Obtiene el detalle de las películas
			for (let producto of productos) {
				// Agrega la info de detalle
				const detalles = producto.entidad == "peliculas" ? APIsTMDB.details("movie", producto.TMDB_id) : null;
				posiblesColecs.push(detalles);

				// Si corresponde, hace una pausa - es necesario para que no se trabe la API
				if (detalles) contador++;
				if (!(contador % 4)) posiblesColecs = await Promise.all(posiblesColecs);
			}
			posiblesColecs = await Promise.all(posiblesColecs);

			// Reemplaza las películas de colección por su colección
			posiblesColecs.forEach((posibleColec, indice) => {
				// Si no pertenece a una colección, interrumpe
				if (!posibleColec || !posibleColec.belongs_to_collection) return;

				// Idioma original
				let {idiomaOriginal_id} = productos[indice];
				idiomaOriginal_id = idiomaOriginal_id ? idiomaOriginal_id.toUpperCase() : "";

				// Cambia sus datos por los de la colección
				productos[indice] = {
					TMDB_entidad: "collection",
					TMDB_id: posibleColec.belongs_to_collection.id,
					nombreOriginal: "",
					nombreCastellano: posibleColec.belongs_to_collection.name,
					idiomaOriginal_id,
					avatar: posibleColec.belongs_to_collection.poster_path,
					entidadNombre: "Colección",
					entidad: "colecciones",
				};
			});

			// Fin
			return;
		};
		let eliminaDuplicados = () => {
			// Variables
			let resultados = [];
			for (let producto of productos)
				if (!resultados.find((n) => n.TMDB_entidad == producto.TMDB_entidad && n.TMDB_id == producto.TMDB_id))
					resultados.push(producto);

			// Fin
			productos = resultados;
			return;
		};

		// Revisa y reemplaza las películas por su colección
		await reemplazaSiCorresponde();

		// Elimina los registros duplicados
		eliminaDuplicados();

		// Fin
		return productos;
	},
	organizaLaInfo: async ({productos, hayMas}) => {
		// Variables
		let prodsNuevos = [];
		let prodsYaEnBD = [];
		let mensaje;

		// Funciones
		let agregaInfoDetalleParaColeccionesDesdeAPI = async () => {
			// Variables
			let colecciones = [];

			// Obtiene las colecciones/series que se necesitan
			for (let producto of productos)
				colecciones.push(
					producto.TMDB_entidad != "movie" ? APIsTMDB.details(producto.TMDB_entidad, producto.TMDB_id) : null
				);

			colecciones = await Promise.all(colecciones);

			// Completa los campos
			colecciones.forEach((coleccion, indice) => {
				// Interrumpe si no es una colección
				if (!coleccion) return;

				// Acciones si es una collección
				if (coleccion.parts) {
					// Variables para colecciones
					const anosEstreno = coleccion.parts.map((n) => (n.release_date ? n.release_date : "-"));
					const anoEstreno = anosEstreno.length
						? anosEstreno.reduce((a, b) => ((a < b && a != "-") || b == "-" ? a : b))
						: "-";
					const anoFin = anosEstreno.length ? anosEstreno.reduce((a, b) => (a > b ? a : b)) : "-";
					const TMDB_ids_vTMDB = coleccion.parts.map((n) => String(n.id));
					const cantCaps_vTMDB = coleccion.parts.length;

					// Agrega información
					productos[indice] = {
						...productos[indice],
						anoEstreno: anoEstreno != "-" ? parseInt(anoEstreno.slice(0, 4)) : "-",
						anoFin: anoFin != "-" ? parseInt(anoFin.slice(0, 4)) : "-",
						TMDB_ids_vTMDB,
						cantCaps_vTMDB,
					};
				}

				// Acciones si es una serie de TV
				else if (coleccion.seasons) {
					// Obtiene la cantidad de temporadas
					const cantTemps = coleccion.seasons.filter((n) => n.season_number).length; // temporada mayor a cero

					// Obtiene la cantidad de capítulos
					const cantCaps_vTMDB = coleccion.seasons
						.filter((n) => n.season_number) // mayor a cero
						.map((n) => n.episode_count)
						.reduce((a, b) => a + b, 0);

					// Agrega información
					productos[indice] = {
						...productos[indice],
						anoFin: coleccion.last_air_date ? parseInt(coleccion.last_air_date.slice(0, 4)) : "-",
						cantCaps_vTMDB,
						cantTemps,
					};
					if (coleccion.episode_run_time && coleccion.episode_run_time.length == 1)
						productos[indice].duracion = coleccion.episode_run_time[0];
				}

				// Si no existen detalles, limpia la colección (puede pasar, ejs de ids: 1107666, 499356)
				else productos[indice] = null;
			});

			// Elimina las colecciones sin información de detalle
			productos = productos.filter((n) => !!n);

			// Fin
			return;
		};
		let ordenaLosProds = () => {
			// Criterio secundario: primero colecciones, luego películas
			productos.sort((a, b) => (a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0));
			// Criterio principal: primero la más reciente
			productos.sort((a, b) => (a.anoFin > b.anoFin ? -1 : a.anoFin < b.anoFin ? 1 : 0));

			// Fin
			return;
		};
		let agregaInfoDesdeBD = async () => {
			// Obtiene las películas y colecciones
			const peliculas = productos.filter((n) => n.entidad == "peliculas").length
				? BD_genericas.obtieneTodos("peliculas")
				: [];
			const colecciones = productos.filter((n) => n.entidad == "colecciones").length
				? BD_genericas.obtieneTodosConInclude("colecciones", "capitulos")
				: [];
			const prodsBD = await Promise.all([peliculas, colecciones]).then(([peliculas, colecciones]) => [
				...peliculas,
				...colecciones,
			]);

			// Agrega info de la BD
			for (let producto of productos) {
				// Variables
				const {TMDB_id} = producto;
				const prodBD = prodsBD.find((n) => n.TMDB_id == TMDB_id); // busca entre los productos de la BD

				// prodYaEnBD
				if (prodBD) {
					// Le asigna valores de nuestra BD
					producto.id = prodBD.id;
					producto.avatar = prodBD.avatar;
					if (producto.entidad == "colecciones") {
						producto.statusColeccion_id = prodBD.statusRegistro_id;
						producto.TMDB_ids_vELC = prodBD.capitulos.map((n) => n.TMDB_id);
					}
					prodsYaEnBD.push(producto);
				}
				// prodNuevo
				else prodsNuevos.push(producto);
			}

			// Fin
			return;
		};
		let mensajeFN = () => {
			// Variables
			const coincidencias = productos.length;
			const cantNuevos = prodsNuevos && prodsNuevos.length ? prodsNuevos.length : 0;

			// Obtiene el mensaje
			mensaje =
				"Encontramos " +
				(coincidencias == 1
					? "una sola coincidencia, que " + (cantNuevos == 1 ? "no" : "ya")
					: (hayMas ? "muchas" : coincidencias) +
					  " coincidencias" +
					  (hayMas ? ". Te mostramos " + coincidencias : "") +
					  (cantNuevos == coincidencias
							? ", ninguna"
							: cantNuevos
							? ", de las cuales " + cantNuevos + " no"
							: ", todas ya")) +
				" está" +
				(cantNuevos > 1 && cantNuevos < coincidencias ? "n" : "") +
				" en nuestra BD.";

			// Fin
			return;
		};
		let agregaCapitulos = () => {
			// Si no hay productosYaEnBD de colecciones, saltea la rutina
			if (!prodsYaEnBD.filter((n) => n.entidad == "colecciones").length) return;

			// Chequea si la cantidad de capítulos es diferente entre TMDB y ELC - no hace falta el 'await'
			for (let coleccion of prodsYaEnBD) {
				// Si no es una colección, saltea la rutina
				if (coleccion.entidad != "colecciones") continue;

				// Si son distintos, los actualiza en la BD de ELC
				const sonLosMismos = FN.sonLosMismosCaps[coleccion.TMDB_entidad](coleccion);
				if (!sonLosMismos) {
					if (coleccion.TMDB_entidad == "collection") FN.agregaQuitaCapsCollection(coleccion); // sin 'await'
					if (coleccion.TMDB_entidad == "tv") FN.agregaCapsTV(coleccion); // sin 'await'
				}
			}

			// Fin
			return;
		};

		// Consultando la API, le agrega info a las colecciones y series de tv
		if (productos.length) await agregaInfoDetalleParaColeccionesDesdeAPI();

		// Ordena los productos
		if (productos.length > 1) ordenaLosProds();

		// Averigua qué registros ya tenemos en nuestra base de datos y agrega info
		if (productos.length) await agregaInfoDesdeBD();

		// Genera la info en el formato '{prodsNuevos, prodsYaEnBD, mensaje}'
		mensajeFN();

		// Agrega capitulos
		if (prodsYaEnBD && prodsYaEnBD.length) agregaCapitulos();

		// Fin
		return {prodsNuevos, prodsYaEnBD, mensaje};
	},
};

// Funciones
let FN = {
	procesaInfoDeAPI: (prodsPorEnt, TMDB_entidad, palabrasClave) => {
		// Funciones
		let descartaRegistrosIncompletos = () => {
			// Variables
			let productos = [];
			for (let producto of prodsPorEnt.results) {
				const poster = producto.poster_path;
				const lanzam =
					(producto.first_air_date && producto.first_air_date > "1900") ||
					(producto.release_date && producto.release_date > "1900");
				if (poster && (TMDB_entidad == "collection" || lanzam)) productos.push(producto);
			}

			// Consolida la información
			prodsPorEnt = {
				TMDB_entidad,
				productos,
				cantPaginasAPI: Math.min(prodsPorEnt.total_pages, prodsPorEnt.total_results),
			};

			// Fin
			return;
		};
		let estandarizaNombres = () => {
			// Variables
			let productos = [];

			// Estandariza nombres y deja sólo algunos campos
			for (let producto of prodsPorEnt.productos) {
				// Variables
				let entidadNombre, entidad, nombreOriginal, nombreCastellano, idiomaOriginal_id;
				let anoEstreno = "";
				let anoFin = "";

				// Películas
				if (TMDB_entidad == "movie") {
					entidadNombre = "Película";
					entidad = "peliculas";
					nombreOriginal = producto.original_title;
					nombreCastellano = producto.title;
					idiomaOriginal_id = producto.original_language;
					anoEstreno = anoFin = parseInt(producto.release_date.slice(0, 4));
				}

				// Colecciones
				else if (TMDB_entidad == "collection") {
					entidadNombre = "Colección";
					entidad = "colecciones";
					nombreOriginal = producto.original_name;
					nombreCastellano = producto.name;
					idiomaOriginal_id = producto.original_language;
				}

				// TV
				else if (TMDB_entidad == "tv") {
					entidadNombre = "Colección";
					entidad = "colecciones";
					nombreOriginal = producto.original_name;
					nombreCastellano = producto.name;
					idiomaOriginal_id = producto.original_language;
					anoEstreno = parseInt(producto.first_air_date.slice(0, 4));
				}

				// Define el título sin "distractores", para encontrar duplicados
				let desempate1 = comp.letras.convierteAlIngles(nombreOriginal).replace(/ /g, "").replace(/'/g, "");
				let desempate2 = comp.letras.convierteAlIngles(nombreCastellano).replace(/ /g, "").replace(/'/g, "");

				// Deja sólo algunos campos
				if (idiomaOriginal_id) idiomaOriginal_id = idiomaOriginal_id.toUpperCase();
				const resultado = {
					...{entidad, entidadNombre, TMDB_entidad, TMDB_id: producto.id, desempate1, desempate2},
					...{nombreOriginal, nombreCastellano, idiomaOriginal_id, anoEstreno, anoFin},
					...{avatar: producto.poster_path},
				};
				productos.push(resultado);
			}

			// Fin
			prodsPorEnt.productos = productos;
			return;
		};
		let descartaProdsSinPalabraClave = () => {
			// Variables
			let palabras = palabrasClave.split(" ");
			let productos = [];

			// Conserva los productos con al menos una palabra clave
			for (let producto of prodsPorEnt.productos) {
				for (let palabra of palabras) {
					// Variables
					let nombreOriginal = producto.nombreOriginal;
					let nombreCastellano = producto.nombreCastellano;
					let sinopsis = producto.sinopsis;

					// Averigua si alguno tiene la palabra clave
					nombreOriginal = nombreOriginal && comp.letras.convierteAlIngles(nombreOriginal).includes(palabra);
					nombreCastellano = nombreCastellano && comp.letras.convierteAlIngles(nombreCastellano).includes(palabra);
					sinopsis = sinopsis && comp.letras.convierteAlIngles(sinopsis).includes(palabra);

					// Conserva el producto si se cumple alguna condición
					if (nombreOriginal || nombreCastellano || sinopsis) {
						productos.push(producto);
						break;
					}
				}
			}

			// Fin
			prodsPorEnt.productos = productos;
			return;
		};

		// Descarta registros con información incompleta
		descartaRegistrosIncompletos();

		// Estandariza nombres
		estandarizaNombres();

		// Descarta los productos que no tienen ninguna palabra clave
		descartaProdsSinPalabraClave();

		// Fin
		return prodsPorEnt;
	},
	sonLosMismosCaps: {
		collection: (coleccion) => {
			// Variables
			let {TMDB_ids_vTMDB, TMDB_ids_vELC} = coleccion;
			let sonLosMismos = TMDB_ids_vTMDB.length == TMDB_ids_vELC.length;

			if (sonLosMismos) {
				// Ordena los ids
				TMDB_ids_vTMDB.sort((a, b) => (a < b ? -1 : 1));
				TMDB_ids_vELC.sort((a, b) => (a < b ? -1 : 1));

				// Compara cada elemento
				var i = TMDB_ids_vTMDB.length;
				while (i--)
					if (TMDB_ids_vTMDB[i] !== TMDB_ids_vELC[i]) {
						sonLosMismos = false;
						return;
					}
			}

			// Fin
			return sonLosMismos;
		},
		tv: (coleccion) => {
			// Variables
			const {cantCaps_vTMDB, TMDB_ids_vELC} = coleccion;
			const cantCaps_vELC = TMDB_ids_vELC.length;

			// Fin
			return cantCaps_vTMDB == cantCaps_vELC;
		},
	},
	agregaQuitaCapsCollection: async (coleccion) => {
		// Variables
		const capitulosELC = await BD_genericas.obtieneTodosPorCondicion("capitulos", {coleccion_id: coleccion.id});

		// Recorre los capítulos ELC y si algún capítulo no existe en TMDB y está inactivo en ELC, lo elimina
		for (let capituloELC of capitulosELC)
			if (!coleccion.TMDB_ids_vTMDB.includes(capituloELC.TMDB_id) && capituloELC.statusRegistro_id == inactivo_id) {
				await procsCRUD.eliminar.eliminaDependientes("capitulos", capituloELC.id, capituloELC);
				BD_genericas.eliminaPorId("capitulos", capituloELC.id);
			}

		// Recorre los capítulos TMDB y si algún capítulo es nuevo, lo agrega
		coleccion.TMDB_ids_vTMDB.forEach(async (TMDB_id_vTMDB, indice) => {
			if (!coleccion.TMDB_ids_vELC.includes(TMDB_id_vTMDB))
				procesos.confirma.agregaUnCap_Colec(coleccion, TMDB_id_vTMDB, indice);
		});

		// Fin
		return;
	},
	agregaCapsTV: async (coleccion) => {
		// Obtiene los datos de la serieTV
		coleccion = {...coleccion, ...(await BD_genericas.obtienePorId("colecciones", coleccion.id))};

		// Loop de TEMPORADAS
		for (let numTemp = 1; numTemp <= coleccion.cantTemps; numTemp++) {
			// Obtiene los datos de la temporada y los ID de los capítulos
			let datosTemp = await APIsTMDB.details(numTemp, coleccion.TMDB_id);
			coleccion.TMDB_ids_vTMDB = datosTemp.episodes.map((m) => String(m.id));

			// Acciones si algún capítulo es nuevo
			for (let TMDB_id_vTMDB of coleccion.TMDB_ids_vTMDB)
				if (!coleccion.TMDB_ids_vELC.includes(TMDB_id_vTMDB)) {
					// Procesa la información
					datosTemp = {...datosTemp, ...(await APIsTMDB.credits(numTemp, coleccion.TMDB_id))};
					const episodio = datosTemp.episodes.find((n) => n.id == TMDB_id_vTMDB);

					// Completa los datos
					const datosCap = {
						...procesos.confirma.datosCap(coleccion, datosTemp, episodio),
						statusColeccion_id: coleccion.statusRegistro_id ? coleccion.statusRegistro_id : creado_id,
					};

					// Guarda el registro
					await BD_genericas.agregaRegistro(datosCap.entidad, datosCap);
				}
		}

		// Fin
		return;
	},
};
