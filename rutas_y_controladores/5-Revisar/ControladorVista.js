"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const procesar = require("../../funciones/3-Procesos/5-Revisar");

module.exports = {
	// Uso general
	tableroControl: async (req, res) => {
		// Tema y Código
		let tema = "revision";
		let codigo = "tableroControl";
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
		let aprobados = status.filter((n) => n.gr_aprobados).map((n) => n.id);
		let haceUnaHora = funciones.haceUnaHora();
		// Obtener productos ------------------------------------------------------------
		let productos = await procesar.prod_ObtenerARevisar(haceUnaHora, status, userID);
		//return res.send(productos);
		// Obtener las ediciones con producto en status 'aprobado'
		// let ediciones=await procesar.obtenerEdicionesARevisar();
		// Consolidar productos y ordenar
		productos = procesar.prod_Procesar(productos);
		// Obtener RCLV -----------------------------------------------------------------
		let RCLVs = await BD_especificas.obtenerRCLVsARevisar(haceUnaHora, revisar, userID);
		//return res.send(RCLVs);
		if (RCLVs.length) RCLVs = procesar.RCLV_procesar(RCLVs, aprobados);
		// Obtener Links ----------------------------------------------------------------
		let links = await BD_especificas.obtenerLinksARevisar(haceUnaHora, revisar, userID);
		// Obtener los productos de los links
		let aprobado = status.find((n) => n.aprobado).id
		//return res.send([links, aprobado])
		let prodsLinks = procesar.links_Productos(links, aprobado);
		// Ir a la vista ----------------------------------------------------------------
		//return res.send(RCLVs);
		return res.render("0-VistaEstandar", {
			tema,
			codigo,
			titulo: "Revisar - Tablero de Control",
			productos,
			RCLVs,
			prodsLinks,
			status,
		});
	},
	inactivarCaptura: async (req, res) => {
		// Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		let haceUnaHora = funciones.haceUnaHora();
		// Obtener producto
		let producto = await BD_genericas.obtenerPorId(entidad, prodID);
		if (producto) {
			// Verificar que tenga una captura activa del usuario
			if (
				producto.capturado_en &&
				producto.capturado_por_id &&
				producto.captura_activa &&
				producto.capturado_en > haceUnaHora &&
				producto.capturado_por_id == userID
			)
				// En caso afirmativo, actualizarlo inactivando la captura
				await BD_genericas.actualizarPorId(entidad, prodID, {captura_activa: 0});
		}
		// Redireccionar a "Visión General"
		return res.redirect("/revision/tablero-de-control");
	},
	redireccionar: async (req, res) => {
		// Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let edicID = req.query.edicion_id;
		let userID = req.session.usuario.id;
		let destino = funciones.familiaEnSingular(entidad);
		let haceUnaHora = funciones.haceUnaHora();
		let datosEdicion = "";
		// Obtener el producto
		let producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "status_registro");
		// Obtener la sub-dirección de destino
		if (destino == "producto") {
			let subDestino = producto.status_registro.creado
				? "/alta"
				: producto.status_registro.gr_inactivos
				? "/inactivos"
				: "/edicion";
			destino += subDestino;
			if (subDestino == "/edicion") {
				let producto_id = funciones.entidad_id(entidad);
				// Obtener el id de la edición
				if (!edicID)
					edicID = await BD_especificas.obtenerEdicionAjena(
						producto_id,
						prodID,
						userID,
						haceUnaHora
					);
				if (edicID) datosEdicion = "&edicion_id=" + edicID;
				else {
					let edicion = await BD_genericas.obtenerPorCampos("prods_edicion", {
						[producto_id]: prodID,
					});
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
								nombre: "fa-thumbs-up",
								link: "/revision/inactivar-captura/?entidad=" + entidad + "&id=" + prodID,
								titulo: "Ir a la vista de inicio de revision",
							},
						],
					};
					return res.render("Errores", {informacion});
				}
			}
		}
		// Redireccionar
		return res.redirect("/revision/" + destino + "/?entidad=" + entidad + "&id=" + prodID + datosEdicion);
	},
	// Productos
	productoAlta: async (req, res) => {
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
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
		if (!prodOriginal.status_registro.creado)
			return res.redirect("/revision/redireccionar/?entidad=" + entidad + "&id=" + prodID);
		// 5. Obtener avatar original
		let avatar = prodOriginal.avatar
			? (prodOriginal.avatar.slice(0, 4) != "http" ? "/imagenes/3-ProdRevisar/" : "") +
			  prodOriginal.avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// 6. Configurar el título de la vista
		let prodNombre = funciones.entidadNombre(entidad);
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
			prodOriginal,
			avatar,
			bloqueIzq,
			bloqueDer,
			motivosRechazo,
			prodNombre,
		});
	},
	productoEdicion: async (req, res) => {
		// 1. Tema y Código
		let tema = "revision";
		let codigo = "producto/edicion";
		// 2. Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let edicID = req.query.edicion_id;
		// VERIFICACION1: Si no existe edición --> redirecciona
		if (!edicID) return res.redirect("/revision/redireccionar/?entidad=" + entidad + "&id=" + prodID);
		// Definir más variables
		let motivos = await BD_genericas.obtenerTodos("edic_motivos_rech", "orden");
		let vista, avatar, ingresos, reemplazos, quedanCampos, bloqueDer;
		// 3. Obtener ambas versiones
		let includes = [
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
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [
			...includes,
			"status_registro",
		]);
		let prodEditado = await BD_genericas.obtenerPorIdConInclude("prods_edicion", edicID, includes);
		// VERIFICACION2: si la edición no se corresponde con el producto --> redirecciona
		let producto_id = funciones.entidad_id(entidad);
		if (!prodEditado || !prodEditado[producto_id] || prodEditado[producto_id] != prodID)
			return res.redirect("/revision/redireccionar/?entidad=" + entidad + "&id=" + prodID);
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
			vista = "2-Prod2-Edic1Avatar";
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
			vista = "2-Prod2-Edic2Estruct";
		}
		// 7. Configurar el título de la vista
		let prodNombre = funciones.entidadNombre(entidad);
		let titulo = "Revisar la Edición de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Ir a la vista
		//return res.send([ingresos, reemplazos]);
		return res.render(vista, {
			tema,
			codigo,
			titulo,
			prodOriginal,
			prodEditado,
			ingresos,
			reemplazos,
			avatar,
			vista,
			motivos,
			entidad,
			bloqueDer,
			prodNombre,
		});
	},
	// RCLV
	RCLVform: async (req, res) => {
		// 1. Tema y Código
		let tema = "revision";
		let codigo = "RCLV";
		// 2. Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		let haceUnaHora = funciones.haceUnaHora();
		let includes = [];
		if (entidad == "RCLV_personajes") includes.push("proceso_canonizacion", "rol_iglesia");
		let mes_id, diaOriginal, procesos_canonizacion, roles_iglesia, motivos, prodsEditados;
		// Obtener la versión original
		let RCLV_original = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [
			...includes,
			"status_registro",
			"peliculas",
			"colecciones",
		]);
		// Obtener todas las ediciones ajenas
		let producto_id = funciones.entidad_id(entidad);
		// PENDIENTE
		// Obtener los motivos de rechazo
		if (RCLV_original.status_registro.gr_aprobados) {
			motivos = await BD_genericas.obtenerTodos("edic_motivos_rech", "orden");
			prodsEditados = await BD_especificas.obtenerEdicsAjenasUnProd(
				producto_id,
				prodID,
				userID,
				haceUnaHora
			);
		}
		// Obtener el título de canonización
		let tituloCanoniz = procesar.RCLV_tituloCanoniz({...RCLV_original, entidad});
		// Datos para la vista
		// Títulos
		let prodNombre = funciones.entidadNombre(entidad);
		let titulo = "Revisar el " + prodNombre;
		// Mes y día del año
		let meses = await BD_genericas.obtenerTodos("meses", "id");
		if (RCLV_original.dia_del_ano_id) {
			let dia_del_ano = await BD_genericas.obtenerPorId("dias_del_ano", RCLV_original.dia_del_ano_id);
			mes_id = dia_del_ano.mes_id;
			diaOriginal = dia_del_ano.dia;
		}
		// Otros
		if (RCLV_original.rol_iglesia_id) {
			procesos_canonizacion = await BD_genericas.obtenerTodos("procesos_canonizacion", "orden");
			procesos_canonizacion = procesos_canonizacion.filter((m) => m.id.length == 3);
			roles_iglesia = await BD_genericas.obtenerTodos("roles_iglesia", "orden");
			roles_iglesia = roles_iglesia.filter((m) => m.id.length == 3);
		}

		// Ir a la vista
		//return res.send(RCLV_original);
		return res.render("0-VistaEstandar", {
			tema,
			codigo,
			titulo,
			RCLV_original,
			prodsEditados,
			motivos,
			entidad,
			prodNombre,
			tituloCanoniz,
			errores: {},
			meses,
			mes_id,
			diaOriginal,
			roles_iglesia,
			procesos_canonizacion,
		});
	},
};
