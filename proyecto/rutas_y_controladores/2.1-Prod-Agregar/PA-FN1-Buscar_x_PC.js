"use strict";
// Definir variables
const APIsTMDB = require("../../funciones/2-Procesos/APIsTMDB");
const procesos = require("./PA-FN4-Procesos");

module.exports = {
	// ControllerAPI (cantProductos)
	search: async (palabrasClave) => {
		// Variables
		palabrasClave = comp.convierteLetras.alIngles(palabrasClave);
		let entidadesTMDB = ["collection", "tv", "movie"];
		let resultados = {productos: [], cantPaginasAPI: {}, cantPaginasUsadas: {}};
		let pagina = 0;

		// Obtiene información de las API
		while (true) {
			// Variables
			pagina++;
			let prodsPorEnts = [];

			// Rutina por entidad de productos
			for (let TMDB_entidad of entidadesTMDB)
				if (pagina == 1 || pagina <= resultados.cantPaginasAPI[TMDB_entidad]) {
					const prodsPorEnt = APIsTMDB.search(palabrasClave, TMDB_entidad, pagina).then((n) =>
						procesaInfoDeAPI(n, TMDB_entidad, palabrasClave)
					);
					prodsPorEnts.push(prodsPorEnt);
				}
			prodsPorEnts = await Promise.all(prodsPorEnts);

			// Obtiene la cantPaginasAPI por entidad
			if (pagina == 1)
				for (let prodsPorEnt of prodsPorEnts)
					resultados.cantPaginasAPI[prodsPorEnt.TMDB_entidad] = prodsPorEnt.cantPaginasAPI;

			// Consolida los productos
			for (let prodsPorEnt of prodsPorEnts) {
				resultados.productos.push(...prodsPorEnt.productos);
				resultados.cantPaginasUsadas[prodsPorEnt.TMDB_entidad] = pagina;
			}

			// Averigua si hay más productos para 'Search' - para que no haya más, se tiene que haber superado el máximo en las 3 entidades
			resultados.hayMas =
				pagina < resultados.cantPaginasAPI[entidadesTMDB[0]] ||
				pagina < resultados.cantPaginasAPI[entidadesTMDB[1]] ||
				pagina < resultados.cantPaginasAPI[entidadesTMDB[2]];

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

		// Agrega el método de palabrasClave
		resultados.palabrasClave = palabrasClave;

		// Fin
		return resultados;
	},
	reemplazoDePeliPorColeccion: async (resultados) => {
		// Funciones
		let reemplazaSiCorresponde = async () => {
			// Variables
			let colecciones = [];
			let contador = 0;

			// Obtiene el detalle de las películas
			for (let prod of resultados.productos) {
				const detalles = prod.entidad == "peliculas" ? APIsTMDB.details("movie", prod.TMDB_id) : "";
				if (detalles) contador++;
				colecciones.push(detalles);
				if (!(contador % 4)) colecciones = await Promise.all(colecciones); // es necesario para que no se trabe la API
			}
			colecciones = await Promise.all(colecciones);

			// Reemplaza las películas de colección por su colección
			colecciones.forEach((pelicula, indice) => {
				// Si no pertenece a una colección, interrumpe
				if (!pelicula || !pelicula.belongs_to_collection) return;

				// Idioma original
				let idiomaOriginal_id = resultados.productos[indice].idiomaOriginal_id;
				idiomaOriginal_id = idiomaOriginal_id ? idiomaOriginal_id.toUpperCase() : "";

				// Si es una película de colección, cambia sus datos por los de la colección
				resultados.productos[indice] = {
					TMDB_entidad: "collection",
					TMDB_id: pelicula.belongs_to_collection.id,
					nombreOriginal: "",
					nombreCastellano: pelicula.belongs_to_collection.name,
					idiomaOriginal_id,
					avatar: pelicula.belongs_to_collection.poster_path,
					entidadNombre: "Colección",
					entidad: "colecciones",
				};
			});

			// Fin
			return;
		};
		let eliminaDuplicados = () => {
			// Variables
			let productos = [];
			for (let producto of resultados.productos)
				if (!productos.find((n) => n.TMDB_entidad == producto.TMDB_entidad && n.TMDB_id == producto.TMDB_id))
					productos.push(producto);

			// Fin
			resultados.productos = productos;
			return;
		};
		let agregaInfo = async () => {
			// Variables
			let productos = [];

			// Obtiene los registros de la BD
			for (let producto of resultados.productos) {
				// Variables
				const {TMDB_entidad, TMDB_id} = producto;
				const entidad = TMDB_entidad == "movie" ? "peliculas" : "colecciones";
				const include = producto.entidad == "colecciones" ? "capitulos" : "";

				// Busca entre las películas o colecciones
				productos.push(BD_genericas.obtienePorCondicionConInclude(entidad, {TMDB_id}, include));
			}
			productos = await Promise.all(productos);

			// Agrega info de la BD
			productos.forEach((prod, indice) => {
				if (!prod) return;

				// Le asigna valores de nuestra BD
				resultados.productos[indice].id = prod.id;
				resultados.productos[indice].avatar = prod.avatar;

				// Específicos para colecciones
				if (resultados.productos[indice].entidad == "colecciones") {
					resultados.productos[indice].statusColeccion_id = prod.statusRegistro_id;
					resultados.productos[indice].cantCapsELC = prod.capitulos.length;
					resultados.productos[indice].TMDB_ids_versionELC = prod.capitulos.map((n) => n.TMDB_id);
				}
			});

			// Fin
			return;
		};

		// Revisa y reemplaza las películas por su colección
		await reemplazaSiCorresponde();

		// Elimina los registros duplicados
		eliminaDuplicados();

		// Averigua qué registros ya tenemos en nuestra base de datos y agrega info
		await agregaInfo();

		// Fin
		return resultados;
	},
	organizaLaInformacion: async (resultados) => {
		// Funciones
		let agregaInfo = async () => {
			// Variables
			let colecciones = [];

			// Obtiene las colecciones/series que se necesitan
			for (let prod of resultados.productos)
				colecciones.push(prod.TMDB_entidad != "movie" ? APIsTMDB.details(prod.TMDB_entidad, prod.TMDB_id) : null);

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
					const capsTMDB_id = coleccion.parts.map((n) => n.id);

					// Agrega información
					resultados.productos[indice] = {
						...resultados.productos[indice],
						anoEstreno: anoEstreno != "-" ? parseInt(anoEstreno.slice(0, 4)) : "-",
						anoFin: anoFin != "-" ? parseInt(anoFin.slice(0, 4)) : "-",
						cantCapsTMDB: coleccion.parts.length,
						capsTMDB_id,
					};
				}

				// Acciones si es una serie de TV
				else if (coleccion.seasons) {
					// Obtiene la cantidad de temporadas
					const cantTemps = coleccion.seasons.filter((n) => n.season_number).length; // mayor a cero

					// Obtiene la cantidad de capítulos
					const cantCapsTMDB = coleccion.seasons
						.filter((n) => n.season_number) // mayor a cero
						.map((n) => n.episode_count)
						.reduce((a, b) => a + b, 0);

					// Agrega información
					resultados.productos[indice] = {
						...resultados.productos[indice],
						anoFin: coleccion.last_air_date ? parseInt(coleccion.last_air_date.slice(0, 4)) : "-",
						cantCapsTMDB,
						cantTemps,
					};
					if (coleccion.episode_run_time && coleccion.episode_run_time.length == 1)
						resultados.productos[indice].duracion = coleccion.episode_run_time[0];
				}

				// Si no existen detalles, limpia el producto (puede pasar, ejs de ids: 1107666, 499356)
				else resultados.productos[indice] = null;
			});

			// Elimina los productos sin información
			resultados.productos = resultados.productos.filter((n) => !!n);

			// Fin
			return;
		};
		let ordenaLosProds = () => {
			if (resultados.productos.length > 1) {
				// Criterio secundario: primero colecciones, luego películas
				resultados.productos.sort((a, b) => (a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0));
				// Criterio principal: primero la más reciente
				resultados.productos.sort((a, b) => (a.anoFin > b.anoFin ? -1 : a.anoFin < b.anoFin ? 1 : 0));
			}

			// Fin
			return;
		};
		let agrupaPorNuevosYaEnBD = () => {
			// Variables
			const prodsNuevos = resultados.productos.filter((n) => !n.id);
			const prodsYaEnBD = resultados.productos.filter((n) => n.id);
			const coincidencias = resultados.productos.length;
			const cantN = prodsNuevos && prodsNuevos.length ? prodsNuevos.length : 0;
			const hayMas = resultados.hayMas;

			// Obtiene el mensaje
			const mensaje =
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
			// Consolida la información
			resultados = {prodsNuevos, prodsYaEnBD, mensaje};

			// Fin
			return;
		};
		let agregaCapitulos = () => {
			// Si no hay productosYaEnBD de colecciones, saltea la rutina
			const {prodsYaEnBD} = resultados;
			if (!prodsYaEnBD.length || !prodsYaEnBD.filter((n) => n.entidad == "colecciones").length) return;

			// Chequea que sea una colección, y que la cantidad de capítulos sea diferente entre TMDB y ELC - no hace falta el 'await'
			for (let coleccion of prodsYaEnBD)
				if (coleccion.cantCapsTMDB && coleccion.cantCapsTMDB > coleccion.cantCapsELC) {
					if (coleccion.TMDB_entidad == "collection") agregaCapitulosCollection(coleccion); // sin 'await'
					if (coleccion.TMDB_entidad == "tv") agregaCapitulosTV(coleccion); // sin 'await'
				}

			// Fin
			return;
		};
		let agregaCapitulosCollection = async (coleccion) => {
			// Recorre los capítulos
			await coleccion.capsTMDB_id.forEach(async (capTMDB_id, indice) => {
				// Si algún capítulo es nuevo, lo agrega
				if (!coleccion.TMDB_ids_versionELC.includes(String(capTMDB_id)))
					await procesos.confirma.agregaUnCap_Colec(coleccion, capTMDB_id, indice);
			});

			// Fin
			return;
		};
		let agregaCapitulosTV = async (coleccion) => {
			// Obtiene los datos de la serieTV
			coleccion = {...coleccion, ...(await BD_genericas.obtienePorId("colecciones", coleccion.id))};

			// Loop de TEMPORADAS
			for (let numTemp = 1; numTemp <= coleccion.cantTemps; numTemp++) {
				// Obtiene los datos de la temporada y los ID de los capítulos
				let datosTemp = await APIsTMDB.details(numTemp, coleccion.TMDB_id);
				coleccion.capsTMDB_id = datosTemp.episodes.map((m) => m.id);

				// Acciones si algún capítulo es nuevo
				for (let TMDB_id_versionTMDB of coleccion.capsTMDB_id)
					if (!coleccion.TMDB_ids_versionELC.includes(String(TMDB_id_versionTMDB))) {
						// Procesa la información
						datosTemp = {...datosTemp, ...(await APIsTMDB.credits(numTemp, coleccion.TMDB_id))};
						const episodio = datosTemp.episodes.find((n) => n.id == TMDB_id_versionTMDB);

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
		};

		// Consultando la API, le agrega info a las colecciones y series de tv
		await agregaInfo();

		// Ordena los productos
		ordenaLosProds();

		// Genera la info en el formato '{prodsNuevos, prodsYaEnBD, mensaje}'
		agrupaPorNuevosYaEnBD();

		// Agrega capitulos
		agregaCapitulos();

		// Fin
		return resultados;
	},
};

// Funciones
let procesaInfoDeAPI = (prodsPorEnt, TMDB_entidad, palabrasClave) => {
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
			let desempate1 = comp.convierteLetras.alIngles(nombreOriginal).replace(/ /g, "").replace(/'/g, "");
			let desempate2 = comp.convierteLetras.alIngles(nombreCastellano).replace(/ /g, "").replace(/'/g, "");

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
				nombreOriginal = nombreOriginal && comp.convierteLetras.alIngles(nombreOriginal).includes(palabra);
				nombreCastellano = nombreCastellano && comp.convierteLetras.alIngles(nombreCastellano).includes(palabra);
				sinopsis = sinopsis && comp.convierteLetras.alIngles(sinopsis).includes(palabra);

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
};
