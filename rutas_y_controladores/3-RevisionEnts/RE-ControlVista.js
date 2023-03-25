"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./RE-Procesos");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procsProd = require("../2.1-Prod-RUD/PR-FN-Procesos");
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Procesos");
const validaRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Validar");

module.exports = {
	// TABLERO
	tableroControl: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		const codigo = "tableroControl";
		let revID = req.session.usuario.id;
		// Definir variables
		const ahora = comp.ahora();
		// Productos y Ediciones
		let productos = {
			// Altas y Ediciones
			...(await procesos.TC.obtieneProds_AL_ED(ahora, revID)),
			// Sin Edición, Inactivar y Recuperar
			...(await procesos.TC.obtieneProds_SE_IR(revID)),
		};

		// RCLV
		let rclvs = {
			...(await procesos.TC.obtieneRCLVs(ahora, revID)),
			ED: await procesos.TC.obtieneRCLVsConEdicAjena(ahora, revID),
		};

		// Links
		productos = {...productos, ...(await procesos.TC.obtieneProds_Links(ahora, revID))};
		
		// Procesa los campos de las 2 familias de entidades
		// return res.send(productos.AL)
		productos = procesos.TC.prod_ProcesaCampos(productos);
		rclvs = procesos.TC.RCLV_ProcesaCampos(rclvs);

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Revisión - Tablero de Entidades"},
			...{productos, rclvs, origen: "TE"},
		});
	},

	// ALTAS
	prod_altaForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		const codigo = "producto/alta";
		// Variables
		let {entidad, id} = req.query;
		const familia = comp.obtieneFamilia(entidad);
		const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);

		// Obtiene el registro original
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("status_registro", "creado_por", "sugerido_por");
		if (entidad == "colecciones") include.push("capitulos");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
		// Obtiene avatar original
		let imgDerPers = original.avatar;
		imgDerPers = imgDerPers
			? (!imgDerPers.startsWith("http") ? "/imagenes/2-Avatar-Prods-Revisar/" : "") + imgDerPers
			: "/imagenes/0-Base/Avatar/Prod-Avatar-Generico.jpg";
		// Configura el título de la vista
		const prodNombre = comp.obtieneEntidadNombre(entidad);
		const titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Ayuda para el titulo
		const ayudasTitulo = [
			"Necesitamos que nos digas si estás de acuerdo en que está alineado con nuestro perfil.",
			"Si considerás que no, te vamos a pedir que nos digas el motivo.",
		];
		// Info para el bloque Izquierdo
		// Primer proceso: hace más legible la información
		const infoProcesada = procsProd.bloqueIzq(original);
		// Segundo proceso: reagrupa la información
		let bloqueIzq = {masInfoIzq: [], masInfoDer: [], actores: infoProcesada.actores};
		if (infoProcesada.infoGral.length) {
			let infoGral = infoProcesada.infoGral;
			for (let i = 0; i < infoGral.length / 2; i++) {
				// Agrega un dato en 'masInfoIzq'
				bloqueIzq.masInfoIzq.push(infoGral[i]);
				// Agrega un dato en 'masInfoDer'
				let j = parseInt(infoGral.length / 2 + 0.5 + i);
				if (j < infoGral.length) bloqueIzq.masInfoDer.push(infoGral[j]);
			}
		}

		// Bloque Derecho
		const bloqueDer = [[], await procesos.fichaDelUsuario(original.sugerido_por_id, petitFamilia)];
		// Info para la vista
		const status_registro_id = original.status_registro_id;
		const statusCreado = status_registro_id == creado_id;
		const links = await procsProd.obtieneLinksDelProducto(entidad, id, [creado_id, aprobado_id, recuperar_id]);
		const status_id = status_registro_id;

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen: "TE"},
			...{entidad, id, familia, status_id, statusCreado},
			...{prodNombre, registro: original, links},
			...{imgDerPers, tituloImgDerPers: original.nombre_castellano},
			...{bloqueIzq, bloqueDer, RCLVs: []},
			// title: original.nombre_castellano,motivos
			...{urlActual: req.session.urlActual, cartelRechazo: true},
		});
	},
	inacRecup_Form: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		// códigos posibles: 'rechazo', 'inactivar-o-recuperar'
		let codigo = req.path.slice(1, -1);
		codigo = codigo.slice(codigo.indexOf("/") + 1);
		const inactivarRecuperar = codigo == "inactivar-o-recuperar";

		// Más variables
		const {entidad, id} = req.query;
		const familia = comp.obtieneFamilia(entidad);
		const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);
		let imgDerPers, bloqueDer, cantProds, motivos, procCanoniz, RCLVnombre, prodsDelRCLV;

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("status_registro", "creado_por", "sugerido_por", "motivo");
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		if (familia == "rclv") include.push(...variables.entidadesProd);
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// Obtiene el subcodigo
		const status_original_id = original.status_registro_id;
		const subcodigo =
			status_original_id == inactivar_id ? "inactivar" : status_original_id == recuperar_id ? "recuperar" : "";

		// Obtiene el título
		const a = entidad == "peliculas" || entidad == "colecciones" ? "a " : " ";
		const entidadNombre = comp.obtieneEntidadNombre(entidad);
		const preTitulo = inactivarRecuperar ? "Revisión de " + comp.inicialMayus(subcodigo) : comp.inicialMayus(codigo);
		const titulo = preTitulo + " un" + a + entidadNombre;

		// Ayuda para el titulo
		const ayudasTitulo = inactivarRecuperar
			? [
					"Para tomar una decisión contraria a la del usuario, vamos a necesitar que escribas un comentario para darle feedback.",
			  ]
			: ["Por favor decinos por qué sugerís " + codigo + " este registro."];

		// Cantidad de productos asociados al RCLV
		if (familia == "rclv") {
			prodsDelRCLV = await procsRCLV.detalle.prodsDelRCLV(original);
			cantProds = prodsDelRCLV.length;
			procCanoniz = procsRCLV.detalle.procCanoniz(original);
			RCLVnombre = original.nombre;
		}

		// Datos Breves
		bloqueDer = [
			procsCRUD.bloqueRegistro({...original, entidad}, cantProds),
			await procesos.fichaDelUsuario(original.sugerido_por_id, petitFamilia),
		];

		// Imagen Personalizada
		imgDerPers =
			familia == "producto" ? procsCRUD.obtieneAvatarProd(original).orig : procsCRUD.obtieneAvatarRCLV(original).orig;

		// Motivos de rechazo
		if (codigo == "inactivar" || codigo == "rechazo") motivos = motivos_rech_altas.filter((n) => n[petitFamilia]);

		// Comentario del rechazo
		const comentarios = inactivarRecuperar
			? await BD_genericas.obtieneTodosPorCampos("historial_cambios_de_status", {entidad, entidad_id: id}).then((n) =>
					n.map((m) => m.comentario)
			  )
			: [];

		// Obtiene datos para la vista
		if (entidad == "capitulos")
			original.capitulos = await BD_especificas.obtieneCapitulos(original.coleccion_id, original.temporada);
		const tituloMotivo =
			subcodigo == "recuperar" ? "estuvo 'Inactivo'" : subcodigo == "inactivar" ? "está en 'Inactivar'" : "";

		// Render del formulario
		// return res.send(bloqueDer);
		return res.render("CMP-0Estructura", {
			...{tema, codigo, subcodigo, titulo, ayudasTitulo, origen: "TE", tituloMotivo},
			...{entidad, id, entidadNombre, familia, comentarios, urlActual: req.originalUrl},
			...{registro: original, imgDerPers, bloqueDer, motivos, procCanoniz, RCLVnombre, prodsDelRCLV},
			cartelGenerico: true,
		});
	},
	prodRCLV_Guardar: async (req, res) => {
		// Variables
		let datos = await procesos.guardar(req);
		const {entidad, id, original, status_original_id, status_final_id} = {...datos};
		const {inactivarRecuperar, codigo, subcodigo, rclv, motivo_id, comentario, aprob} = {...datos};
		const userID = original.sugerido_por_id;
		const revID = req.session.usuario.id;
		const ahora = comp.ahora();
		const campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
		const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);
		const campoDecision = petitFamilia + (aprob ? "_aprob" : "_rech");

		// Acciones si es un RCLV y un alta aprobada
		if (rclv && subcodigo == "alta") {
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

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		// 1.A. Datos que se necesitan con seguridad
		datos = {sugerido_por_id: revID, sugerido_en: ahora, status_registro_id: status_final_id, motivo_id};
		// 1.B. Datos sólo si es un alta/rechazo
		if (!inactivarRecuperar) {
			datos.alta_revisada_por_id = revID;
			datos.alta_revisada_en = ahora;
			datos.lead_time_creacion = comp.obtieneLeadTime(original.creado_en, ahora);
		}
		// 1.C. Actualiza el registro
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// 2. Si es una colección, actualiza sus capítulos con el mismo status
		if (entidad == "colecciones")
			BD_genericas.actualizaTodosPorCampos("capitulos", {coleccion_id: id}, {...datos, sugerido_por_id: 2});

		// 3. Si es un RCLV y es aprobado, actualiza la tabla de edics_aprob/rech y esos mismos campos en el usuario
		if (rclv && subcodigo == "alta") procesos.alta.rclvEdicAprobRech(entidad, original, revID);

		// 4. Agrega un registro en el historial_cambios_de_status
		// 4.A. Genera la información
		let datosHist = {
			...{entidad, entidad_id: id},
			...{sugerido_por_id: userID, sugerido_en: original.sugerido_en, status_original_id},
			...{revisado_por_id: revID, revisado_en: ahora, status_final_id},
			...{aprobado: aprob, motivo_id},
		};
		// 4.B. Agrega una 'duración' sólo si el usuario intentó un "aprobado"
		const motivo =
			codigo == "rechazo" || (!aprob && codigo == "recuperar") ? motivos_rech_altas.find((n) => n.id == motivo_id) : {};
		if (motivo.duracion) datosHist.duracion = Number(motivo.duracion);
		if (comentario) datosHist.comentario = comentario;
		BD_genericas.agregaRegistro("historial_cambios_de_status", datosHist);

		// 5. Aumenta el valor de regs_aprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", userID, campoDecision, 1);

		// 6. Penaliza al usuario si corresponde
		if (datosHist.duracion) comp.usuarioPenalizAcum(userID, motivo, petitFamilia);

		// 7 Si es un RCLV inactivo, borra su id de los campos rclv_id de las ediciones de producto
		if (rclv && status_final_id == "inactivo")
			BD_genericas.actualizaTodosPorCampos("prods_edicion", {[campo_id]: id}, {[campo_id]: null});

		// 8. Acciones si es un producto inactivo
		// Elimina el archivo de avatar de la edicion
		// Elimina las ediciones de producto que tenga
		if (!rclv && status_final_id == "inactivo") procesos.alta.prodRech(entidad, id, userID);

		// 9. Si es un producto, actualiza los RCLV en el campo 'prods_aprob'
		if (!rclv) procsCRUD.cambioDeStatus(entidad, original);

		// Fin
		// Si es un producto creado y fue aprobado, redirecciona a una edición
		if (!rclv && codigo == "alta") return res.redirect(req.baseUrl + "/producto/edicion/?entidad=" + entidad + "&id=" + id);
		// En los demás casos, redirecciona al tablero
		else return res.redirect("/revision/tablero-de-control");
	},

	// EDICION
	prodRCLV_edicForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		let codigo = "producto/edicion"; // No se puede poner 'const', porque más adelante puede cambiar

		// Variables
		const {entidad, id, edicion_id: edicID} = req.query;
		const familia = comp.obtieneFamilia(entidad);
		const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);
		let avatarExterno, avatarLinksExternos, avatar, imgDerPers;
		let ingresos, reemplazos, bloqueDer, motivos;

		// Obtiene la versión original con include
		let include = [...comp.obtieneTodosLosCamposInclude(entidad), "status_registro", "creado_por", "sugerido_por"];
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

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
			let cantProds;
			if (familia == "rclv") cantProds = await procsRCLV.detalle.prodsDelRCLV(original).then((n) => n.length);
			bloqueDer = familia == "rclv" ? [procsCRUD.bloqueRegistro({...original, entidad}, cantProds)] : [[]];
			bloqueDer.push(await procesos.fichaDelUsuario(edicion.editado_por_id, petitFamilia));
			avatar = procsCRUD.obtieneAvatarProd(original).orig;
			imgDerPers = avatar;
			motivos = motivos_rech_edic.filter((m) => m.prods);
			// Achica la edición a su mínima expresión
			[edicion] = await procsCRUD.puleEdicion(entidad, original, edicion);
			// Fin, si no quedan campos
			if (!edicion) return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});
			// Obtiene los ingresos y reemplazos
			[ingresos, reemplazos] = await procesos.edicion.prodEdicForm_ingrReempl(original, edicion);
		}
		// Variables para la vista
		const prodNombre = comp.obtieneEntidadNombre(entidad);
		const titulo = "Revisión de la Edición de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Ayuda para el titulo
		const ayudasTitulo = [
			"Necesitamos que nos digas si estás de acuerdo con la información editada.",
			"Si considerás que no, te vamos a pedir que nos digas el motivo.",
		];
		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, title: original.nombre_castellano, ayudasTitulo, origen: "TE"},
			...{entidad, id, familia, registro: original, prodOrig: original, prodEdic: edicion, prodNombre},
			...{ingresos, reemplazos, motivos, bloqueDer, urlActual: req.session.urlActual},
			...{avatar, avatarExterno, avatarLinksExternos, imgDerPers},
			...{omitirImagenDerecha: codigo.includes("avatar"), omitirFooter: codigo.includes("avatar")},
			...{cartelGenerico: true, cartelRechazo: codigo.includes("avatar")},
		});
	},
	prod_AvatarGuardar: async (req, res) => {
		// Obtiene la respuesta del usuario
		const {entidad, id, edicion_id: edicID, rechazo, motivo_id} = {...req.query, ...req.body};

		// Variables
		let revID = req.session.usuario.id;
		let original = await BD_genericas.obtienePorId(entidad, id);
		let edicion = await BD_genericas.obtienePorId("prods_edicion", edicID);
		let campo = "avatar";
		let aprob = !rechazo;

		// 1. PROCESOS PARTICULARES PARA AVATAR
		await procesos.edicion.procsParticsAvatar({entidad, original, edicion, aprob});
		delete edicion.avatar_url;

		// 2. PROCESOS COMUNES A TODOS LOS CAMPOS
		[edicion] = await procesos.edicion.edicAprobRech({entidad, original, edicion, revID, campo, aprob, motivo_id});

		// Fin
		if (edicion) return res.redirect(req.originalUrl);
		else return res.redirect("/revision/tablero-de-control");
	},

	// LINKS
	linksForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionEnts";
		const codigo = "abmLinks";
		// Otras variables
		const {entidad, id} = req.query;
		let userID = req.session.usuario.id;
		let include;
		// Configurar el título
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo = "Revisar los Links de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtiene el prodOrig con sus links originales para verificar que los tenga
		include = ["links", "status_registro"];
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		let producto = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// RESUMEN DE PROBLEMAS DE PRODUCTO A VERIFICAR
		let informacion = procesos.problemasProd(producto, req.session.urlAnterior);
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Obtiene todos los links
		let campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
		include = ["status_registro", "ediciones", "prov", "tipo", "motivo"];
		let links = await BD_genericas.obtieneTodosPorCamposConInclude("links", {[campo_id]: id}, include);
		links.sort((a, b) => a.id - b.id);

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
			...{tema, codigo, titulo, origen: "TE"},
			...{entidad, id, registro: producto, prodOrig: producto, avatar, userID, familia: "producto"},
			...{links, links_provs, links_tipos, motivos},
			...{camposARevisar, calidades: variables.calidades},
			...{imgDerPers: procsCRUD.obtieneAvatarProd(producto, "").orig, cartelGenerico: true},
		});
	},
};
