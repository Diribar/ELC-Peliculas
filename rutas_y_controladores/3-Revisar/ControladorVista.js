"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesar = require("../../funciones/3-Procesos/4-Revisar");

module.exports = {
	// Uso general
	tableroControl: async (req, res) => {
		// Tema y Código
		let tema = "revision";
		let codigo = "tableroControl";
		let userID = req.session.usuario.id;
		// Definir variables
		const status = req.session.status_registro;
		const aprobado_id = status.find((n) => n.aprobado).id;
		const ahora = funciones.ahora();
		// Productos y Ediciones
		let productos;
		productos = await procesar.tablero_obtenerProds(ahora, status, userID); //
		productos.ED = await procesar.tablero_obtenerProdsConEdic(ahora, status, userID); //
		// Obtener Links
		productos.LK = await procesar.tablero_obtenerProdsConLink(ahora, status, userID); //
		productos = procesar.prod_ProcesarCampos(productos);
		// RCLV
		let RCLVs = await procesar.tablero_obtenerRCLVs(ahora, status, userID); //
		RCLVs = procesar.RCLV_ProcesarCampos(RCLVs);
		// Ir a la vista
		// return res.send([productos,RCLVs]);
		return res.render("0-Estructura-Gral", {
			tema,
			codigo,
			titulo: "Revisar - Tablero de Control",
			productos,
			RCLVs,
		});
	},
	// Productos
	prod_Alta: async (req, res) => {
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
			return res.redirect("/revision/producto/alta/?entidad=colecciones&id=" + colecID);
		}
		// 4. Obtener los datos ORIGINALES del producto
		let includes = ["status_registro"];
		if (entidad == "capitulos") includes.push("coleccion");
		if (entidad == "colecciones") includes.push("capitulos");
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
		if (!prodOriginal.status_registro.creado) return res.redirect("/revision/tablero-de-control");
		// 5. Obtener avatar original
		let avatar = prodOriginal.avatar
			? (prodOriginal.avatar.slice(0, 4) != "http" ? "/imagenes/3-ProdRevisar/" : "") +
			  prodOriginal.avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// 6. Configurar el título de la vista
		let prodNombre = funciones.obtenerEntidadNombre(entidad);
		let titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// 7. Obtener los países
		let paises = prodOriginal.paises_id ? await funciones.paises_idToNombre(prodOriginal.paises_id) : "";
		// 8. Info para la vista
		let [bloqueIzq, bloqueDer] = await procesar.prod_BloquesAlta(prodOriginal, paises);
		let motivosRechazo = await BD_genericas.obtenerTodos("altas_motivos_rech", "orden").then((n) =>
			n.filter((m) => m.prod)
		);
		// Ir a la vista
		//return res.send(prodOriginal)
		return res.render("0-Revisar", {
			tema,
			codigo,
			titulo,
			entidad,
			id: prodID,
			prodOriginal,
			avatar,
			bloqueIzq,
			bloqueDer,
			motivosRechazo,
			prodNombre,
		});
	},
	prod_Edicion: async (req, res) => {
		// 1. Tema y Código
		const tema = "revision";
		const codigo = "producto/edicion";
		// 2. Variables
		const entidad = req.query.entidad;
		const prodID = req.query.id;
		const userID = req.session.usuario.id;
		const producto_id = funciones.obtenerEntidad_id(entidad);
		let edicID = req.query.edicion_id;

		// VERIFICACION1: Si no existe edicID...
		if (!edicID) {
			edicID = await BD_especificas.obtenerEdicionAjena("prods_edicion", producto_id, prodID, userID);
			if (!edicID) {
				let informacion = await infoProdEdicion(producto_id, prodID, userID);
				return res.render("Errores", {informacion});
			} else return res.redirect(req.originalUrl + "&edicion_id=" + edicID); // Recargar la vista con el ID de la edición
		}
		// return res.send(req.query);
		// Definir más variables
		let motivos = await BD_genericas.obtenerTodos("edic_motivos_rech", "orden");
		let vista, avatar, ingresos, reemplazos, quedanCampos, bloqueDer;
		// 3. Obtener ambas versiones
		let includesEdic = [
			"en_castellano",
			"en_color",
			"idioma_original",
			"categoria",
			"subcategoria",
			"publico_sugerido",
			"personaje",
			"hecho",
			"valor",
		];
		let includesOrig = [...includesEdic, "status_registro"];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includesOrig);
		let prodEditado = await BD_genericas.obtenerPorIdConInclude("prods_edicion", edicID, includesEdic);
		// VERIFICACION2: si la edición no se corresponde con el producto --> redirecciona
		if (!prodEditado || !prodEditado[producto_id] || prodEditado[producto_id] != prodID)
			return res.redirect("/inactivar-captura/?destino=tablero&entidad=" + entidad + "&id=" + prodID);
		// VERIFICACION3: si no quedan campos de 'edicion' por procesar --> lo avisa
		// La consulta también tiene otros efectos:
		// 1. Elimina el registro de edición si ya no tiene más datos
		// 2. Actualiza el status del registro original, si corresponde
		[quedanCampos, prodEditado] = await procesar.prod_QuedanCampos(prodOriginal, prodEditado);
		if (!quedanCampos) {
			let informacion = {
				mensajes: ["La edición fue borrada porque no tenía novedades respecto al original"],
				iconos: [
					{
						nombre: "fa-spell-check",
						link: "/revision/tablero-de-control",
						titulo: "Ir al 'Tablero de Control' de Revisiones",
					},
				],
			};
			return res.render("Errores", {informacion});
		}
		// 4. Acciones dependiendo de si está editado el avatar
		if (prodEditado.avatar) {
			// Vista 'Edición-Avatar'
			vista = "2-Prod-EdicAvatar";
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
			motivos = motivos.filter((m) => m.avatar);
		} else {
			// Obtener los ingresos y reemplazos
			[ingresos, reemplazos] = procesar.prod_ArmarComparac(prodOriginal, prodEditado);
			// Obtener el avatar
			let imagen = prodOriginal.avatar;
			avatar = imagen
				? (imagen.slice(0, 4) != "http" ? "/imagenes/2-Productos/" : "") + imagen
				: "/imagenes/8-Agregar/IM.jpg";
			// Variables
			motivos = motivos.filter((m) => m.prod);
			bloqueDer = await procesar.prod_BloqueEdic(prodOriginal, prodEditado);
			vista = "0-Revisar";
		}
		// 7. Configurar el título de la vista
		let prodNombre = funciones.obtenerEntidadNombre(entidad);
		let titulo = "Revisar la Edición de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Ir a la vista
		return res.send([prodOriginal, prodEditado]);
		return res.render(vista, {
			tema,
			codigo,
			titulo,
			prodOriginal,
			prodEditado,
			ingresos,
			reemplazos,
			avatar,
			motivos,
			entidad,
			id: prodID,
			bloqueDer,
			prodNombre,
			vista,
		});
	},
	// RCLV
	RCLV_Alta: async (req, res) => {
		// 1. Tema y Código
		let tema = "revision";
		let codigo = "RCLV";
		// 2. Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let includes = [];
		if (entidad == "personajes") includes.push("proceso_canonizacion", "rol_iglesia");
		let mes_id, dia_id, procesos_canonizacion, roles_iglesia, motivos, prodsEditados;
		// Obtener la versión original
		let RCLV_original = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [
			...includes,
			"status_registro",
			"peliculas",
			"colecciones",
			"capitulos",
		]);
		// Datos para la vista
		// Títulos
		let prodNombre = funciones.obtenerEntidadNombre(entidad);
		let titulo = "Revisar el " + prodNombre;
		// Valores del registro para el mes y día del año
		let meses = await BD_genericas.obtenerTodos("meses", "id");
		if (RCLV_original.dia_del_ano_id) {
			let dia_del_ano = await BD_genericas.obtenerPorId("dias_del_ano", RCLV_original.dia_del_ano_id);
			mes_id = dia_del_ano.mes_id;
			dia_id = dia_del_ano.dia;
		}
		// Otros
		if (entidad == "personajes") {
			procesos_canonizacion = await BD_genericas.obtenerTodos("procesos_canonizacion", "orden");
			procesos_canonizacion = procesos_canonizacion.filter((m) => m.id.length == 3);
			roles_iglesia = await BD_genericas.obtenerTodos("roles_iglesia", "orden");
			roles_iglesia = roles_iglesia.filter((m) => m.id.length == 3);
		}

		// Ir a la vista
		//return res.send(RCLV_original);
		return res.render("0-Estructura-Gral", {
			tema,
			codigo,
			titulo,
			RCLV_original,
			entidad,
			errores: {},
			meses,
			mes_id,
			dia_id,
			roles_iglesia,
			procesos_canonizacion,
		});
	},
	// Links
	links: async (req, res) => {
		// 1. Tema y Código
		let tema = "revision";
		let codigo = "links";
		// Otras variables
		let includes;
		let prodEntidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Configurar el título
		let prodNombre = funciones.obtenerEntidadNombre(prodEntidad);
		let titulo = "Revisar los Links de" + (prodEntidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtener el producto con sus links originales para verificar que los tenga
		includes = ["links", "status_registro"];
		if (prodEntidad == "capitulos") includes.push("coleccion");
		let producto = await BD_genericas.obtenerPorIdConInclude(prodEntidad, prodID, includes);
		// RESUMEN DE PROBLEMAS A VERIFICAR
		let informacion = problemasLinks(producto, req.session.urlAnterior);
		if (informacion) return res.render("Errores", {informacion});
		// Obtener todos los links
		let entidad_id = funciones.obtenerEntidad_id(prodEntidad);
		includes = ["status_registro", "ediciones", "prov", "tipo", "motivo"];
		let links = await BD_genericas.obtenerTodosPorCamposConInclude(
			"links",
			{[entidad_id]: prodID},
			includes
		);
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// return res.send(links)
		// Información para la vista
		let imagen = producto.avatar;
		let avatar = imagen
			? (imagen.slice(0, 4) != "http" ? "/imagenes/2-Productos/" : "") + imagen
			: "/imagenes/8-Agregar/IM.jpg";
		let provs = await BD_genericas.obtenerTodos("links_provs", "orden");
		let linksTipos = await BD_genericas.obtenerTodos("links_tipos", "id");
		let motivos = await BD_genericas.obtenerTodos("altas_motivos_rech", "orden")
			.then((n) => n.filter((m) => m.links))
			.then((n) =>
				n.map((m) => {
					return {id: m.id, comentario: m.comentario};
				})
			);
		let camposARevisar = variables.camposRevisarLinks().map((n) => n.nombreDelCampo);
		// Ir a la vista
		//return res.send(links)
		return res.render("0-Revisar", {
			tema,
			codigo,
			titulo,
			entidad: prodEntidad,
			id: prodID,
			producto,
			links,
			provs,
			links_tipos: linksTipos,
			avatar,
			prodOriginal: producto,
			motivos,
			calidades: [144, 240, 360, 480, 720, 1080],
			mostrar: null,
			userID,
			camposARevisar,
		});
	},
};

