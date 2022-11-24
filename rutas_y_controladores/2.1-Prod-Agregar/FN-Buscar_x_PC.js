"use strict";
// Definir variables
const searchTMDB = require("../../funciones/1-APIs_TMDB/1-Search");
const detailsTMDB = require("../../funciones/1-APIs_TMDB/2-Details");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");

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
						ano_estreno,
						ano_fin,
						desempate3;
					ano_estreno = ano_fin = desempate3 = "";
					// Colecciones
					if (TMDB_entidad == "collection") {
						prodNombre = "Colección";
						entidad = "colecciones";
						nombre_original = prod.original_name;
						nombre_castellano = prod.name;
					}
					// TV
					else if (TMDB_entidad == "tv") {
						prodNombre = "Colección";
						entidad = "colecciones";
						nombre_original = prod.original_name;
						nombre_castellano = prod.name;
						ano_estreno = parseInt(prod.first_air_date.slice(0, 4));
					}
					// Películas
					else if (TMDB_entidad == "movie") {
						prodNombre = "Película";
						entidad = "peliculas";
						nombre_original = prod.original_title;
						nombre_castellano = prod.title;
						ano_estreno = ano_fin = desempate3 = parseInt(prod.release_date.slice(0, 4));
					}
					// Define el título sin "distractores", para encontrar duplicados
					let desempate1 = comp
						.convertirLetrasAlIngles(nombre_original)
						.replace(/ /g, "")
						.replace(/'/g, "");
					let desempate2 = comp
						.convertirLetrasAlIngles(nombre_castellano)
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
						avatar: prod.poster_path,
						prodNombre,
						entidad,
						comentario: prod.overview,
						desempate1,
						desempate2,
						desempate3,
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
								comp.convertirLetrasAlIngles(prod.nombre_original).includes(palabra) ||
								comp.convertirLetrasAlIngles(prod.nombre_castellano).includes(palabra) ||
								comp.convertirLetrasAlIngles(prod.comentario).includes(palabra)
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
		palabrasClave = comp.convertirLetrasAlIngles(palabrasClave);
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
			// Acumula los lotes
			lotes = await Promise.all(lotes);
			acumulador = acumulaResultados(lotes, acumulador, pagina);

			// Para que no haya más, se tiene que haber superado el máximo en las 3 entidades
			acumulador.hayMas = (() => {
				return (
					pagina < acumulador.cantPaginasAPI[entidadesTMDB[0]] ||
					pagina < acumulador.cantPaginasAPI[entidadesTMDB[1]] ||
					pagina < acumulador.cantPaginasAPI[entidadesTMDB[2]]
				);
			})();

			// Se fija si no hay que buscar más
			if (acumulador.productos.length >= 20 || !acumulador.hayMas) break;
		}
		// Procesos por única vez
		let resultados = acumulador;
		// Elimina los registros duplicados
		(() => {
			for (let indice = resultados.productos.length - 1; indice >= 0; indice--) {
				let registro = resultados.productos[indice];
				let coincidencias;
				// Averigua duplicados de TV (principalmente con 'movie')
				if (registro.TMDB_entidad == "tv")
					coincidencias = resultados.productos.filter(
						(n) =>
							(n.desempate1 == registro.desempate1 || n.desempate2 == registro.desempate2) &&
							n.ano_estreno == registro.ano_estreno
					).length;
				// Elimina duplicados
				if (coincidencias && coincidencias > 1) resultados.productos.splice(indice, 1);
			}
		})();
		// Agrega el método de palabrasClave
		resultados.palabrasClave = palabrasClave;
		// Fin
		return resultados;
	},

	revisaReemplazaPeliPorColeccion: async (resultados) => {
		let valorI = new Date();
		// Revisa y reemplaza las películas por su colección
		resultados = await revisaReemplazaPeliPorColeccion(resultados);
		// Fin
		let valorF = new Date();
		console.log(valorF - valorI);
		return resultados;
	},

	organizaLaInformacion: async (resultados) => {
		// Le agrega el año de estreno y fin a las colecciones
		resultados = await completaDatosColecciones(resultados);
		// Ordena los productos
		resultados = ordenaLosProductos(resultados);
		// Genera la info en el formato '{prodsNuevos, prodsYaEnBD, mensaje}'
		resultados = formatoFrontEnd(resultados);
		// Fin
		return resultados;
	},
};

