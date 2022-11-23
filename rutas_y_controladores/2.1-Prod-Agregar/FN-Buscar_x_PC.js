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
		palabrasClave = comp.convertirLetrasAlIngles(palabrasClave);
		let lectura = [];
		let datos = {productos: []};
		let entidadesTMDB = ["movie", "collection", "tv"];
		let page = 1;
		while (true) {
			for (let TMDB_entidad of entidadesTMDB) {
				if (page == 1 || page <= datos.cantPaginasAPI[TMDB_entidad]) {
					lectura = await searchTMDB(palabrasClave, TMDB_entidad, page)
						.then((n) => eliminaRegistrosConInfoIncompleta(n, TMDB_entidad))
						.then((n) => estandarizaNombres(n, TMDB_entidad))
						.then((n) => eliminaRegistroSiPalClaNoExiste(n, palabrasClave));
					// Reemplaza películas-capítulo por colecciones, agregándole eliminaRegistrosConInfoIncompleta y estandarizaNombres
					datos = acumulaResultados(lectura, TMDB_entidad, datos, page);
				}
			}
			// Para que no haya más, se tiene que haber superado el máximo en las 3 entidades
			datos.hayMas = hayMas(datos, page, entidadesTMDB);
			if (datos.productos.length >= 20 || !datos.hayMas) break;
			else page++;
		}
		// Le agrega el año de estreno y fin a las colecciones
		datos = await agregaAnoEstrenoFinColecciones(datos);
		// Elimina los registros duplicados
		datos = eliminaDuplicados(datos);
		// Averigua qué registros ya tenemos en nuestra base de datos
		datos = await averiguaSiYaEnBD(datos);
		// Reduce la información
		datos = {
			// Necesarios
			productos: datos.productos,
			hayMas: datos.hayMas,
			// Adicionales
			palabrasClave,
			cantPaginasAPI: datos.cantPaginasAPI,
			cantPaginasUsadas: datos.cantPaginasUsadas,
		};
		// Fin
		return datos;
	},
	ordenaLosProductos: async (datos) => {
		if (datos.productos.length > 1) {
			// Criterio secundario: primero colecciones, luego películas
			datos.productos.sort((a, b) => (a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0));
			// Criterio principal: primero la más reciente
			datos.productos.sort((a, b) =>
				a.desempate3 > b.desempate3 ? -1 : a.desempate3 < b.desempate3 ? 1 : 0
			);
		}
		return datos;
	},
	DS_procesoFinal: (datos) => {
		// Variables
		let prodsNuevos = datos.productos.filter((n) => !n.yaEnBD_id);
		let prodsYaEnBD = datos.productos.filter((n) => n.yaEnBD_id);
		let coincidencias = datos.productos.length;
		let cantN = prodsNuevos && prodsNuevos.length ? prodsNuevos.length : 0;
		let hayMas = datos.hayMas;
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
	},
};

