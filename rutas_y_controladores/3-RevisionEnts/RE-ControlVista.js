"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./RE-Procesos");
const procesosCRUD = require("../2.2-RCLV-CRUD/RCLV-FN-Procesos");
const validaCRUD = require("../2.2-RCLV-CRUD/RCLV-FN-Validar");

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
		// return res.send(productos)
		productos.ED = await procesos.TC_obtieneProdsConEdicAjena(ahora, userID);
		// Obtiene Links
		productos.CL = await procesos.TC_obtieneProdsConLink(ahora, userID);
		// RCLV
		let rclvs = await procesos.TC_obtieneRCLVs(ahora, userID);
		rclvs.ED = await procesos.TC_obtieneRCLVsConEdicAjena(ahora, userID);
		// Procesa los campos
		productos = procesos.TC_prod_ProcesarCampos(productos);
		rclvs = procesos.TC_RCLV_ProcesarCampos(rclvs);
		// Va a la vista
		// return res.send([productos,rclvs]);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Revisión - Tablero de Entidades",
			productos,
			rclvs,
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
		// Le agrega datos de la edición cuando no proviene de TMDB
		if (prodOrig.fuente != "TMDB") {
			let entidad_id = comp.obtieneEntidad_id(entidad);
			let prodEdic = await BD_genericas.obtienePorCampos("prods_edicion", {[entidad_id]: id});
			prodEdic = comp.quitaCamposSinContenido(prodEdic);
			prodOrig = {...prodOrig, ...prodEdic, id};
			// return res.send([entidad_id, prodOrig, prodEdic]);
		}
		if (!prodOrig.status_registro.creado) return res.redirect("/revision/tablero-de-control");
		// 5. Obtiene avatar original
		let imgDerPers = prodOrig.avatar;
		imgDerPers = imgDerPers
			? (!imgDerPers.startsWith("http") ? "/imagenes/4-ProdsRevisar/" : "") + imgDerPers
			: "/imagenes/0-Base/AvatarGenericoProd.jpg";
		// 6. Configurar el título de la vista
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// 7. Obtiene los países
		let paises = prodOrig.paises_id ? await comp.paises_idToNombre(prodOrig.paises_id) : "";
		// 8. Info para la vista
		let [bloqueIzq, bloqueDer] = await procesos.prodAltaForm_ficha(prodOrig, paises);
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
			mostrarCartel: true,
			url,
		});
	},
	prodAltaGuardar: async (req, res) => {
		// Variables
		const {entidad, id, rechazado} = req.query;
		const motivo_id = req.body.motivo_id;
		// En caso de error, lo muestra
		let producto = await BD_genericas.obtienePorIdConInclude(entidad, id, "status_registro");
		const informacion = procesos.prodAltaGuardar_informacion(req, producto);
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Variables
		const campoDecision = rechazado ? "prods_rech" : "prods_aprob";
		const userID = req.session.usuario.id;
		const ahora = comp.ahora();
		const creadoAprobID = status_registro.find((n) => n.creado_aprob).id;
		const inactivoID = status_registro.find((n) => n.inactivo).id;
		const status_registro_id = rechazado ? inactivoID : creadoAprobID;
		let datosEntidad = {status_registro_id, alta_analizada_por_id: userID, alta_analizada_en: ahora};

		// Actualiza el status en el registro original y en la variable
		await BD_genericas.actualizaPorId(entidad, id, datosEntidad);
		producto = {...producto, ...datosEntidad};
		// Actualiza el status en los registros de los capítulos
		if (entidad == "colecciones")
			BD_genericas.actualizaTodosPorCampos("capitulos", {coleccion_id: id}, datosEntidad);

		// Agrega el registro en el historial_cambios_de_status
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
		BD_genericas.agregaRegistro("historial_cambios_de_status", datosHistorial);
		// Aumenta el valor de prod_aprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", creador_ID, campoDecision, 1);
		// Penaliza al usuario si corresponde
		if (datosHistorial.duracion) procesos.usuario_Penalizar(creador_ID, motivo);
		// Obtiene el edicID
		let {edicID} = await procesos.form_obtieneEdicAjena(req, "productos", "prods_edicion");
		let urlEdicion = req.baseUrl + "/producto/edicion/?entidad=" + entidad + "&id=" + id;
		if (edicID) urlEdicion += "&edicion_id=" + edicID;
		// Fin
		return res.redirect(urlEdicion);
	},
	prodEdicForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		let codigo = "producto/edicion"; // No se puede poner 'const', porque más adelante puede cambiar
		// Validaciones y obtiene prodEdic
		let {edicAjena: prodEdic, informacion} = await procesos.form_obtieneEdicAjena(
			req,
			"productos",
			"prods_edicion"
		);
		// Si no pasa los filtros => informa el error
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Variables
		const {entidad, id: prodID} = req.query;
		let motivos = await BD_genericas.obtieneTodos("edic_motivos_rech", "orden");
		let avatarExterno, avatarLinksExternos, avatar, imgDerPers;
		let quedanCampos, ingresos, reemplazos, bloqueDer, statusAprob, infoErronea_id;

		// Obtiene la versión original con includes
		let includesOrig = [...comp.includes("productos"), "status_registro"];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");
		let prodOrig = await BD_genericas.obtienePorIdConInclude(entidad, prodID, includesOrig);

		// Acciones si está presente el avatar
		if (prodEdic.avatar) {
			// Acciones iniciales
			let reemplAvatarAutomaticam =
				prodEdic.avatar && // Que exista el archivo 'avatar'
				prodOrig.avatar && // Que exista un avatar en original
				prodOrig.avatar == prodEdic.avatar_url; // Mismo url para los campos 'original.avatar' y 'edicion.avatar_url'
			delete prodEdic.avatar_url;
			// Acciones si se reemplaza en forma automática
			if (reemplAvatarAutomaticam) {
				// Variables
				req.query.aprob = "true";
				req.query.campo = "avatar";
				// Avatar: impacto en los archivos, y en el registro de edicion
				prodEdic = await procesos.prodEdicGuardar_Avatar(req, prodOrig, prodEdic);
				// Impactos en: usuario, edic_aprob/rech, RCLV, producto_original, prod_edicion
				[prodOrig, prodEdic, quedanCampos, statusAprob] = await procesos.prodEdicGuardar_Gral(
					req,
					prodOrig,
					prodEdic
				);
				// Fin, si no quedan campos
				if (!quedanCampos)
					return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});
			} else {
				// Variables
				codigo += "/avatar";
				avatar = {
					original: prodOrig.avatar
						? (!prodOrig.avatar.startsWith("http") ? "/imagenes/3-Productos/" : "") +
						  prodOrig.avatar
						: "/imagenes/0-Base/AvatarGenericoProd.jpg",
					edicion: "/imagenes/4-ProdsRevisar/" + prodEdic.avatar,
				};
				motivos = motivos.filter((m) => m.avatar);
				avatarExterno = !avatar.original.includes("/imagenes/");
				avatarLinksExternos = variables.avatarLinksExternos(prodOrig.nombre_castellano);
			}
		}
		// Acciones si no está presente el avatar
		if (!codigo.includes("/avatar")) {
			let [edicion, quedanCampos] = comp.puleEdicion(prodOrig, prodEdic, "productos");
			// Fin, si no quedan campos
			if (!quedanCampos)
				return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});
			// Obtiene los ingresos y reemplazos
			[ingresos, reemplazos] = await procesos.prodEdicForm_ingrReempl(prodOrig, edicion);
			// Obtiene el avatar
			avatar = prodOrig.avatar ? prodOrig.avatar : "/imagenes/0-Base/AvatarGenericoProd.jpg";
			if (!avatar.startsWith("http")) avatar = "/imagenes/3-Productos/" + avatar;
			// Variables
			motivos = motivos.filter((m) => m.prod);
			infoErronea_id = motivos.find((n) => n.info_erronea).id;
			bloqueDer = await procesos.form_edicFicha(prodOrig, prodEdic);
			imgDerPers = avatar;
		}
		// Variables para la vista
		const prodNombre = comp.obtieneEntidadNombre(entidad);
		const titulo = "Revisión de la Edición de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Va a la vista
		// return res.send([ingresos, reemplazos]);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo,
			prodOrig,
			prodEdic,
			prodNombre,
			ingresos,
			reemplazos,
			avatar,
			motivos,
			infoErronea_id,
			entidad,
			id: prodID,
			bloqueDer,
			title: prodOrig.nombre_castellano,
			avatarExterno,
			avatarLinksExternos,
			imgDerPers,
			omitirImagenDerecha: codigo.includes("avatar"),
			omitirFooter: codigo.includes("avatar"),
			mostrarCartel: true,
		});
	},

	// rclvs
	rclvAltaGuardar: async (req, res) => {
		// 1. Variables
		const {entidad, id} = req.query;
		let datos = {...req.body, ...req.query};
		let userID = req.session.usuario.id;
		let creado_id = status_registro.find((n) => n.creado).id;
		let aprobado_id = status_registro.find((n) => n.aprobado).id;
		// 2. Averigua si hay errores de validación y toma acciones
		let errores = await validaCRUD.consolidado(datos);
		if (errores.hay) {
			req.session[entidad] = datos;
			res.cookie(entidad, datos, {maxAge: unDia});
			return res.redirect(req.originalUrl);
		}
		// PROBLEMA: El registro no está en status creado
		let includes = [];
		if (entidad != "valores") includes.push("dia_del_ano");
		if (entidad == "personajes") includes.push("proc_canon", "rol_iglesia");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, includes);
		if (original.status_registro_id != creado_id) return res.redirect("/revision/tablero-de-control");
		// 3. Procesa el data-entry
		let dataEntry = await procesosCRUD.procesarRCLV(datos);
		// 4. Genera la información para guardar
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
		// 5. Guarda los cambios
		await procesosCRUD.guardaLosCambios(req, res, dataEntry);
		// 6. Actualiza la tabla de edics aprob/rech
		procesos.RCLV_AltasGuardar_EdicAprobRech(entidad, original, userID);
		// 7. Redirecciona a la siguiente instancia
		return res.redirect("/revision/tablero-de-control");
	},
	rclvEdicForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		const codigo = "rclvEdicion";
		// Validaciones y obtiene rclvEdic
		let {edicAjena: rclvEdic, informacion} = await procesos.form_obtieneEdicAjena(
			req,
			"rclvs",
			"rclvs_edicion"
		);
		// Si no pasa los filtros => informa el error
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Variables
		const {entidad, id: prodID} = req.query;
		let motivos = await BD_genericas.obtieneTodos("edic_motivos_rech", "orden");
		let ingresos, reemplazos, bloqueDer, infoErronea_id;

		// Obtiene la versión original con includes
		let includesOrig = [...comp.includes("rclvs"), "status_registro"];
		let rclvOrig = await BD_genericas.obtienePorIdConInclude(entidad, prodID, includesOrig);

		// Acciones si no está presente el avatar
		let [edicion, quedanCampos] = comp.puleEdicion(rclvOrig, rclvEdic, "rclvs");
		// Fin, si no quedan campos
		if (!quedanCampos) return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});
		// Obtiene los ingresos y reemplazos
		[ingresos, reemplazos] = await procesos.RCLV_EdicForm_ingrReempl(rclvOrig, edicion);
		// Variables
		motivos = motivos.filter((m) => m.rclv);
		infoErronea_id = motivos.find((n) => n.info_erronea).id;
		bloqueDer = await procesos.form_edicFicha(rclvOrig, rclvEdic);
		// return res.send([edicion, ingresos, reemplazos]);

		// Variables para la vista
		const entidadNombre = comp.obtieneEntidadNombre(entidad);
		const titulo = "Revisión de la Edición del " + entidadNombre;
		// Va a la vista
		// return res.send([ingresos, reemplazos]);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo,
			rclvOrig,
			rclvEdic,
			entidadNombre,
			ingresos,
			reemplazos,
			motivos,
			infoErronea_id,
			entidad,
			id: prodID,
			bloqueDer,
			title: rclvOrig.nombre_castellano,
			mostrarCartel: true,
		});
	},

	// Links
	linksForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionEnts";
		const codigo = "abmLinks";
		// Otras variables
		let includes;
		let entidad = req.query.entidad;
		let id = req.query.id;
		let userID = req.session.usuario.id;
		// Configurar el título
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo = "Revisar los Links de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtiene el prodOrig con sus links originales para verificar que los tenga
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
			: "/imagenes/0-Base/AvatarGenericoProd.jpg";
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
			prodOrig: producto,
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
			imgDerPers: comp.avatarOrigEdic(producto, "").orig,
			mostrarCartel: true,
		});
	},
};
