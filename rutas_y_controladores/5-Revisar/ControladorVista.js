"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/BD/Genericas");
const BD_especificas = require("../../funciones/BD/Especificas");
const especificas = require("../../funciones/Varias/Especificas");

module.exports = {
	visionGeneral: async (req, res) => {
		// Tema y Código
		let tema = "revision";
		let codigo = "visionGeneral";
		// Definir variables
		let status = await BD_genericas.obtenerTodos("status_registro_ent", "orden");
		let revisar = status.filter((n) => !n.revisado).map((n) => n.id);
		let userID = req.session.usuario.id;
		let haceUnaHora = especificas.haceUnaHora();
		// Obtener productos ------------------------------------------------------------
		let productos = await BD_especificas.obtenerProductos(haceUnaHora, revisar, userID);
		// Obtener las ediciones en status 'edicion' --> PENDIENTE
		// Consolidar productos y ordenar
		productos = procesar(productos);
		// Obtener RCLV -----------------------------------------------------------------
		// Obtener Links ----------------------------------------------------------------
		let links = await BD_especificas.obtenerLinks(haceUnaHora, revisar, userID);
		// Obtener los productos de los links
		let aprobado = status.filter((n) => n.aprobado).map((n) => n.id);
		let prodsLinks = productosLinks(links, aprobado);
		// Ir a la vista ----------------------------------------------------------------
		//return res.send(productos);
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Revisar - Visión General",
			productos,
			RCLVs: [],
			prodsLinks,
			status,
		});
	},

	producto: async (req, res) => {
		// Tema y Código
		let tema = "revision";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.indexOf("/"));
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Obtener los datos ORIGINALES y EDITADOS del producto
		let [prodOriginal, prodEditado] = await BD_especificas.obtenerVersionesDeProducto(
			entidad,
			prodID,
			userID
		);
		// Obtener avatar
		let imagen = prodEditado.avatar;
		let avatar = imagen ? "/imagenes/3-ProdRevisar/" + imagen : "/imagenes/8-Agregar/IM.jpg";
		// Obtener los países
		let paises = prodOriginal.paises_id ? await especificas.paises_idToNombre(prodOriginal.paises_id) : "";
		// Configurar el título de la vista
		let entidadNombre = especificas.entidadNombre(entidad);
		let titulo = "Revisión de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;
		// Info exclusiva para la vista de Edicion
		let BD_paises = await BD_genericas.obtenerTodos("paises", "nombre");
		let BD_idiomas = await BD_genericas.obtenerTodos("idiomas", "nombre");
		let tiempo = prodEditado.editado_en
			? Math.max(0, parseInt((prodEditado.editado_en - new Date() + 1000 * 60 * 60) / 1000 / 60))
			: false;
		// Ir a la vista
		//return res.send(prodCombinado)
		return res.render("0-Revisar", {
			tema,
			codigo,
			titulo,
			entidad,
			prodID,
			prodOriginal,
			prodEditado,
			avatar,
			paises,
			BD_paises,
			BD_idiomas,
			tiempo,
			vista: req.baseUrl + req.path,
		});
	},
};

// Funciones ------------------------------------------------------------------------------
let procesar = (productos) => {
	// Procesar los registros
	let anchoMax = 30;
	// Reconvertir los elementos
	productos = productos.map((registro) => {
		let nombre =
			(registro.nombre_castellano.length > anchoMax
				? registro.nombre_castellano.slice(0, anchoMax - 1) + "…"
				: registro.nombre_castellano) +
			" (" +
			registro.ano_estreno +
			")";
		return {
			id: registro.id,
			entidad: registro.entidad,
			nombre: nombre,
			ano_estreno: registro.ano_estreno,
			abrev: registro.entidad.slice(0, 3).toUpperCase(),
			status_registro_id: registro.status_registro_id,
			fecha: registro.creado_en,
		};
	});
	// Ordenar los elementos por fecha
	productos.sort((a, b) => {
		return new Date(a.fecha) - new Date(b.fecha);
	});
	// Fin
	return productos;
};
let rclvCreado = (array, creado_id) => {
	// Creado, con productos aprobados
	return array.length ? array.filter((n) => n.status_registro.pend_aprobar && n.cant_prod_aprobados) : [];
};
let rclvSinProds = (array, creado_id, aprobado_id) => {
	// Status 'activo', sin productos creados, sin productos aprobados
	return array.length
		? array.filter((n) => !n.status_registro.inactivos && !n.cant_prod_creados && !n.cant_prod_aprobados)
		: [];
};
let productosLinks = (links, aprobado) => {
	// Resultado esperado:
	//	- Solo productos aprobados
	//	- Campos: {abrev, entidad, id, ano_estreno,}

	// Definir las  variables
	let prods = [];
	let auxs = [
		{nombre: "pelicula", entidad: "peliculas"},
		{nombre: "coleccion", entidad: "colecciones"},
		{nombre: "capitulo", entidad: "capitulos"},
	];
	// Rutina para cada link
	for (let link of links) {
		// Verificación para cada Producto
		for (let aux of auxs) {
			if (
				link[aux.nombre] &&
				aprobado.includes(link[aux.nombre].status_registro_id) &&
				prods.findIndex((n) => n.entidad == aux.entidad && n.id == link[aux.nombre].id) < 0
			)
				prods.push({
					entidad: aux.entidad,
					id: link[aux.nombre].id,
					nombre: link[aux.nombre].nombre_castellano,
					ano_estreno: link[aux.nombre].ano_estreno,
					abrev: aux.nombre.slice(0, 3).toUpperCase(),
				});
		}
	}
	return prods;
};

// includes = ["peliculas", "colecciones", "capitulos"];
// let personajes = await BD_especificas.obtenerRCLV(
// 	"RCLV_personajes",
// 	includes,
// 	haceUnaHora,
// 	aprobInact,
// 	userID
// );
// let hechos = await BD_especificas.obtenerRCLV(
// 	"RCLV_hechos",
// 	includes,
// 	haceUnaHora,
// 	aprobInact,
// 	userID
// );
// let valores = await BD_especificas.obtenerRCLV(
// 	"RCLV_valores",
// 	includes,
// 	haceUnaHora,
// 	aprobInact,
// 	userID
// );
// let RCLV = [...personajes, ...hechos, ...valores];
// // Obtener los RCLV en sus variantes a mostrar
// let RCLV_creado = rclvCreado(RCLV, status.creado_id);
// let RCLV_sinProds = rclvSinProds(RCLV, status.creado_id, status.aprobado_id);
// RCLVs = [...RCLV_creado, ...RCLV_sinProds];