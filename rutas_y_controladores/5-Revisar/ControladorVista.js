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
		// Averiguar si el usuario tiene otras capturas y en ese caso redirigir
		let userID = req.session.usuario.id;
		let prodCapturado = await BD_especificas.revisaSiTieneOtrasCapturas("", "", userID);
		if (prodCapturado)
			return res.redirect(
				"/revision/redireccionar/?entidad=" + prodCapturado.entidad + "&id=" + prodCapturado.id
			);
		// Definir variables
		let status = await BD_genericas.obtenerTodos("status_registro_ent", "orden");
		let revisar = status.filter((n) => !n.revisado).map((n) => n.id);
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

	redireccionar: async (req, res) => {
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		// Obtener el producto
		let producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID);
		// Obtener la familia
		let destino = especificas.familiaEnSingular(entidad);
		// Obtener la sub-dirección de destino
		if (destino == "producto")
			destino += producto.status_registro.creado
				? "/perfil"
				: producto.status_registro.inactivos
				? "/inactivos"
				: "/edicion";
		return res.redirect("/revision/" + destino + "/?entidad=" + entidad + "&id=" + prodID);
	},

	productoPerfil: async (req, res) => {
		// Tema y Código
		let tema = "revision";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.lastIndexOf("/"));
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		let includes;
		// Obtener los datos ORIGINALES del producto
		includes = ["status_registro"];
		let producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
		if (!producto.status_registro.creado)
			return res.redirect("/revision/redireccionar/?entidad=" + entidad + "&id=" + prodID);
		// Obtener los datos del usuario
		includes = ["status_registro"];
		let usuarioCreador = await BD_genericas.obtenerPorIdConInclude("usuarios", prodID, includes);
		// Obtener avatar original
		let avatar = producto.avatar
			? (producto.avatar.slice(0, 4) != "http" ? "/imagenes/3-ProdRevisar/" : "") + producto.avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// Configurar el título de la vista
		let productoNombre = especificas.productoNombre(entidad);
		let titulo = "Revisión - Perfil de" + (entidad == "capitulos" ? "l " : " la ") + productoNombre;
		// Info para la vista
		let reloj = Math.max(
			0,
			parseInt((producto.capturado_en - especificas.ahora() + 1000 * 60 * 60) / 1000 / 60)
		);
		// Ir a la vista
		//return res.send(producto)
		return res.render("0-Revisar", {
			tema,
			codigo,
			titulo,
			entidad,
			producto,
			usuarioCreador,
			avatar,
			reloj,
			vista: req.baseUrl + req.path,
		});
	},

	productoEditado: async (req, res) => {
		// Obtener avatar editado
		let avatarEditado = prodEditado.avatar
			? "/imagenes/3-ProdRevisar/" + prodEditado.avatar
			: "/imagenes/8-Agregar/IM.jpg";

		// Obtener avatar original
		let avatarOriginal = prodOriginal.avatar
			? (prodOriginal.avatar.slice(0, 4) != "http"
					? prodOriginal.status_registro.pend_aprobar
						? "/imagenes/3-ProdRevisar/"
						: "/imagenes/2-Productos/"
					: "") + prodOriginal.avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// Obtener los países
		let paises = prodOriginal.paises_id
			? await especificas.paises_idToNombre(prodOriginal.paises_id)
			: "";
		// Info exclusiva para la vista de Edicion
		let BD_paises = await BD_genericas.obtenerTodos("paises", "nombre");
		let BD_idiomas = await BD_genericas.obtenerTodos("idiomas", "nombre");
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