let eliminaRegistrosConInfoIncompleta = (datos, TMDB_entidad) => {
	// Descarta registros con información incompleta
	let productos = [];
	for (let prod of datos.results) {
		let poster = prod.poster_path;
		let lanzam =
			(prod.first_air_date && prod.first_air_date > "1900") ||
			(prod.release_date && prod.release_date > "1900");
		if ((TMDB_entidad == "collection" && poster) || (poster && lanzam)) productos.push(prod);
	}
	// Fin
	return {
		productos,
		cantPaginasAPI: Math.min(datos.total_pages, datos.total_results),
	};
};
let estandarizaNombres = (dato, TMDB_entidad) => {
	let productos = [];
	for (let prod of dato.productos) {
		// Variables
		let prodNombre, entidad, nombre_original, nombre_castellano, ano_estreno, ano_fin, desempate3;
		ano_estreno = ano_fin = desempate3 = "-";
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
			ano_fin = desempate3 = prod.last_air_date ? parseInt(prod.last_air_date.slice(0, 4)) : "-";
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
		let desempate1 = comp.convertirLetrasAlIngles(nombre_original).replace(/ /g, "").replace(/'/g, "");
		let desempate2 = comp.convertirLetrasAlIngles(nombre_castellano).replace(/ /g, "").replace(/'/g, "");
		console.log(TMDB_entidad, desempate1, desempate2, desempate3);
		// Deja sólo algunos campos
		productos.push({
			TMDB_entidad,
			TMDB_id: prod.id,
			nombre_original,
			nombre_castellano,
			idioma_original_id: prod.original_language,
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
	return {productos, cantPaginasAPI: dato.cantPaginasAPI};
};
let eliminaRegistroSiPalClaNoExiste = (dato, palabrasClave) => {
	// Descarta los productos que no tienen ninguna palabra clave
	let palabras = palabrasClave.split(" ");
	//
	let productos = [];
	dato.productos.forEach((prod) => {
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
	return {
		productos,
		cantPaginasAPI: dato.cantPaginasAPI,
	};
};
let acumulaResultados = (lectura, TMDB_entidad, datos, page) => {
	if (page == 1) {
		datos.cantPaginasAPI = {
			...datos.cantPaginasAPI,
			[TMDB_entidad]: lectura.cantPaginasAPI,
		};
	}
	// Unifica productos
	datos.productos.push(...lectura.productos);
	datos.cantPaginasUsadas = {
		...datos.cantPaginasUsadas,
		[TMDB_entidad]: Math.min(page, datos.cantPaginasAPI[TMDB_entidad]),
	};
	return datos;
};
let hayMas = (datos, page, entidadesTMDB) => {
	return (
		page < datos.cantPaginasAPI[entidadesTMDB[0]] ||
		page < datos.cantPaginasAPI[entidadesTMDB[1]] ||
		page < datos.cantPaginasAPI[entidadesTMDB[2]]
	);
};
let eliminaDuplicados = (datos) => {
	for (let indice = datos.productos.length - 1; indice >= 0; indice--) {
		let registro = datos.productos[indice];
		let coincidencias;
		// Averigua duplicados de TV
		if (registro.TMDB_entidad == "tv")
			coincidencias = datos.productos.filter(
				(n) =>
					(n.desempate1 == registro.desempate1 || n.desempate2 == registro.desempate2) &&
					(n.ano_estreno == registro.ano_estreno || n.ano_fin == registro.ano_fin)
			).length;
		// Averigua duplicados de Collections
		if (registro.TMDB_entidad == "collection")
			coincidencias = datos.productos.filter((n) => n.TMDB_id == registro.TMDB_id).length;
		// Elimina duplicados
		if (coincidencias && coincidencias > 1) datos.productos.splice(indice, 1);
		// console.log(
		// 	coincidencias,
		// 	registro.desempate1,
		// 	registro.desempate2,
		// 	registro.desempate3,
		// 	registro.nombre_original,
		// 	registro.nombre_castellano
		// );
	}
	// Fin
	return datos;
};
let averiguaSiYaEnBD = async (datos) => {
	// Rutina por producto
	for (let i = 0; i < datos.productos.length; i++) {
		// Obtiene la entidad
		let TMDB_entidad = datos.productos[i].TMDB_entidad;
		let entidad = TMDB_entidad == "movie" ? "peliculas" : "colecciones";
		// Obtiene el TMDB_id
		let TMDB_id = datos.productos[i].TMDB_id;
		// Busca entre las películas o colecciones
		let include = datos.productos[i].entidad == "colecciones" ? "capitulos" : "";
		let producto = await BD_genericas.obtienePorCamposConInclude(entidad, {TMDB_id}, include);
		// Agrega info
		if (producto) {
			datos.productos[i].yaEnBD_id = producto.id;
			if (datos.productos[i].entidad == "colecciones") datos.capitulos = producto.capitulos.length;
		}
	}
	// Fin
	return datos;
};
let agregaAnoEstrenoFinColecciones = async (datos) => {
	// Rutina
	for (let prod of datos.productos)
		if (prod.TMDB_entidad == "collection") {
			// Obtiene todas las fechas de ano_estreno
			let TMDB_id = prod.TMDB_id;
			let detalles = await detailsTMDB("collection", TMDB_id)
				.then((n) => n.parts)
				.then((n) => n.map((m) => (m.release_date ? m.release_date : "-")));
			// Obtiene el ano_estreno
			let ano_estreno = detalles.reduce((a, b) => (a < b ? a : b));
			let ano_fin = detalles.reduce((a, b) => (a > b && a != "-" ? a : b));

			prod.ano_estreno = prod.desempate3 = ano_estreno != "-" ? parseInt(ano_estreno.slice(0, 4)) : "-";
			prod.ano_fin = ano_fin != "-" ? parseInt(ano_estreno.slice(0, 4)) : "-";
			prod.capitulos = detalles.length;
		}
	// Fin
	return datos;
};
