"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");

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
		const ahora = compartidas.ahora();
		// Productos y Ediciones
		let productos;
		productos = await procesos.tablero_obtenerProds(ahora, status, userID); //
		productos.ED = await procesos.tablero_obtenerProdsConEdic(ahora, status, userID); //
		// Obtener Links
		productos.LK = await procesos.tablero_obtenerProdsConLink(ahora, status, userID); //
		productos = procesos.tablero_prod_ProcesarCampos(productos);
		// RCLV
		let RCLVs = await procesos.tablero_obtenerRCLVs(ahora, status, userID); //
		RCLVs = procesos.tablero_RCLV_ProcesarCampos(RCLVs);
		// Ir a la vista
		// return res.send([productos,RCLVs]);
		return res.render("GN0-Estructura", {
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
		let id = req.query.id;
		// 4. Obtener los datos ORIGINALES del producto
		let includes = ["status_registro"];
		if (entidad == "colecciones") includes.push("capitulos");
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, id, includes);
		if (!prodOriginal.status_registro.creado) return res.redirect("/revision/tablero-de-control");
		// 5. Obtener avatar original
		let avatar = prodOriginal.avatar;
		avatar = avatar
			? (!avatar.startsWith("http") ? "/imagenes/3-ProdRevisar/" : "") + avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// 6. Configurar el título de la vista
		let prodNombre = compartidas.obtenerEntidadNombre(entidad);
		let titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// 7. Obtener los países
		let paises = prodOriginal.paises_id
			? await compartidas.paises_idToNombre(prodOriginal.paises_id)
			: "";
		// 8. Info para la vista
		let [bloqueIzq, bloqueDer] = await procesos.prod_BloquesAlta(prodOriginal, paises);
		let motivosRechazo = await BD_genericas.obtenerTodos("altas_motivos_rech", "orden").then((n) =>
			n.filter((m) => m.prod)
		);
		// Ir a la vista
		//return res.send(prodOriginal)
		return res.render("RV0-0Estructura", {
			tema,
			codigo,
			titulo,
			entidad,
			id,
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
		// 2. Constantes
		const entidad = req.query.entidad;
		const prodID = req.query.id;
		const userID = req.session.usuario.id;
		const producto_id = compartidas.obtenerEntidad_id(entidad);
		// 3. Variables
		let edicID = req.query.edicion_id;

		// VERIFICACION1: Si no existe edicID, lo averigua y recarga la vista
		if (!edicID) {
			edicID = await BD_especificas.obtenerEdicionAjena("prods_edicion", producto_id, prodID, userID);
			if (!edicID) {
				let informacion = await infoProdEdicion(entidad, prodID, producto_id, userID);
				return res.render("CR9-Errores", {informacion});
			} else return res.redirect(req.originalUrl + "&edicion_id=" + edicID); // Recargar la vista con el ID de la edición
		}
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
		[quedanCampos, prodEditado] = await procesos.prod_Feedback(prodOriginal, prodEditado);
		//return res.send(prodEditado)
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
			return res.render("CR9-Errores", {informacion});
		}
		// 4. Acciones dependiendo de si está editado el avatar
		if (prodEditado.avatar_archivo) {
			// Vista 'Edición-Avatar'
			vista = "RV1-Prod-Avatar";
			// Ruta y nombre del archivo 'avatar'
			avatar = {
				original: prodOriginal.avatar
					? (!prodOriginal.avatar.startsWith("http")
							? prodOriginal.status_registro.gr_pend_aprob
								? "/imagenes/3-ProdRevisar/"
								: "/imagenes/2-Productos/"
							: "") + prodOriginal.avatar
					: "/imagenes/8-Agregar/IM.jpg",
				edicion: "/imagenes/3-ProdRevisar/" + prodEditado.avatar_archivo,
				mostrarOriginal: !!prodEditado.avatar,
			};
			motivos = motivos.filter((m) => m.avatar);
		} else {
			// Obtener los ingresos y reemplazos
			[ingresos, reemplazos] = procesos.prod_ArmarComparac(prodOriginal, prodEditado);
			// Obtener el avatar
			avatar = prodOriginal.avatar;
			avatar = avatar
				? (!avatar.startsWith("http") ? "/imagenes/2-Productos/" : "") + avatar
				: "/imagenes/8-Agregar/IM.jpg";
			// Variables
			motivos = motivos.filter((m) => m.prod);
			bloqueDer = await procesos.prod_BloqueEdic(prodOriginal, prodEditado);
			vista = "RV0-0Estructura";
		}
		// 7. Configurar el título de la vista
		let prodNombre = compartidas.obtenerEntidadNombre(entidad);
		let titulo = "Revisar la Edición de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Ir a la vista
		//return res.send([ingresos, reemplazos]);
		return res.render(vista, {
			tema,
			codigo,
			titulo,
			prodOriginal,
			prodEditado,
			prodNombre,
			ingresos,
			reemplazos,
			avatar,
			motivos,
			entidad,
			id: prodID,
			bloqueDer,
			vista,
		});
	},
	// RCLV
	RCLV_Alta: async (req, res) => {
		// 1. Tema y Código
		let tema = "revision";
		let codigo = "rclv/alta";
		// 2. Variables
		let entidad = req.query.entidad;
		let id = req.query.id;
		let includes = ["status_registro"];
		if (entidad == "personajes") includes.push("rol_iglesia");
		let dataEntry = await BD_genericas.obtenerPorIdConInclude(entidad, id, includes);
		if (dataEntry.dia_del_ano_id) {
			let dia_del_ano = await BD_genericas.obtenerTodos("dias_del_ano", "id").then((n) =>
				n.find((m) => m.id == dataEntry.dia_del_ano_id)
			);
			dataEntry.dia = dia_del_ano.dia;
			dataEntry.mes_id = dia_del_ano.mes_id;
		}
		let meses = await BD_genericas.obtenerTodos("meses", "id");
		let nombre = compartidas.obtenerEntidadNombre(entidad);
		let titulo = "Revisar - " + nombre;
		let tituloCuerpo = "Revisá el " + nombre;
		// 3. Variables específicas para personajes
		if (entidad == "personajes") {
			var procesos_canonizacion = await BD_genericas.obtenerTodos("procesos_canonizacion", "orden");
			procesos_canonizacion = procesos_canonizacion.filter((m) => m.id.length == 3);
			var roles_iglesia = await BD_genericas.obtenerTodos("roles_iglesia", "orden");
			roles_iglesia = roles_iglesia.filter((m) => m.id.length == 3);
			var apariciones_marianas = await BD_genericas.obtenerTodos("hechos", "nombre");
			apariciones_marianas = apariciones_marianas.filter((n) => n.ap_mar);
		}
		// 4. Render
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			entidad: entidad,
			titulo,
			tituloCuerpo,
			link: req.originalUrl,
			dataEntry,
			meses,
			roles_iglesia,
			procesos_canonizacion,
			apariciones_marianas,
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
		let prodNombre = compartidas.obtenerEntidadNombre(prodEntidad);
		let titulo = "Revisar los Links de" + (prodEntidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtener el producto con sus links originales para verificar que los tenga
		includes = ["links", "status_registro"];
		if (prodEntidad == "capitulos") includes.push("coleccion");
		let producto = await BD_genericas.obtenerPorIdConInclude(prodEntidad, prodID, includes);
		// RESUMEN DE PROBLEMAS A VERIFICAR
		let informacion = problemasLinks(producto, req.session.urlAnterior);
		if (informacion) return res.render("CR9-Errores", {informacion});
		// Obtener todos los links
		let entidad_id = compartidas.obtenerEntidad_id(prodEntidad);
		includes = ["status_registro", "ediciones", "prov", "tipo", "motivo"];
		let links = await BD_genericas.obtenerTodosPorCamposConInclude(
			"links",
			{[entidad_id]: prodID},
			includes
		);
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// return res.send(links)
		// Información para la vista
		let avatar = producto.avatar;
		avatar = avatar
			? (!avatar.startsWith("http") ? "/imagenes/2-Productos/" : "") + avatar
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
		return res.render("RV0-0Estructura", {
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

let infoProdEdicion = async (entidad, prodID, producto_id, userID) => {
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
