"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./RE-Procesos");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procsRCLV = require("../2.2-RCLV-CRUD/RCLV-Procesos");
const validaRCLV = require("../2.2-RCLV-CRUD/RCLV-Validar");

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
		let prodsConEdic = await procesos.TC.obtieneProdsConEdicAjena(ahora, userID); // Sólo con RCLV aprobado
		let productos = await procesos.TC.obtieneProds(ahora, userID);
		if (prodsConEdic.length) {
			// Deja solamente los productos en status creado
			productos.PA = prodsConEdic.filter((n) => n.status_registro_id == creado_id);
			// Deja solamente los productos en status creado_aprob y aprobado
			const gr_aprobado_id = [creado_aprob_id, aprobado_id];
			productos.ED = prodsConEdic.filter((n) => gr_aprobado_id.includes(n.status_registro_id));
		}

		// RCLV
		let rclvs = await procesos.TC.obtieneRCLVs(ahora, userID);

		// Links
		rclvs.ED = await procesos.TC.obtieneRCLVsConEdicAjena(ahora, userID);
		// Obtiene Links
		productos.CL = await procesos.TC.obtieneProdsConLink(ahora, userID);
		// return res.send(productos.CL)
		// Procesa los campos de las 2 familias de entidades
		productos = procesos.TC.prod_ProcesarCampos(productos);
		rclvs = procesos.TC.RCLV_ProcesarCampos(rclvs);
		// Va a la vista
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Revisión - Tablero de Entidades",
			productos,
			rclvs,
		});
	},

	// Productos y RCLVs
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
			let entidad_id = comp.obtieneEntidad_idDesdeEntidad(entidad);
			let prodEdic = await BD_genericas.obtienePorCampos("prods_edicion", {[entidad_id]: id});
			prodEdic = procsCRUD.quitaCamposSinContenido(prodEdic);
			prodOrig = {...prodOrig, ...prodEdic, id};
			// return res.send([entidad_id, prodOrig, prodEdic]);
		}
		if (!prodOrig.status_registro.creado) return res.redirect("/revision/tablero-de-control");
		// 5. Obtiene avatar original
		let imgDerPers = prodOrig.avatar;
		imgDerPers = imgDerPers
			? (!imgDerPers.startsWith("http") ? "/imagenes/2-Avatar-Prods-Revisar/" : "") + imgDerPers
			: "/imagenes/0-Base/Avatar/Prod-Avatar-Generico.jpg";
		// 6. Configurar el título de la vista
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// 7. Obtiene los países
		let paises = prodOrig.paises_id ? await comp.paises_idToNombre(prodOrig.paises_id) : "";
		// 8. Info para la vista
		let [bloqueIzq, bloqueDer] = await procesos.prodAltaForm_ficha(prodOrig, paises);
		let motivosRechazo = await BD_genericas.obtieneTodos("altas_motivos_rech", "orden").then((n) => n.filter((m) => m.prod));
		let urlActual = req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id;
		// Botón salir
		let rutaSalir = comp.rutaSalir(tema, codigo, {entidad, id});
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
			cartelEscondido: true,
			urlActual,
			rutaSalir,
		});
	},
	prodEdicForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		let codigo = "producto/edicion"; // No se puede poner 'const', porque más adelante puede cambiar
		// Validaciones y obtiene prodEdic
		let {edicAjena: prodEdic, informacion} = await procesos.edicion.obtieneEdicAjena(req, "productos", "prods_edicion");
		// Si no pasa los filtros => informa el error
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Variables
		const {entidad, id: prodID} = req.query;
		let motivos = await BD_genericas.obtieneTodos("edic_motivos_rech", "orden");
		let avatarExterno, avatarLinksExternos, avatar, imgDerPers;
		let ingresos, reemplazos, bloqueDer, infoErronea_id;

		// Obtiene la versión original con includes
		let includesOrig = [...comp.obtieneTodosLosCamposInclude(entidad), "status_registro"];
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
				// Impactos en: usuario, edicAprob/Rech, RCLV, producto_original, prod_edicion
				let statusAprob;
				[prodOrig, prodEdic, quedanCampos, statusAprob] = await procesos.guardaEdicRev(req, prodOrig, prodEdic);
				// Fin, si no quedan campos
				if (!quedanCampos) return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});
			} else {
				// Variables
				codigo += "/avatar";
				avatar = {
					original: prodOrig.avatar
						? (!prodOrig.avatar.startsWith("http") ? "/imagenes/2-Avatar-Prods-Final/" : "") + prodOrig.avatar
						: "/imagenes/0-Base/Avatar/Prod-Avatar-Generico.jpg",
					edicion: "/imagenes/2-Avatar-Prods-Revisar/" + prodEdic.avatar,
				};
				motivos = motivos.filter((m) => m.avatar);
				avatarExterno = !avatar.original.includes("/imagenes/");
				avatarLinksExternos = variables.avatarLinksExternos(prodOrig.nombre_castellano);
			}
		}
		// Acciones si no está presente el avatar
		if (!codigo.includes("/avatar")) {
			// Achica la edición a su mínima expresión
			let edicion = await procsCRUD.puleEdicion(prodOrig, prodEdic, "productos");
			// Fin, si no quedan campos
			if (!edicion) return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});
			// Obtiene los ingresos y reemplazos
			[ingresos, reemplazos] = await procesos.prodEdicForm_ingrReempl(prodOrig, edicion);
			// Obtiene el avatar
			avatar = prodOrig.avatar ? prodOrig.avatar : "/imagenes/0-Base/Avatar/Prod-Avatar-Generico.jpg";
			if (!avatar.startsWith("http")) avatar = "/imagenes/2-Avatar-Prods-Final/" + avatar;
			// Variables
			motivos = motivos.filter((m) => m.prod);
			infoErronea_id = motivos.find((n) => n.info_erronea).id;
			bloqueDer = await procesos.edicion.fichaDelRegistro(prodOrig, prodEdic);
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
			cartelEscondido: true,
		});
	},
	rclvEdicForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		const codigo = "rclvEdicion";
		// Validaciones y obtiene rclvEdic
		let {edicAjena: rclvEdic, informacion} = await procesos.edicion.obtieneEdicAjena(req, "rclvs", "rclvs_edicion");
		// Si no pasa los filtros => informa el error
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Variables
		const {entidad, id: prodID} = req.query;
		let motivos = await BD_genericas.obtieneTodos("edic_motivos_rech", "orden");
		let ingresos, reemplazos, bloqueDer, infoErronea_id;

		// Obtiene la versión original con includes
		let includesOrig = [...comp.obtieneTodosLosCamposInclude(entidad), "status_registro"];
		let rclvOrig = await BD_genericas.obtienePorIdConInclude(entidad, prodID, includesOrig);

		// Acciones si no está presente el avatar
		let edicion = await procsCRUD.puleEdicion(rclvOrig, rclvEdic, "rclvs");
		// Fin, si no quedan campos
		if (!edicion) return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});
		// Obtiene los ingresos y reemplazos
		[ingresos, reemplazos] = await procesos.RCLV_EdicForm_ingrReempl(rclvOrig, edicion);
		// Variables
		motivos = motivos.filter((m) => m.rclv);
		infoErronea_id = motivos.find((n) => n.info_erronea).id;
		bloqueDer = await procesos.edicion.fichaDelRegistro(rclvOrig, rclvEdic);
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
			cartelEscondido: true,
		});
	},
	registroAltaGuardar: async (req, res) => {
		// Variables
		const {entidad, id, rechazado} = req.query;
		let motivo_id = req.body.motivo_id;
		const familia = comp.obtieneFamiliaEnPlural(entidad);
		const rclvs = familia == "rclvs";
		let datosCompletos = {};

		// 2. Acciones específicas para RCLVs
		if (rclvs) {
			// Averigua si hay errores de validación y toma acciones
			const datos = {...req.body, ...req.query};
			let errores = await validaRCLV.consolidado(datos);
			if (errores.hay) {
				req.session[entidad] = datos;
				res.cookie(entidad, datos, {maxAge: unDia});
				return res.redirect(req.originalUrl);
			}
			// Procesa los datos del Data Entry
			datosCompletos = procsRCLV.altaEdicGrabar.procesaLosDatos(datos);
		}

		// PROCESOS INTERMEDIOS
		// Más variables
		const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);
		const campoDecision = petitFamilia + (rechazado ? "_rech" : "_aprob");
		const revID = req.session.usuario.id;
		const ahora = comp.ahora();
		const alta_analizada_en = ahora;
		const status_registro_id = rechazado ? inactivo_id : rclvs ? aprobado_id : creado_aprob_id;

		// Obtiene el registro original
		let includes = comp.obtieneTodosLosCamposInclude(entidad);
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, includes);

		// Completa los datos
		const lead_time_creacion = Math.min(99.99, (alta_analizada_en - original.creado_en) / unaHora);
		datosCompletos = {
			...datosCompletos,
			status_registro_id,
			alta_analizada_por_id: revID,
			alta_analizada_en,
			lead_time_creacion,
			captura_activa: false,
		};

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		await BD_genericas.actualizaPorId(entidad, id, datosCompletos);

		// 2. Si es una colección, actualiza sus capítulos con el mismo status
		if (entidad == "colecciones") BD_genericas.actualizaTodosPorCampos("capitulos", {coleccion_id: id}, datosCompletos);

		// 3. Si es un RCLV aprobado, actualiza la tabla de edics_aprob/rech y esos mismos campos en el usuario
		if (rclvs && !rechazado) procesos.rclvEdicAprobRech(entidad, original, revID);

		// 4. Agrega un registro en el historial_cambios_de_status
		let creado_por_id = original.creado_por_id;
		let datosHist = {
			entidad_id: id,
			entidad,
			sugerido_por_id: creado_por_id,
			sugerido_en: original.creado_en,
			analizado_por_id: revID,
			analizado_en: ahora,
			status_original_id: creado_id,
			status_final_id: status_registro_id,
			aprobado: !rechazado,
		};
		if (rechazado) {
			datosHist.motivo_id = motivo_id;
			let motivo = altas_motivos_rech.find((n) => n.id == motivo_id);
			datosHist.duracion = Number(motivo.duracion);
		}
		BD_genericas.agregaRegistro("historial_cambios_de_status", datosHist);

		// 5. Aumenta el valor de regs_aprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", creado_por_id, campoDecision, 1);

		// 6. Penaliza al usuario si corresponde
		if (datosHist.duracion) comp.usuarioPenalizAcum(creado_por_id, datosHist.duracion, petitFamilia);

		// 7. Si es un RCLV y es eliminado, se borra su id de los campos rclv_id de las ediciones de producto
		if (rclvs && rechazado) {
			let rclv_id = comp.obtieneEntidad_idDesdeEntidad(entidad);
			BD_genericas.actualizaTodosPorCampos("prods_edicion", {[rclv_id]: id}, {[rclv_id]: null});
		}

		// Fin
		if (rclvs) return res.redirect("/revision/tablero-de-control");
		else {
			// Obtiene el edicID
			let {edicID} = await procesos.edicion.obtieneEdicAjena(req, "productos", "prods_edicion");
			let urlEdicion = req.baseUrl + "/producto/edicion/?entidad=" + entidad + "&id=" + id;
			if (edicID) urlEdicion += "&edicion_id=" + edicID;
			return res.redirect(urlEdicion);
		}
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
		// RESUMEN DE PROBLEMAS DE PRODUCTO A VERIFICAR
		let informacion = procesos.problemasProd(producto, req.session.urlAnterior);
		if (informacion) return res.render("CMP-0Estructura", {informacion});
		// Obtiene todos los links
		let entidad_id = comp.obtieneEntidad_idDesdeEntidad(entidad);
		includes = ["status_registro", "ediciones", "prov", "tipo", "motivo"];
		let links = await BD_genericas.obtieneTodosPorCamposConInclude("links", {[entidad_id]: id}, includes);
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// return res.send(links)
		// Información para la vista
		let avatar = producto.avatar;
		avatar = avatar
			? (!avatar.startsWith("http") ? "/imagenes/2-Avatar-Prods-Final/" : "") + avatar
			: "/imagenes/0-Base/Avatar/Prod-Avatar-Generico.jpg";
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
			links_provs,
			links_tipos,
			avatar,
			motivos,
			calidades: variables.calidades,
			userID,
			camposARevisar,
			title: producto.nombre_castellano,
			imgDerPers: procsCRUD.avatarOrigEdic(producto, "").orig,
			cartelEscondido: true,
		});
	},
};
