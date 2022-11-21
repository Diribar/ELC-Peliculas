"use strict";
// Definir variables
const searchTMDB = require("../../funciones/1-APIs_TMDB/1-Search");
const detailsTMDB = require("../../funciones/1-APIs_TMDB/2-Details");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// ControllerAPI (cantProductos)
	// ControllerVista (palabrasClaveGuardar)
	search: async (palabrasClave, mostrar) => {
		palabrasClave = comp.convertirLetrasAlIngles(palabrasClave);
		let lectura = [];
		let datos = {productos: []};
		let entidadesTMDB = ["movie", "collection", "tv"];
		let page = 1;
		while (true) {
			for (let TMDB_entidad of entidadesTMDB) {
				if (page == 1 || page <= datos.cantPaginasAPI[TMDB_entidad]) {
					lectura = await searchTMDB(palabrasClave, TMDB_entidad, page)
						.then((n) => infoQueQueda(n))
						.then((n) => estandarizaNombres(n, TMDB_entidad))
						.then((n) => eliminaSiPCinexistente(n, palabrasClave))
						.then((n) => eliminaIncompletos(n));
					// if (TMDB_entidad == "collection" && lectura.productos.length && mostrar)
					// 	lectura.productos = await agregaAnoEstreno(lectura.productos);
					datos = unificaResultados(lectura, TMDB_entidad, datos, page);
				}
			}
			// Para que no haya más, se tiene que haber superado el máximo en las 3 entidades
			datos.hayMas = hayMas(datos, page, entidadesTMDB);
			if (datos.productos.length >= 20 || !datos.hayMas) break;
			else page++;
		}
		// Elimina los registros duplicados
		datos = eliminaDuplicados(datos);
		// Averigua qué registros tenemos en nuestra base de datos
		datos = await averiguaSiYaEnBD(datos);
		// Ordena los datos
		if (mostrar) {
			datos = ordenaDatos(datos);
			datos = reduceInfo(datos);
		}
		// Fin
		return datos;
	},
};

