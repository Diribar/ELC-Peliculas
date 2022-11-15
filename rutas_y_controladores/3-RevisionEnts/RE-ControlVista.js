"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./RE-Procesos");
const procesosCRUD = require("../2.2-RCLV-CRUD/RCLV-FN-Procesos");
const validarCRUD = require("../2.2-RCLV-CRUD/RCLV-FN-Validar");

module.exports = {
	// Uso general
	tableroControl: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		const codigo = "tableroControl";
		let userID = req.session.usuario.id;
		// Definir variables
		const ahora = comp.ahora();
		// Productos y Ediciones
		let productos = await procesos.TC_obtieneProds(ahora, userID);
		productos.ED = await procesos.TC_obtieneProdsConEdicAjena(ahora, userID);
		// Obtiene Links
		productos.CL = await procesos.TC_obtieneProdsConLink(ahora, userID);
		// RCLV
		let RCLVs = await procesos.TC_obtieneRCLVs(ahora, userID);
		RCLVs.ED = await procesos.TC_obtieneRCLVsConEdicAjena(ahora, userID);
		// Procesar los campos
		productos = procesos.TC_prod_ProcesarCampos(productos);
		RCLVs = procesos.TC_RCLV_ProcesarCampos(RCLVs);
		// Va a la vista
		// return res.send([productos,RCLVs]);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Revisión - Tablero de Entidades",
			productos,
			RCLVs,
		});
	},
	// Productos
	prodAltaForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionEnts";
		const codigo = req.path.slice(1, -1);
		// 2. Obtiene los datos identificatorios del producto
		let entidad = req.query.entidad;
		let id = req.query.id;
		// 4. Obtiene los datos ORIGINALES del producto
		let includes = ["status_registro"];
		if (entidad == "colecciones") includes.push("capitulos");
		// Detecta si el registro no está en status creado
		let prodOrig = await BD_genericas.obtienePorIdConInclude(entidad, id, includes);
		if (!prodOrig.status_registro.creado) return res.redirect("/revision/tablero-de-control");
		// 5. Obtiene avatar original
		let imgDerPers = prodOrig.avatar;
		imgDerPers = imgDerPers
			? (!imgDerPers.startsWith("http") ? "/imagenes/4-ProdsRevisar/" : "") + imgDerPers
			: "/imagenes/8-Agregar/IM.jpg";
		// 6. Configurar el título de la vista
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// 7. Obtiene los países
		let paises = prodOrig.paises_id ? await comp.paises_idToNombre(prodOrig.paises_id) : "";
		// 8. Info para la vista
		let [bloqueIzq, bloqueDer] = await procesos.prodAlta_ficha(prodOrig, paises);
		let motivosRechazo = await BD_genericas.obtieneTodos("altas_motivos_rech", "orden").then((n) =>
			n.filter((m) => m.prod)
		);
		let url = req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id;
		// Va a la vista
		//return res.send(prodOrig)
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo,
			entidad,
			id,
			prodOrig,
			imgDerPers,
			bloqueIzq,
			bloqueDer,
			motivosRechazo,
			prodNombre,
			title: prodOrig.nombre_castellano,
			cartel: true,
			url,
		});
	},
	prodAltaGuardar: async (req, res) => {
		// Variables
		const {entidad, id, rechazado} = req.query;
		const motivo_id = req.body.motivo_id;
		const urlRedirect = req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id;
		let prodOrig = await BD_genericas.obtienePorIdConInclude(entidad, id, "status_registro");
		// En caso de error, redirije
		if (rechazado && !motivo_id) return res.redirect(urlRedirect);
		if (!prodOrig.status_registro.creado) return res.redirect("/revision/tablero-de-control");
		// Variables
		const campoDecision = rechazado ? "prods_rech" : "prods_aprob";
		const userID = req.session.usuario.id;
		const ahora = comp.ahora();
		const urlEdicion = req.baseUrl + "/producto/edicion/?entidad=" + entidad + "&id=" + id;
		// Obtiene el nuevo status_id
		let creadoAprobID = status_registro.find((n) => n.creado_aprob).id;
		let inactivoID = status_registro.find((n) => n.inactivo).id;
		let status_registro_id = rechazado ? inactivoID : creadoAprobID;
		// Genera la info
		let datosEntidad = {
			status_registro_id,
			alta_analizada_por_id: userID,
			alta_analizada_en: ahora,
		};
		// Actualiza el status en el registro original
		await BD_genericas.actualizaPorId(entidad, id, datosEntidad);
		// Actualiza el status en los registros de los capítulos
		if (entidad == "colecciones")
			BD_genericas.actualizaTodosPorCampos("capitulos", {coleccion_id: id}, datosEntidad);
		// Agrega el registro en el historial_cambios_de_status
		let producto = await BD_genericas.obtienePorId(entidad, id);
		let creador_ID = producto.creado_por_id;
		let datosHistorial = {
			entidad_id: id,
			entidad,
			sugerido_por_id: creador_ID,
			sugerido_en: producto.creado_en,
			analizado_por_id: userID,
			analizado_en: ahora,
			status_original_id: status_registro.find((n) => n.creado).id,
			status_final_id: status_registro_id,
			aprobado: !rechazado,
		};
		if (rechazado) {
			var motivo = await BD_genericas.obtienePorId("altas_motivos_rech", motivo_id);
			datosHistorial.motivo_id = motivo.id;
			datosHistorial.duracion = Number(motivo.duracion);
		}
		BD_genericas.agregarRegistro("historial_cambios_de_status", datosHistorial);
		// Asienta la aprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", creador_ID, campoDecision, 1);
		// Penaliza al usuario si corresponde
		if (datosHistorial.duracion) procesos.usuario_Penalizar(creador_ID, motivo);
		// Fin
		return res.redirect(urlEdicion);
	},
	prodEdicForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		let codigo = "producto/edicion";

		// Validaciones y obtiene prodEdic
		let {prodEdic, informacion} = await procesos.prodEdicForm_obtieneProdEdic(req);

		// Si no pasa los filtros => informa el error
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Variables
		const {entidad, id: prodID} = req.query;
		let motivos = await BD_genericas.obtieneTodos("edic_motivos_rech", "orden");
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let avatarExterno, avatarLinksExternos, avatar;
		let quedanCampos, ingresos, reemplazos, bloqueDer, statusAprob;

		// Obtiene la versión original con includes
		let includesOrig = [...comp.includes("productos"), "status_registro"];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");
		let prodOrig = await BD_genericas.obtienePorIdConInclude(entidad, prodID, includesOrig);

		// Acciones si está presente el avatar
		if (prodEdic.avatar && prodEdic.avatar_url) {
			// Averigua si se reemplaza automáticamente
			let reemplAvatarAutomaticam =
				prodEdic.avatar && // Que exista el valor 'avatar'
				prodOrig.avatar == prodEdic.avatar_url; // Mismo valor para los campos 'original.avatar' y 'edicion.avatar_url'
			// Borra los campos auxiliares de avatar en la variable de edicion
			delete prodEdic.avatar_url;
			// Acciones si se reemplaza en forma automática
			if (reemplAvatarAutomaticam) {
				// Variables
				req.query.aprob = "true";
				// Avatar: impacto en los archivos, en el registro de edicion y en prodOrig
				await procesos.prodEdicGuardar_Avatar(req, prodOrig, prodEdic);
				avatar=prodEdic.avatar
				// Impactos en: producto.avatar, prod_edicion.avatar, usuarios.edic_aprob/rech, edic_aprob/rech
				[prodEdic, quedanCampos, statusAprob] = await procesos.prodEdicGuardar_Gral(
					req,
					prodOrig,
					prodEdic
				);
				// Fin, si no quedan campos
				if (!quedanCampos) {
					informacion = procesar.cartelNoQuedanCampos;
					return res.render("CMP-0Estructura", {informacion});
				}
			} else {
				// Variables
				codigo += "/avatar";
				avatar = {
					original: prodOrig.avatar
						? (!prodOrig.avatar.startsWith("http")
								? prodOrig.status_registro.gr_creado
									? "/imagenes/4-ProdsRevisar/"
									: "/imagenes/3-Productos/"
								: "") + prodOrig.avatar
						: "/imagenes/8-Agregar/IM.jpg",
					edicion: "/imagenes/4-ProdsRevisar/" + prodEdic.avatar,
				};
				motivos = motivos.filter((m) => m.avatar);
				avatarExterno = !avatar.original.includes("/imagenes/");
				avatarLinksExternos = variables.avatarLinksExternos(prodOrig.nombre_castellano);
			}
		}

		// Acciones si no está presente el avatar
		if (!codigo.includes("/avatar")) {
			// Obtiene los ingresos y reemplazos
			[ingresos, reemplazos] = procesos.prodEdicForm_ingrReempl(prodOrig, prodEdic);
			// Obtiene el avatar
			if (!avatar) avatar = prodOrig.avatar ? prodOrig.avatar : "/imagenes/8-Agregar/IM.jpg";
			if (!avatar.startsWith("http")) avatar = "/imagenes/3-Productos/" + avatar;
			// Variables
			motivos = motivos.filter((m) => m.prod);
			bloqueDer = await procesos.prodEdic_ficha(prodOrig, prodEdic);
		}

		// Va a la vista
		//return res.send([ingresos, reemplazos]);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Revisión de la Edición de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre,
			prodOrig,
			prodEdic,
			prodNombre,
			ingresos,
			reemplazos,
			avatar,
			motivos,
			entidad,
			id,
			bloqueDer,
			title: prodOrig.nombre_castellano,
			avatarExterno,
			avatarLinksExternos,
			cartel: true,
			omitirImagenDerecha: codigo.includes("avatar"),
			omitirFooter: codigo.includes("avatar"),
		});
	},
	// RCLVs
	rclvAltaGuardar: async (req, res) => {
		// 1. Variables
		const {entidad, id} = req.query;
		let datos = {...req.body, ...req.query};
		let userID = req.session.usuario.id;
		let creado_id = status_registro.find((n) => n.creado).id;
		let aprobado_id = status_registro.find((n) => n.aprobado).id;
		// 2. Averigua si hay errores de validación y toma acciones
		let errores = await validarCRUD.consolidado(datos);
		if (errores.hay) {
			req.session[entidad] = datos;
			res.cookie(entidad, datos, {maxAge: unDia});
			return res.redirect(req.originalUrl);
		}
		// PROBLEMA: El registro no está en status creado
		let includes = [];
		if (entidad != "valores") includes.push("dia_del_ano");
		if (entidad == "personajes") includes.push("proc_canoniz", "rol_iglesia");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, includes);
		if (original.status_registro_id != creado_id) return res.redirect("/revision/tablero-de-control");
		// Procesa el data-entry
		let dataEntry = await comp.procesarRCLV(datos);
		// Genera la información para guardar
		let alta_analizada_en = comp.ahora();
		let lead_time_creacion = (alta_analizada_en - original.creado_en) / unaHora;
		dataEntry = {
			...dataEntry,
			alta_analizada_por_id: userID,
			alta_analizada_en,
			lead_time_creacion,
			captura_activa: false,
			status_registro_id: aprobado_id,
		};
		// return res.send(dataEntry);
		// Guarda los cambios
		await procesosCRUD.guardarCambios(req, res, dataEntry);
		// Consecuencias de las diferencias
		procesos.RCLV_AltaGuardar(entidad, original, userID);
		// 9. Redirecciona a la siguiente instancia
		return res.redirect("/revision/tablero-de-control");
	},
	// Links
	linksForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionEnts";
		const codigo = "links";
		// Otras variables
		let includes;
		let entidad = req.query.entidad;
		let id = req.query.id;
		let userID = req.session.usuario.id;
		// Configurar el título
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo = "Revisar los Links de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtiene el producto con sus links originales para verificar que los tenga
		includes = ["links", "status_registro"];
		if (entidad == "capitulos") includes.push("coleccion");
		let producto = await BD_genericas.obtienePorIdConInclude(entidad, id, includes);
		// RESUMEN DE PROBLEMAS A VERIFICAR
		let informacion = procesos.problemasLinks(producto, req.session.urlAnterior);
		if (informacion) return res.render("CMP-0Estructura", {informacion});
		// Obtiene todos los links
		let entidad_id = comp.obtieneEntidad_id(entidad);
		includes = ["status_registro", "ediciones", "prov", "tipo", "motivo"];
		let links = await BD_genericas.obtieneTodosPorCamposConInclude("links", {[entidad_id]: id}, includes);
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// return res.send(links)
		// Información para la vista
		let avatar = producto.avatar;
		avatar = avatar
			? (!avatar.startsWith("http") ? "/imagenes/3-Productos/" : "") + avatar
			: "/imagenes/8-Agregar/IM.jpg";
		let provs = await BD_genericas.obtieneTodos("links_provs", "orden");
		let linksTipos = await BD_genericas.obtieneTodos("links_tipos", "id");
		let motivos = await BD_genericas.obtieneTodos("altas_motivos_rech", "orden")
			.then((n) => n.filter((m) => m.links))
			.then((n) =>
				n.map((m) => {
					return {id: m.id, comentario: m.comentario};
				})
			);
		let camposARevisar = variables.camposRevisar.links.map((n) => n.nombre);
		// Va a la vista
		//return res.send(links)
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo,
			entidad,
			id,
			producto,
			links,
			provs,
			links_tipos: linksTipos,
			avatar,
			motivos,
			calidades: [144, 240, 360, 480, 720, 1080],
			mostrar: null,
			userID,
			camposARevisar,
			title: producto.nombre_castellano,
			cartel: true,
		});
	},
};
