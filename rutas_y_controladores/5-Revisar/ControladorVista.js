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
		let prodCapturado = await BD_especificas.buscaAlgunaCapturaVigenteDelUsuario("", "", userID);
		if (prodCapturado)
			return res.redirect(
				"/revision/redireccionar/?entidad=" + prodCapturado.entidad + "&id=" + prodCapturado.id
			);
		// Definir variables
		let status = await BD_genericas.obtenerTodos("status_registro", "orden");
		let revisar = status.filter((n) => !n.gr_revisados).map((n) => n.id);
		let haceUnaHora = especificas.haceUnaHora();
		// Obtener productos ------------------------------------------------------------
		let productos = await BD_especificas.obtenerProductosARevisar(haceUnaHora, revisar, userID);
		//return res.send(productos.map(n=> {return [n.nombre_castellano,n.status_registro]}));
		// Obtener las ediciones en status 'edicion' --> PENDIENTE
		// let ediciones=await BD_especificas.obtenerEdicionesARevisar();
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
		// Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let edicID = req.query.edicion_id;
		let userID = req.session.usuario.id;
		let destino = especificas.familiaEnSingular(entidad);
		let datosEdicion = "";
		// Obtener el producto
		let producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "status_registro");
		// Obtener la sub-dirección de destino
		if (destino == "producto") {
			let subDestino = producto.status_registro.creado
				? "/perfil"
				: producto.status_registro.gr_inactivos
				? "/inactivos"
				: "/edicion";
			destino += subDestino;
			if (subDestino == "/edicion") {
				if (!edicID) {
					// Obtener el id de la edición
					let producto_id = especificas.entidad_id(entidad);
					edicID = await BD_especificas.obtenerEdicionAjena("elc_" + producto_id, prodID, userID);
				}
				if (edicID) datosEdicion = "&edicion_id=" + edicID;
			}
		}
		return res.redirect("/revision/" + destino + "/?entidad=" + entidad + "&id=" + prodID + datosEdicion);
	},

	productoPerfil: async (req, res) => {
		// 1. Tema y Código
		let tema = "revision";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.lastIndexOf("/"));
		// 2. Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		// 3. Redirigir hacia la colección
		if (entidad == "capitulos") {
			// Liberar la captura del capítulo
			let datos = {capturado_por_id: null, capturado_en: null, captura_activa: null};
			BD_genericas.actualizarPorId("capitulos", prodID, datos);
			// Obtener el ID de la colección
			let producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "coleccion");
			let colecID = producto.coleccion.id;
			// Redireccionar a la colección
			return res.redirect("/revision/redireccionar/?entidad=colecciones&id=" + colecID);
		}
		// 4. Obtener los datos ORIGINALES del producto
		let includes = ["status_registro"];
		let producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
		if (!producto.status_registro.creado)
			return res.redirect("/revision/redireccionar/?entidad=" + entidad + "&id=" + prodID);
		// 5. Obtener datos del usuario
		let fichaDelUsuario = await BD_especificas.fichaDelUsuario(entidad, prodID);
		// 6. Obtener avatar original
		let avatar = producto.avatar
			? (producto.avatar.slice(0, 4) != "http" ? "/imagenes/3-ProdRevisar/" : "") + producto.avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// 7. Configurar el título de la vista
		let productoNombre = especificas.entidadNombre(entidad);
		let titulo = "Revisión - Perfil de" + (entidad == "capitulos" ? "l " : " la ") + productoNombre;
		// 9.. Obtener los países
		let paises = producto.paises_id ? await especificas.paises_idToNombre(producto.paises_id) : "";
		// Info para la vista
		let [bloqueIzq, bloqueDer] = funcionBloques(producto, paises, fichaDelUsuario);
		let motivosInactivar = await BD_genericas.obtenerTodos("motivos_para_borrar", "orden").then((n) =>
			n.filter((m) => m.prod)
		);
		// 10. Ir a la vista
		//return res.send(producto)
		return res.render("0-Revisar", {
			tema,
			codigo,
			titulo,
			entidad,
			producto,
			avatar,
			vista: req.baseUrl + req.path,
			bloqueIzq,
			bloqueDer,
			motivosInactivar,
		});
	},

	productoEdicion: async (req, res) => {
		// 1. Tema y Código
		let tema = "revision";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.lastIndexOf("/"));
		// 2. Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let edicID = req.query.edicion_id;
		if (!edicID) return res.redirect("/revision/redireccionar/?entidad=" + entidad + "&id=" + prodID);
		let producto_id = await especificas.entidad_id(entidad);
		let edicion_id, vista, avatar;
		// Obtener ambas versiones
		let prodOriginal = await BD_genericas.obtenerPorId(entidad, prodID);
		let prodEditado = await BD_genericas.obtenerPorId("productos_edic", edicID);
		// Averiguar si está editado el avatar
		if (prodEditado.avatar) {
			// Vista 'Edición-Avatar'
			vista = "2-Prod2-Edicion1Avatar";
			// Ruta y nombre del archivo 'avatar'
			avatar = {
				original: prodOriginal.avatar
					? (prodOriginal.avatar.slice(0, 4) != "http"
							? prodOriginal.status_registro.gr_pend_aprob
								? "/imagenes/3-ProdRevisar/"
								: "/imagenes/2-Productos/"
							: "") + prodOriginal.avatar
					: "/imagenes/8-Agregar/IM.jpg",
				edicion: "/imagenes/3-ProdRevisar/" + prodEditado.avatar,
			};
		} else {
			// Vista 'Edición-Avatar'
			vista = "2-Prod2-Edicion2Datos";
			// Obtener el avatar
			let imagen = prodOriginal.avatar;
			avatar = imagen
				? (imagen.slice(0, 4) != "http" ? "/imagenes/2-Productos/" : "") + imagen
				: "/imagenes/8-Agregar/IM.jpg";
			// Quitar los campos con valor 'null'
			for (let campo in prodEditado) if (prodEditado[campo] === null) delete prodEditado[campo];
			// Quitar los campos que no se deben comparar
			edicion_id = prodEditado.id;
			delete prodEditado.id;
			delete prodEditado["elc_" + producto_id];
			// Quitar de edición las igualdades
			for (let campo in prodEditado) {
				if (prodOriginal[campo] === prodEditado[campo]) delete prodEditado[campo];
			}
		}
		// 7. Configurar el título de la vista
		let productoNombre = especificas.entidadNombre(entidad);
		let titulo = "Revisión - Edición de" + (entidad == "capitulos" ? "l " : " la ") + productoNombre;
		// Enviar las diferencias a la vista
		return res.render(vista, {
			tema,
			codigo,
			titulo,
			prodOriginal,
			prodEditado,
			edicion_id,
			avatar,
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
	// Fin
	return productos;
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
let funcionBloques = (producto, paises, fichaDelUsuario) => {
	// Bloque izquierdo
	let [bloque1, bloque2, bloque3] = [[], [], []];
	// Bloque 1
	if (paises) bloque1.push({titulo: "País" + (paises.includes(",") ? "es" : ""), valor: paises});
	if (producto.idioma_original)
		bloque1.push({titulo: "Idioma original", valor: producto.idioma_original.nombre});
	// Bloque 2
	if (producto.direccion) bloque2.push({titulo: "Dirección", valor: producto.direccion});
	if (producto.guion) bloque2.push({titulo: "Guión", valor: producto.guion});
	if (producto.musica) bloque2.push({titulo: "Música", valor: producto.musica});
	if (producto.produccion) bloque2.push({titulo: "Producción", valor: producto.produccion});
	// Bloque 3
	if (producto.actuacion) bloque3.push({titulo: "Actuación", valor: producto.actuacion});
	// Bloque izquierdo consolidado
	let izquierda = [bloque1, bloque2, bloque3];
	// Bloque derecho
	[bloque1, bloque2] = [[], []];
	// Bloque 1
	if (producto.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: producto.ano_estreno});
	if (producto.ano_fin) bloque1.push({titulo: "Año de fin", valor: producto.ano_fin});
	if (producto.duracion) bloque1.push({titulo: "Duracion", valor: producto.duracion + " min."});
	// Bloque derecho consolidado
	let derecha = [bloque1, fichaDelUsuario];
	return [izquierda, derecha];
};

// let rclvCreado = (array, creado_id) => {
// 	// Creado, con productos aprobados
// 	return array.length ? array.filter((n) => n.status_registro.gr_pend_aprob && n.cant_prod_aprobados) : [];
// };
// let rclvSinProds = (array, creado_id, aprobado_id) => {
// 	// Status 'activo', sin productos creados, sin productos aprobados
// 	return array.length
// 		? array.filter((n) => !n.status_registro.gr_inactivos && !n.cant_prod_creados && !n.cant_prod_aprobados)
// 		: [];
// };
// includes = ["peliculas", "colecciones", "capitulos"];
// let personajes = await BD_especificas.obtenerRCLVaRevisar(
// 	"RCLV_personajes",
// 	includes,
// 	haceUnaHora,
// 	aprobInact,
// 	userID
// );
// let hechos = await BD_especificas.obtenerRCLVaRevisar(
// 	"RCLV_hechos",
// 	includes,
// 	haceUnaHora,
// 	aprobInact,
// 	userID
// );
// let valores = await BD_especificas.obtenerRCLVaRevisar(
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
