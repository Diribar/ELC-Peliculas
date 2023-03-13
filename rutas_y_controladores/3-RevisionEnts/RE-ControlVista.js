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
	// TABLERO
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
			productos.AL = prodsConEdic.filter((n) => n.status_registro_id == creado_id && n.entidad != "capitulos");
			// Deja solamente la suma de los productos:
			// 1. En status 'creado_aprob' y que no sean 'capítulos'
			// 2. En status 'aprobado'
			productos.ED = prodsConEdic.filter((n) => n.status_registro_id == creado_aprob_id && n.entidad != "capitulos");
			productos.ED.push(...prodsConEdic.filter((n) => n.status_registro_id == aprobado_id));
		}

		// RCLV
		let rclvs = await procesos.TC.obtieneRCLVs(ahora, userID);
		rclvs.ED = await procesos.TC.obtieneRCLVsConEdicAjena(ahora, userID);

		// Links
		productos = {...productos, ...(await procesos.TC.obtieneProdsConLink(ahora, userID))};
		// return res.send(productos.CL)

		// Procesa los campos de las 2 familias de entidades
		productos = procesos.TC.prod_ProcesaCampos(productos);
		rclvs = procesos.TC.RCLV_ProcesaCampos(rclvs);
		// Va a la vista
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Revisión - Tablero de Entidades",
			productos,
			rclvs,
			origen: "TE",
		});
	},

	// ALTAS
	prod_altaForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		const codigo = req.path.slice(1, -1);
		// Variables
		let entidad = req.query.entidad;
		let id = req.query.id;
		const familia = comp.obtieneFamilia(entidad);
		const familias = comp.obtieneFamilias(entidad);
		// Obtiene el registro original
		let include = ["status_registro"];
		if (entidad == "colecciones") include.push("capitulos");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
		// Obtiene avatar original
		let imgDerPers = original.avatar;
		imgDerPers = imgDerPers
			? (!imgDerPers.startsWith("http") ? "/imagenes/2-Avatar-Prods-Revisar/" : "") + imgDerPers
			: "/imagenes/0-Base/Avatar/Prod-Avatar-Generico.jpg";
		// Configurar el título de la vista
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtiene los países
		let paisesNombre = original.paises_id ? await comp.paises_idToNombre(original.paises_id) : "";
		// Info para la vista
		let [bloqueIzq, bloqueDer] = await procesos.alta.prodAltaForm_ficha(original, paisesNombre);
		let motivos = motivos_rech_altas.filter((n) => n.prods);
		// Botón salir
		let rutaSalir = comp.rutaSalir(tema, codigo, {entidad, id});
		// Ayuda para el titulo
		const ayudasTitulo = [
			"Necesitamos que nos digas si estás de acuerdo en que está alineado con nuestro perfil.",
			"Si considerás que no, te vamos a pedir que nos digas el motivo.",
		];
		// Va a la vista
		//return res.send(original)
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, title: original.nombre_castellano},
			...{entidad, familias, familia, id, prodNombre, registro: original},
			...{bloqueIzq, bloqueDer, imgDerPers, motivos},
			...{rutaSalir, urlActual: req.session.urlActual, cartelRechazo: true},
		});
	},
	prodRCLV_altaGuardar: async (req, res) => {
		// Variables
		const {entidad, id, rechazado} = req.query;
		const motivo_id = req.body.motivo_id;
		const familia = comp.obtieneFamilias(entidad);
		const rclvs = familia == "rclvs";
		let datos = {};

		// Si es un RCLV y es aprobado, se realizan acciones específicas
		if (rclvs && !rechazado) {
			// Averigua si hay errores de validación y toma acciones
			datos = {...req.body, ...req.query};
			let errores = await validaRCLV.consolidado(datos);
			if (errores.hay) {
				req.session[entidad] = datos;
				res.cookie(entidad, datos, {maxAge: unDia});
				return res.redirect(req.originalUrl);
			}
			// Procesa los datos del Data Entry
			else datos = procsRCLV.altaEdicGrabar.procesaLosDatos(datos);
		}

		// Más variables
		const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);
		const campoDecision = petitFamilia + (rechazado ? "_rech" : "_aprob");
		const revID = req.session.usuario.id;
		const ahora = comp.ahora();
		const alta_analizada_en = ahora;
		const status_registro_id = rechazado ? inactivo_id : rclvs ? aprobado_id : creado_aprob_id;
		const campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);

		// Obtiene el registro original
		let include = comp.obtieneTodosLosCamposInclude(entidad);
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// Completa los datos
		datos = {
			...datos,
			status_registro_id,
			alta_analizada_por_id: revID,
			alta_analizada_en,
			sugerido_por_id: revID,
			sugerido_en: alta_analizada_en,
		};

		datos.lead_time_creacion = comp.obtieneLeadTime(original.creado_en, alta_analizada_en);
		if (rechazado) datos.motivo_id = motivo_id;

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// 2. Si es una colección, actualiza sus capítulos con el mismo status
		if (entidad == "colecciones") BD_genericas.actualizaTodosPorCampos("capitulos", {coleccion_id: id}, datos);

		// 3. Si es un RCLV y es aprobado, actualiza la tabla de edics_aprob/rech y esos mismos campos en el usuario
		if (rclvs && !rechazado) procesos.alta.rclvEdicAprobRech(entidad, original, revID);

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
			datosHist.motivo = motivos_rech_altas.find((n) => n.id == motivo_id);
			datosHist.duracion = Number(datosHist.motivo.duracion);
		}
		BD_genericas.agregaRegistro("historial_cambios_de_status", datosHist);

		// 5. Aumenta el valor de regs_aprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", creado_por_id, campoDecision, 1);

		// 6. Acciones por rechazos
		if (rechazado) {
			// 7.1. Penaliza al usuario si corresponde
			if (datosHist.duracion) comp.usuarioPenalizAcum(creado_por_id, datosHist.motivo, petitFamilia);

			// 7.2 Si es un RCLV, borra su id de los campos rclv_id de las ediciones de producto
			if (rclvs) BD_genericas.actualizaTodosPorCampos("prods_edicion", {[campo_id]: id}, {[campo_id]: null});

			// 7.3. Acciones si es un producto
			// Elimina el archivo de avatar de la edicion
			// Elimina las ediciones de producto que tenga
			// Actualiza los RCLV, en el campo 'prods_aprob'
			if (!rclvs) procesos.alta.prodRech(entidad, id, creado_por_id);
		}

		// Fin
		// Si es un producto y fue aprobado, redirecciona a una edición
		if (!rclvs && !rechazado) return res.redirect(req.baseUrl + "/producto/edicion/?entidad=" + entidad + "&id=" + id);
		// En los demás casos, redirecciona al tablero
		else return res.redirect("/revision/tablero-de-control");
	},

	// EDICION
	prod_edicForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		let codigo = "producto/edicion"; // No se puede poner 'const', porque más adelante puede cambiar

		// Variables
		const {entidad, id: prodID, edicion_id: edicID} = req.query;
		let avatarExterno, avatarLinksExternos, avatar, imgDerPers;
		let ingresos, reemplazos, bloqueDer, infoErronea_id, motivos;

		// Obtiene la versión original con include
		let include = [...comp.obtieneTodosLosCamposInclude(entidad), "status_registro"];
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, prodID, include);

		// Obtiene la edición
		let edicion = await BD_genericas.obtienePorId("prods_edicion", edicID);
		// return res.send([original,edicion])

		// Acciones si está presente el avatar
		if (edicion.avatar) {
			// Averigua si se debe reemplazar el avatar en forma automática
			let reemplAvatarAutomaticam =
				edicion.avatar && // Que en la edición, el campo 'avatar' tenga un valor
				original.avatar && // Que en el original, el campo 'avatar' tenga un valor
				original.avatar == edicion.avatar_url; // Mismo url para los campos 'original.avatar' y 'edicion.avatar_url'
			// Reemplazo automático
			if (reemplAvatarAutomaticam) {
				// Avatar: impacto en los archivos de avatar (original y edicion)
				await procesos.edicion.procsParticsAvatar({original, edicion, aprob: true});
				// REGISTRO ORIGINAL: actualiza el campo 'avatar' en el registro original
				await BD_genericas.actualizaPorId(entidad, original.id, {avatar: edicion.avatar});
				// REGISTRO EDICION: borra los campos de 'avatar' en el registro de edicion
				await BD_genericas.actualizaPorId("prods_edicion", edicion.id, {avatar: null, avatar_url: null});
				// Recarga la ruta
				return res.redirect(req.originalUrl);
			}
			// Reemplazo manual
			else if (!reemplAvatarAutomaticam) {
				// Variables
				codigo += "/avatar";
				avatar = procsCRUD.obtieneAvatarProd(original, edicion);
				motivos = motivos_rech_edic.filter((m) => m.avatar_prods);
				avatarExterno = !avatar.orig.includes("/imagenes/");
				avatarLinksExternos = variables.avatarLinksExternos(original.nombre_castellano);
			}
		}
		// Acciones si no está presente el avatar
		else if (!edicion.avatar) {
			// Variables
			let editado_por_id = edicion.editado_por_id;
			let editado_en = edicion.editado_en;
			// Achica la edición a su mínima expresión
			[edicion] = await procsCRUD.puleEdicion(entidad, original, edicion);
			// Fin, si no quedan campos
			if (!edicion) return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});
			// Obtiene los ingresos y reemplazos
			[ingresos, reemplazos] = await procesos.edicion.prodEdicForm_ingrReempl(original, edicion);
			// Obtiene el avatar
			avatar = procsCRUD.obtieneAvatarProd(original).orig;
			// Variables
			motivos = motivos_rech_edic.filter((m) => m.prods);
			bloqueDer = await procesos.edicion.fichaDelRegistro(original, {...edicion, editado_por_id, editado_en});
			imgDerPers = avatar;
		}
		// Variables para la vista
		const prodNombre = comp.obtieneEntidadNombre(entidad);
		const titulo = "Revisión de la Edición de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, title: original.nombre_castellano},
			...{entidad, id: prodID, registro: original, prodOrig: original, prodEdic: edicion, prodNombre},
			...{ingresos, reemplazos, motivos, bloqueDer, urlActual: req.session.urlActual},
			...{avatar, avatarExterno, avatarLinksExternos, imgDerPers},
			...{omitirImagenDerecha: codigo.includes("avatar"), omitirFooter: codigo.includes("avatar")},
			...{cartelGenerico: true, cartelRechazo: codigo.includes("avatar")},
		});
	},
	prod_AvatarGuardar: async (req, res) => {
		// return res.send({...req.query, ...req.body});
		// Obtiene la respuesta del usuario
		const {entidad, id: prodID, edicion_id: edicID, rechazado, motivo_id} = {...req.query, ...req.body};

		// Variables
		let revID = req.session.usuario.id;
		let original = await BD_genericas.obtienePorId(entidad, prodID);
		let edicion = await BD_genericas.obtienePorId("prods_edicion", edicID);
		let campo = "avatar";
		let aprob = !rechazado;

		// 1. PROCESOS PARTICULARES PARA AVATAR
		await procesos.edicion.procsParticsAvatar({entidad, original, edicion, aprob});
		delete edicion.avatar_url;

		// 2. PROCESOS COMUNES A TODOS LOS CAMPOS
		[edicion] = await procesos.edicion.edicAprobRech({entidad, original, edicion, revID, campo, aprob, motivo_id});

		// Fin
		if (edicion) return res.redirect(req.originalUrl);
		else return res.redirect("/revision/tablero-de-control");
	},
	rclv_edicForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		const codigo = "rclvEdicion";
		// Validaciones y obtiene rclvEdic
		let {edicAjena: rclvEdic, informacion} = await procesos.edicion.obtieneEdicAjena(req, "rclvs", "rclvs_edicion");
		// Si no pasa los filtros => informa el error
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Variables
		const {entidad, id: prodID} = req.query;
		let ingresos, reemplazos, bloqueDer, infoErronea_id;

		// Obtiene la versión original con include
		let includeOrig = [...comp.obtieneTodosLosCamposInclude(entidad), "status_registro"];
		let rclvOrig = await BD_genericas.obtienePorIdConInclude(entidad, prodID, includeOrig);

		// Acciones si no está presente el avatar
		let edicion = await procsCRUD.puleEdicion(entidad, rclvOrig, rclvEdic);
		// Fin, si no quedan campos
		if (!edicion) return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});
		// Obtiene los ingresos y reemplazos
		[ingresos, reemplazos] = await procesos.RCLV_EdicForm_ingrReempl(rclvOrig, edicion);
		// Variables
		let motivos = motivos_rech_edic.filter((m) => m.rclvs);
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
			cartelGenerico: true,
		});
	},

	// LINKS
	linksForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionEnts";
		const codigo = "abmLinks";
		// Otras variables
		let include;
		let entidad = req.query.entidad;
		let id = req.query.id;
		let userID = req.session.usuario.id;
		// Configurar el título
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo = "Revisar los Links de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtiene el prodOrig con sus links originales para verificar que los tenga
		include = ["links", "status_registro"];
		if (entidad == "capitulos") include.push("coleccion");
		let producto = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
		// RESUMEN DE PROBLEMAS DE PRODUCTO A VERIFICAR
		let informacion = procesos.problemasProd(producto, req.session.urlAnterior);
		if (informacion) return res.render("CMP-0Estructura", {informacion});
		// Obtiene todos los links
		let campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
		include = ["status_registro", "ediciones", "prov", "tipo", "motivo"];
		let links = await BD_genericas.obtieneTodosPorCamposConInclude("links", {[campo_id]: id}, include);
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// return res.send(links)
		// Información para la vista
		let avatar = producto.avatar;
		avatar = avatar
			? (!avatar.startsWith("http") ? "/imagenes/2-Avatar-Prods-Final/" : "") + avatar
			: "/imagenes/0-Base/Avatar/Prod-Avatar-Generico.jpg";
		let motivos = motivos_rech_altas.filter((n) => n.links).map((n) => ({id: n.id, descripcion: n.descripcion}));

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
			imgDerPers: procsCRUD.obtieneAvatarProd(producto, "").orig,
			cartelGenerico: true,
		});
	},
};