// Proceso por lote de productos
let acumulaResultados = (lotes, acumulador, pagina) => {
	// Unifica cantPaginasAPI
	if (pagina == 1)
		for (let lote of lotes) acumulador.cantPaginasAPI[lote.TMDB_entidad] = lote.cantPaginasAPI;

	// Unifica productos
	for (let lote of lotes) {
		acumulador.productos.push(...lote.productos);
		acumulador.cantPaginasUsadas[lote.TMDB_entidad] = Math.min(
			pagina,
			acumulador.cantPaginasAPI[lote.TMDB_entidad]
		);
	}

	// Fin
	return acumulador;
};
// Procesos por página
// Procesos por única vez
let averiguaSiYaEnBD = async (resultados) => {
	// Variables
	let productos = [];
	// Obtiene los registros de la BD
	for (let prod of resultados.productos) {
		// Obtiene la entidad
		let TMDB_entidad = prod.TMDB_entidad;
		let entidad = TMDB_entidad == "movie" ? "peliculas" : "colecciones";
		// Obtiene el TMDB_id
		let TMDB_id = prod.TMDB_id;
		// Busca entre las películas o colecciones
		let include = prod.entidad == "colecciones" ? "capitulos" : "";
		productos.push(BD_genericas.obtienePorCamposConInclude(entidad, {TMDB_id}, include));
	}
	// Agrega info de la BD
	productos = await Promise.all(productos);
	resultados.productos.forEach((prod, indice) => {
		// Obtiene el producto de nuestra BD
		let producto = productos[indice];
		// Le asigna valores de nuestra BD
		if (producto) {
			prod.yaEnBD_id = producto.id;
			if (prod.entidad == "colecciones") prod.capitulos = producto.capitulos.length;
		}
	});

	// Fin
	return resultados;
};
let revisaReemplazaPeliPorColeccion = async (lote, acumulador) => {
	// Variables
	let productos = [];
	// Rutina para el lote de productos
	for (let prod of lote.productos) {
		// Si la entidad no es una película, sigue al siguiente producto
		if (prod.entidad != "peliculas") {
			productos.push(prod);
			continue;
		}

		// Acciones si es una película -------------------------
		// Obtiene los datos de la película
		let pelicula = await detailsTMDB("movie", prod.TMDB_id);
		// Si la película no pertenece a una colección, sigue al siguiente producto
		if (!pelicula.belongs_to_collection) {
			productos.push(prod);
			continue;
		}

		// Acciones si es una película de colección -----------
		// Datos de la colección a la que pertenece
		let coleccion = {
			TMDB_entidad: "collection",
			TMDB_id: pelicula.belongs_to_collection.id,
			nombre_castellano: pelicula.belongs_to_collection.name,
			avatar: pelicula.belongs_to_collection.poster_path,
			prodNombre: "Colección",
			entidad: "colecciones",
		};
		productos.push(coleccion);
	}

	// Fin
	lote.productos = productos;
	return lote;
};
// Organiza la informacion
let completaDatosColecciones = async (resultados) => {
	// Rutina
	for (let prod of resultados.productos)
		if (prod.TMDB_entidad == "collection") {
			// Obtiene todas las fechas de ano_estreno
			let TMDB_id = prod.TMDB_id;
			let detalles = await detailsTMDB("collection", TMDB_id)
				.then((n) => n.parts)
				.then((n) => n.map((m) => (m.release_date ? m.release_date : "-")));
			// Obtiene el ano_estreno y fin
			let ano_estreno = detalles.reduce((a, b) => (a < b ? a : b));
			let ano_fin = detalles.reduce((a, b) => (a > b && a != "-" ? a : b));
			// Aporta las novedades a resultados
			prod.ano_estreno = prod.desempate3 = ano_estreno != "-" ? parseInt(ano_estreno.slice(0, 4)) : "-";
			prod.ano_fin = ano_fin != "-" ? parseInt(ano_fin.slice(0, 4)) : "-";
			prod.capitulos = detalles.length;
		}
	// Fin
	return resultados;
};
let ordenaLosProductos = (resultados) => {
	if (resultados.productos.length > 1) {
		// Criterio secundario: primero colecciones, luego películas
		resultados.productos.sort((a, b) => (a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0));
		// Criterio principal: primero la más reciente
		resultados.productos.sort((a, b) =>
			a.desempate3 > b.desempate3 ? -1 : a.desempate3 < b.desempate3 ? 1 : 0
		);
	}
	// Fin
	return resultados;
};
let formatoFrontEnd = (resultados) => {
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
	return {prodsNuevos, prodsYaEnBD, mensaje};
};
let actualizaCapitulos = () => {};