let infoProdEdicion = async (producto_id, prodID, userID) => {
	// Averiguar sobre la edición
	let edicion = await BD_genericas.obtenerPorCampos("prods_edicion", {
		[producto_id]: prodID,
	});
	// Generar la info del error
	let informacion = {
		mensajes:
			edicion && edicion.editado_por_id == userID
				? [
						"Sólo encontramos una edición, realizada por vos.",
						"Necesitamos que la revise otra persona.",
				  ]
				: ["No encontramos ninguna edición para revisar"],
		iconos: [
			{
				nombre: "fa-spell-check ",
				link: "/inactivar-captura/?entidad=" + entidad + "&id=" + prodID + "&destino=tablero",
				titulo: "Regresar al Tablero de Control",
			},
		],
	};
	return informacion;
};
let problemasLinks = (producto, urlAnterior) => {
	// Variables
	let informacion;
	const vistaAnterior = variables.vistaAnterior(urlAnterior);
	const vistaTablero = variables.vistaTablero();

	// El producto no está en status 'aprobado'
	if (!informacion && !producto.status_registro.aprobado)
		informacion = {
			mensajes: [
				"El producto no está en status 'Aprobado'",
				"Su status es " + producto.status_registro.nombre,
			],
			iconos: [vistaAnterior, vistaTablero],
		};

	// El producto no posee links
	if (!informacion && !producto.links.length)
		informacion = {
			mensajes: ["Este producto no tiene links en nuestra Base de Datos"],
			iconos: [vistaAnterior, vistaTablero],
		};

	// Fin
	return informacion;
};