let infoQueQueda = (datos) => {
	return {
		productos: datos.results,
		cantPaginasAPI: Math.min(datos.total_pages, datos.total_results),
	};
};
let estandarizaNombres = (dato, TMDB_entidad) => {
	let productos = dato.productos.map((m) => {
		let prodNombre, entidad, ano_estreno, nombre_original, nombre_castellano, desempate3;
		// Estandarizar los nombres
		if (TMDB_entidad == "collection")
			if (typeof m.poster_path != "undefined" && m.poster_path != null) {
				prodNombre = "Colección";
				entidad = "colecciones";
				ano_estreno = "-";
				nombre_original = m.original_name;
				nombre_castellano = m.name;
				desempate3 = "-";
			} else return;
		if (TMDB_entidad == "tv")
			if (
				typeof m.first_air_date != "undefined" &&
				typeof m.poster_path != "undefined" &&
				m.first_air_date &&
				m.first_air_date > "1900" &&
				m.poster_path
			) {
				prodNombre = "Colección";
				entidad = "colecciones";
				ano_estreno = parseInt(m.first_air_date.slice(0, 4));
				nombre_original = m.original_name;
				nombre_castellano = m.name;
				desempate3 = m.first_air_date;
			} else return;
		if (TMDB_entidad == "movie")
			if (
				typeof m.release_date != "undefined" &&
				typeof m.poster_path != "undefined" &&
				m.release_date &&
				m.release_date > "1900" &&
				m.poster_path
			) {
				prodNombre = "Película";
				entidad = "peliculas";
				ano_estreno = parseInt(m.release_date.slice(0, 4));
				nombre_original = m.original_title;
				nombre_castellano = m.title;
				desempate3 = m.release_date;
			} else return;
		// Definir el título sin "distractores", para encontrar duplicados
		let desempate1 = comp.convertirLetrasAlIngles(nombre_original).replace(/ /g, "").replace(/'/g, "");
		let desempate2 = comp.convertirLetrasAlIngles(nombre_castellano).replace(/ /g, "").replace(/'/g, "");
		// Deja sólo algunos campos
		return {
			prodNombre,
			entidad,
			TMDB_entidad,
			TMDB_id: m.id,
			nombre_original,
			nombre_castellano,
			idioma_original_id: m.original_language,
			ano_estreno,
			avatar: m.poster_path,
			comentario: m.overview,
			desempate1,
			desempate2,
			desempate3,
		};
	});
	return {
		productos,
		cantPaginasAPI: dato.cantPaginasAPI,
	};
};
let eliminaSiPCinexistente = (dato, palabrasClave) => {
	// Descarta los productos que no tienen ninguna palabra clave
	let palabras = palabrasClave.split(" ");
	let productos = dato.productos.map((prod) => {
		if (prod)
			for (let palabra of palabras)
				if (
					comp.convertirLetrasAlIngles(prod.nombre_original).includes(palabra) ||
					comp.convertirLetrasAlIngles(prod.nombre_castellano).includes(palabra) ||
					comp.convertirLetrasAlIngles(prod.comentario).includes(palabra)
				)
					return prod;
		// Fin
		return;
	});
	// Fin
	return {
		productos,
		cantPaginasAPI: dato.cantPaginasAPI,
	};
};
let eliminaIncompletos = (dato) => {
	for (let indice = dato.productos.length - 1; indice >= 0; indice--) {
		if (dato.productos[indice] == null) dato.productos.splice(indice, 1);
	}
	return dato;
};
let agregaAnoEstreno = async (dato) => {
	for (let i = 0; i < dato.length; i++) {
		// Obtiene todas las fechas de ano_estreno
		let TMDB_id = dato[i].TMDB_id;
		let detalles = await detailsTMDB("collection", TMDB_id)
			.then((n) => n.parts)
			.then((n) => n.map((m) => (m.release_date ? m.release_date : "-")));
		// Obtiene el ano_estreno
		let ano = detalles.reduce((a, b) => (a < b ? a : b));
		dato[i].ano_estreno = dato[i].desempate3 = ano != "-" ? parseInt(ano.slice(0, 4)) : "-";
		dato[i].capitulos = detalles.length;
	}
	return dato;
};
let unificaResultados = (lectura, TMDB_entidad, datos, page) => {
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
let eliminaDuplicados = (datos) => {
	for (let indice = datos.productos.length - 1; indice >= 0; indice--) {
		let resultado = datos.productos[indice];
		if (resultado.TMDB_entidad == "tv") {
			let coincidencias = datos.productos.filter(
				(n) =>
					(n.desempate1 == resultado.desempate1 || n.desempate2 == resultado.desempate2) &&
					n.desempate3 == resultado.desempate3
			).length;
			if (coincidencias > 1) datos.productos.splice(indice, 1);
		}
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
		let yaEnBD_id = await BD_especificas.obtieneELC_id(entidad, {TMDB_id});
		// Si no lo encuentra y la entidad es 'peliculas', busca también entre los capítulos, porque el 'search' de las películas no avisa si pertenece a una colección
		if (!yaEnBD_id && entidad == "peliculas") {
			let capitulo = await BD_genericas.obtienePorId("capitulos", yaEnBD_id);
			// Si lo encuentra, le corrije la entidad, y le asigna datos adicionales
			if (capitulo) {
				yaEnBD_id = capitulo.id;
				let coleccion = await BD_genericas.obtienePorId("colecciones", capitulo.coleccion_id);
				datos.productos[i].entidad = "capitulos";
				datos.productos[i].prodNombre = 'Capítulo de Colección "' + coleccion.nombre_castellano + '"';
			}
		}
		datos.productos[i] = {
			...datos.productos[i],
			yaEnBD_id,
		};
	}
	return datos;
};
let hayMas = (datos, page, entidadesTMDB) => {
	return (
		page < datos.cantPaginasAPI[entidadesTMDB[0]] ||
		page < datos.cantPaginasAPI[entidadesTMDB[1]] ||
		page < datos.cantPaginasAPI[entidadesTMDB[2]]
	);
};
let ordenaDatos = (datos) => {
	if (datos.productos.length > 1) {
		// Ordenar desde la más reciente hacia la más antigua
		datos.productos.sort((a, b) =>
			a.desempate3 > b.desempate3 ? -1 : a.desempate3 < b.desempate3 ? 1 : 0
		);
		// Ordenar primero por colecciones y luego por películas
		datos.productos.sort((a, b) => (a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0));
	}
	return datos;
};
let reduceInfo=(datos)=>{
	return {
		
	}
}