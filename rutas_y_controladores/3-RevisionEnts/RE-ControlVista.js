"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const procesos = require("./RE-Procesos");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procsProd = require("../2.1-Prod-RUD/PR-FN-Procesos");
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Procesos");
const validaRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Validar");
const procsLinks = require("../2.3-Links-CRUD/LK-FN-Procesos");

module.exports = {
	// TABLERO
	tableroControl: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		const codigo = "tableroControl";
		let revID = req.session.usuario.id;
		// Definir variables
		const ahora = comp.fechaHora.ahora();
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
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);

		// Obtiene el registro original
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("status_registro", "creado_por", "sugerido_por");
		if (entidad == "colecciones") include.push("capitulos");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
		// Obtiene avatar original
		let imgDerPers = original.avatar;
		imgDerPers = imgDerPers
			? (!imgDerPers.includes("/") ? "/imagenes/2-Productos/Revisar/" : "") + imgDerPers
			: "/imagenes/0-Base/Avatar/Prod-Generico.jpg";
		// Configura el título de la vista
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;
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
		const bloqueDer = [[], await procesos.fichaDelUsuario(original.sugerido_por_id, petitFamilias)];
		// Info para la vista
		const status_registro_id = original.status_registro_id;
		const statusCreado = status_registro_id == creado_id;
		const links = await procsProd.obtieneLinksDelProducto(entidad, id, [creado_id, aprobado_id, recuperar_id]);
		const status_id = status_registro_id;

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen: "TE"},
			...{entidad, id, familia, status_id, statusCreado},
			...{entidadNombre, registro: original, links},
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
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const revisor = req.session.usuario && req.session.usuario.rol_usuario.revisor_ents;
		let imgDerPers, bloqueDer, cantProds, motivos, procCanoniz, RCLVnombre, prodsDelRCLV;

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("status_registro", "creado_por", "sugerido_por", "alta_revisada_por", "motivo");
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		if (familia == "rclv") include.push(...variables.entidades.prods);
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// Obtiene el subcodigo
		const status_original_id = original.status_registro_id;
		const subcodigo =
			status_original_id == inactivar_id ? "inactivar" : status_original_id == recuperar_id ? "recuperar" : "";

		// Obtiene el título
		const a = entidad == "peliculas" || entidad == "colecciones" ? "a " : " ";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
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
			procsCRUD.bloqueRegistro({registro: {...original, entidad}, revisor, cantProds}),
			await procesos.fichaDelUsuario(original.sugerido_por_id, petitFamilias),
		];

		// Imagen Personalizada
		imgDerPers = procsCRUD.obtieneAvatar(original).orig;

		// Motivos de rechazo
		if (codigo == "inactivar" || codigo == "rechazo") motivos = motivos_status.filter((n) => n[petitFamilias]);

		// Comentario del rechazo
		const comentarios = inactivarRecuperar
			? await BD_genericas.obtieneTodosPorCondicion("hist_status", {entidad, entidad_id: id}).then((n) =>
					n.map((m) => m.comentario)
			  )
			: [];

		// Obtiene datos para la vista
		if (entidad == "capitulos")
			original.capitulos = await BD_especificas.obtieneCapitulos(original.coleccion_id, original.temporada);
		const tituloMotivo =
			subcodigo == "recuperar" ? "estuvo 'Inactivo'" : subcodigo == "inactivar" ? "está en 'Inactivar'" : "";
		const status_id = original.status_registro_id;

		// Render del formulario
		// return res.send({tema, codigo, subcodigo, tituloMotivo});
		return res.render("CMP-0Estructura", {
			...{tema, codigo, subcodigo, titulo, ayudasTitulo, origen: "TE", tituloMotivo},
			...{entidad, id, entidadNombre, familia, comentarios, urlActual: req.originalUrl},
			...{registro: original, imgDerPers, bloqueDer, motivos, procCanoniz, RCLVnombre, prodsDelRCLV, status_id, cantProds},
			cartelGenerico: true,
		});
	},
	prodRCLV_ARIR_guardar: async (req, res) => {
		// Variables
		let datos = await procesos.guardar.obtieneDatos(req);
		const {entidad, id, original, status_original_id, status_final_id} = {...datos};
		const {inactivarRecuperar, codigo, subcodigo, rclv, motivo_id, comentario, aprob} = {...datos};
		const userID = original.sugerido_por_id;
		const revID = req.session.usuario.id;
		const ahora = comp.fechaHora.ahora();
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const campoDecision = petitFamilias + (aprob ? "_aprob" : "_rech");
		const revisor = req.session.usuario && req.session.usuario.rol_usuario.revisor_ents;
		datos = {};

		// Acciones si es un RCLV
		if (rclv) {
			// Variables
			datos.avatar = req.file ? req.file.filename : original.avatar;

			// Acciones para alta
			if (subcodigo == "alta") {
				// Obtiene los datos
				datos = {...datos, ...req.body, ...req.query, revisor, opcional: true};

				// Si recibimos un avatar, se completa la información
				if (req.file) datos.tamano = req.file.size;

				// Averigua si hay errores de validación y toma acciones
				let errores = await validaRCLV.consolidado(datos);
				if (errores.hay) {
					// Guarda session y cookie
					req.session[entidad] = datos;
					res.cookie(entidad, datos, {maxAge: unDia});

					// Si se agregó un archivo avatar, lo elimina
					if (req.file) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio/", datos.avatar);

					// Fin
					return res.redirect(req.originalUrl);
				}

				// Procesa los datos del Data Entry
				datos = procsRCLV.altaEdicGuardar.procesaLosDatos(datos);

				// Acciones si recibimos un avatar
				if (req.file) {
					// Lo mueve de 'Provisorio' a 'Final'
					comp.gestionArchivos.mueveImagen(datos.avatar, "9-Provisorio", "2-RCLVs/Final");
					// Elimina el eventual anterior
					if (original.avatar) comp.gestionArchivos.elimina("./publico/imagenes/2-RCLVs/Revisar/", original.avatar);
				}
				// Si no recibimos un avatar y hay avatar en original, lo mueve de 'Revisar' a 'Final'
				else if (original.avatar) comp.gestionArchivos.mueveImagen(original.avatar, "2-RCLVs/Revisar", "2-RCLVs/Final");

				// Acciones si es un registro de 'epocas_del_ano'
				if (entidad == "epocas_del_ano") {
					// Si tiene imagen, la copia en su carpeta
					if (datos.avatar) {
						const archivo_avatar = "3-EpocasDelAno/" + datos.carpeta_avatars + "/" + datos.avatar;
						comp.gestionArchivos.copiaImagen("2-RCLVs/Final" + datos.avatar, archivo_avatar);
					}

					// Actualiza los dias_del_ano
					const desde = datos.dia_del_ano_id;
					const duracion = parseInt(datos.dias_de_duracion) - 1;
					await procesos.guardar.actualizaDiasDelAno({desde, duracion, id});
				}
			}

			// Acciones para rechazo
			if (subcodigo == "rechazo") {
				// Si hay avatar en original, lo mueve de 'Revisar' a 'Final'
				if (original.avatar) comp.gestionArchivos.mueveImagen(original.avatar, "2-RCLVs/Revisar", "2-RCLVs/Final");
				// Si se había agregado un archivo, lo elimina
				if (req.file) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio/", datos.avatar);
			}

			// Acciones si es un RCLV inactivo
			if (status_final_id == inactivo_id) {
				// Borra su id de los campos rclv_id de las ediciones de producto
				BD_genericas.actualizaTodosPorCondicion("prods_edicion", {[campo_id]: id}, {[campo_id]: null});

				// Sus productos asociados:
				// Dejan de estar vinculados
				// Si no pasan el control de error y estaban aprobados, pasan al status 'creado_aprob'
				await procesos.guardar.prodsAsocs(entidad, id);
			}
		}

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		// 1.A. Datos que se necesitan con seguridad
		datos = {...datos, sugerido_por_id: revID, sugerido_en: ahora, status_registro_id: status_final_id, motivo_id};
		// 1.B. Datos sólo si es un alta/rechazo
		if (!inactivarRecuperar) {
			datos.alta_revisada_por_id = revID;
			datos.alta_revisada_en = ahora;
			datos.lead_time_creacion = comp.obtieneLeadTime(original.creado_en, ahora);
		}
		// 1.C. Actualiza el registro --> es crítico el uso del 'await'
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// 2. Si es una colección, actualiza sus capítulos con el mismo status
		if (entidad == "colecciones")
			BD_genericas.actualizaTodosPorCondicion("capitulos", {coleccion_id: id}, {...datos, sugerido_por_id: 2});

		// 3. Si es un RCLV y es aprobado, actualiza la tabla de edics_aprob/rech y esos mismos campos en el usuario --> debe estar después de que se grabó el original
		if (rclv && subcodigo == "alta") procesos.alta.rclvEdicAprobRech(entidad, original, revID);

		// 4. Agrega un registro en el hist_status
		// 4.A. Genera la información
		let datosHist = {
			...{entidad, entidad_id: id},
			...{sugerido_por_id: userID, sugerido_en: original.sugerido_en, status_original_id},
			...{revisado_por_id: revID, revisado_en: ahora, status_final_id},
			...{aprobado: aprob, motivo_id, comentario},
		};
		// 4.B. Agrega una 'duración' sólo si el usuario intentó un status "aprobado"
		const motivo =
			codigo == "rechazo" || (!aprob && codigo == "recuperar") ? motivos_status.find((n) => n.id == motivo_id) : {};
		if (motivo.duracion) datosHist.duracion = Number(motivo.duracion);
		// 4.C. Guarda los datos históricos
		BD_genericas.agregaRegistro("hist_status", datosHist);

		// 5. Aumenta el valor de regs_aprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", userID, campoDecision, 1);

		// 6. Penaliza al usuario si corresponde
		if (datosHist.duracion) comp.usuarioPenalizAcum(userID, motivo, petitFamilias);

		// 7. Acciones si es un registro inactivo
		// Elimina el archivo de avatar de la edicion
		// Elimina las ediciones que tenga
		if (status_final_id == inactivo_id) procesos.guardar.prodRclvRech(entidad, id);

		// 8. Si es un producto, actualiza los RCLV en el campo 'prods_aprob' --> debe estar después de que se grabó el original
		if (!rclv) procsCRUD.cambioDeStatus(entidad, original);

		// 9. Si se aprobó un 'recuperar' y el avatar original es un url, descarga el archivo avatar y actualiza el registro 'original'
		if (subcodigo == "recuperar" && aprob && original.avatar && original.avatar.includes("/"))
			procesos.descargaAvatar(original, entidad);

		// Fin
		// Si es un producto creado y fue aprobado, redirecciona a una edición
		if (!rclv && codigo == "alta") return res.redirect(req.baseUrl + "/producto/edicion/?entidad=" + entidad + "&id=" + id);
		// En los demás casos, redirecciona al tablero
		else return res.redirect("/revision/tablero-de-control");
	},
	solapamGuardar: async (req, res) => {
		// Variables
		const {entidad, id} = req.query;
		const revID = req.session.usuario.id;
		const ahora = comp.fechaHora.ahora();
		let datos = {...req.body, entidad}; // la 'entidad' hace falta para una función posterior

		// Averigua si hay errores de validación y toma acciones
		let errores = await validaRCLV.fecha(datos);
		if (errores) {
			// Guarda session y cookie
			req.session.epocas_del_ano = datos;
			res.cookie("epocas_del_ano", datos, {maxAge: unDia});

			// Fin
			return res.redirect(req.originalUrl);
		}

		// Procesa los datos del Data Entry
		datos = procsRCLV.altaEdicGuardar.procesaLosDatos(datos);
		for (let campo in datos) if (datos[campo] === null) delete datos[campo];

		// Actualiza los dias_del_ano
		const desde = datos.dia_del_ano_id;
		const duracion = parseInt(datos.dias_de_duracion) - 1;
		await procesos.guardar.actualizaDiasDelAno({desde, duracion, id});

		// Actualiza el registro original
		datos = {...datos, solapamiento: false, editado_por_id: revID, editado_en: ahora};
		await BD_genericas.actualizaPorId("epocas_del_ano", id, datos);

		// Fin
		return res.redirect("/revision/tablero-de-control");
	},

	// EDICION
	prodRCLV_edicForm: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		let codigo = req.path.slice(1, -1); // No se puede poner 'const', porque más adelante puede cambiar

		// Variables
		const {entidad, id, edicID} = req.query;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const edicEntidad = comp.obtieneDesdeEntidad.entidadEdic(entidad);
		const revisor = req.session.usuario && req.session.usuario.rol_usuario.revisor_ents;
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const articulo = entidad == "peliculas" || entidad == "colecciones" || entidad == "epocas_del_ano" ? " la " : "l ";
		let avatarExterno, avatarsExternos, avatar, imgDerPers;
		let ingresos, reemplazos, bloqueDer, motivos, cantProds, titulo, ayudasTitulo;

		// Obtiene la versión original con include
		let include = [
			...comp.obtieneTodosLosCamposInclude(entidad),
			"status_registro",
			"creado_por",
			"sugerido_por",
			"alta_revisada_por",
		];
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		if (familia == "rclv") include.push(...variables.entidades.prods);
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// Obtiene la edición
		let edicion = await BD_genericas.obtienePorId(edicEntidad, edicID);
		//return res.send({original,edicion})

		// Acciones si el avatar está presente en la edición
		if (edicion.avatar) {
			// Averigua si se debe reemplazar el avatar en forma automática
			let reemplAvatarAutomaticam =
				edicion.avatar && // Que en la edición, el campo 'avatar' tenga un valor
				original.avatar && // Que en el original, el campo 'avatar' tenga un valor
				original.avatar == edicion.avatar_url; // Mismo url para los campos 'original.avatar' y 'edicion.avatar_url'
			// Reemplazo automático
			if (reemplAvatarAutomaticam) {
				// Avatar: impacto en los archivos de avatar (original y edicion)
				await procesos.edicion.procsParticsAvatar({entidad, original, edicion, aprob: true});
				// REGISTRO ORIGINAL: actualiza el campo 'avatar' en el registro original
				await BD_genericas.actualizaPorId(entidad, original.id, {avatar: edicion.avatar});
				// REGISTRO EDICION: borra los campos de 'avatar' en el registro de edicion
				await BD_genericas.actualizaPorId("prods_edicion", edicion.id, {avatar: null, avatar_url: null});
				// Recarga la ruta
				return res.redirect(req.originalUrl);
			}
			// Reemplazo manual - Variables
			codigo += "/avatar";
			avatar = procsCRUD.obtieneAvatar(original, edicion);
			motivos = motivos_edics.filter((m) => m.avatar_prods);
			avatarExterno = !avatar.orig.includes("/imagenes/");
			const nombre = petitFamilias == "prods" ? original.nombre_castellano : original.nombre;
			avatarsExternos = variables.avatarsExternos(nombre);
			titulo = "Revisión de la Imagen: " + nombre;
		}
		// Acciones si el avatar no está presente en la edición
		else if (!edicion.avatar) {
			// Actualiza el avatar original si es un url
			if (original.avatar && original.avatar.includes("/") && entidad != "capitulos") {
				// Descarga el archivo avatar y actualiza el registro 'original'
				procesos.descargaAvatar(original, entidad);
				// Actualiza el registro 'edición'
				edicion.avatar_url = null;
				const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
				BD_genericas.actualizaPorId(entidadEdic, edicID, {avatar: null, avatar_url: null});
			}
			// Variables
			if (familia == "rclv") cantProds = await procsRCLV.detalle.prodsDelRCLV(original).then((n) => n.length);
			bloqueDer = [procsCRUD.bloqueRegistro({registro: {...original, entidad}, revisor})];
			bloqueDer.push(await procesos.fichaDelUsuario(edicion.editado_por_id, petitFamilias));
			imgDerPers = procsCRUD.obtieneAvatar(original).orig;
			motivos = motivos_edics.filter((m) => m.prods);
			// Achica la edición a su mínima expresión
			[edicion] = await procsCRUD.puleEdicion(entidad, original, edicion);
			// Fin, si no quedan campos
			if (!edicion) return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});
			// Obtiene los ingresos y reemplazos
			[ingresos, reemplazos] = await procesos.edicion.ingrReempl(original, edicion);
			// Variables para la vista
			titulo = "Revisión de la Edición de" + articulo + entidadNombre;
			ayudasTitulo = [
				"Necesitamos que nos digas si estás de acuerdo con la información editada.",
				"Si considerás que no, te vamos a pedir que nos digas el motivo.",
			];
		}
		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, title: original.nombre_castellano, ayudasTitulo, origen: "TE"},
			...{entidad, id, familia, registro: original, prodOrig: original, prodEdic: edicion, entidadNombre, cantProds},
			...{ingresos, reemplazos, motivos, bloqueDer, urlActual: req.session.urlActual},
			...{avatar, avatarExterno, avatarsExternos, imgDerPers},
			...{omitirImagenDerecha: codigo.includes("avatar"), omitirFooter: codigo.includes("avatar")},
			...{cartelGenerico: true, cartelRechazo: codigo.includes("avatar")},
		});
	},
	prod_AvatarGuardar: async (req, res) => {
		// Obtiene la respuesta del usuario
		const {entidad, id, edicID, rechazo, motivo_id} = {...req.query, ...req.body};

		// Variables
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const revID = req.session.usuario.id;
		const original = await BD_genericas.obtienePorId(entidad, id);
		const campo = "avatar";
		const aprob = !rechazo;
		let edicion = await BD_genericas.obtienePorId(petitFamilias + "_edicion", edicID);

		// 1. PROCESOS PARTICULARES PARA AVATAR
		await procesos.edicion.procsParticsAvatar({entidad, original, edicion, aprob});
		if (petitFamilias == "prods") delete edicion.avatar_url;

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
		let entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		let titulo = "Revisar los Links de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;
		// Obtiene el prodOrig con sus links originales para verificar que los tenga
		include = ["links", "status_registro"];
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		let producto = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// RESUMEN DE PROBLEMAS DE PRODUCTO A VERIFICAR
		let informacion = procesos.problemasProd(producto, req.session.urlAnterior);
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Obtiene todos los links
		let campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		include = ["status_registro", "ediciones", "prov", "tipo", "motivo"];
		let links = await BD_genericas.obtieneTodosPorCondicionConInclude("links", {[campo_id]: id}, include);
		links.sort((a, b) => a.id - b.id);
		for (let link of links) link.cond = procsLinks.condiciones(link, userID, tema);

		// Información para la vista
		const avatar = producto.avatar
			? (!producto.avatar.includes("/") ? "/imagenes/2-Productos/Final/" : "") + producto.avatar
			: "/imagenes/0-Base/Avatar/Prod-Generico.jpg";
		const motivos = motivos_status.filter((n) => n.links).map((n) => ({id: n.id, descripcion: n.descripcion}));
		const camposARevisar = variables.camposRevisar.links.map((n) => n.nombre);
		const imgDerPers = procsCRUD.obtieneAvatar(producto).orig;

		// Va a la vista
		//return res.send(links)
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, origen: "TE"},
			...{entidad, id, registro: producto, prodOrig: producto, avatar, userID, familia: "producto"},
			...{links, links_provs, links_tipos, motivos},
			...{camposARevisar, calidades: variables.calidades},
			...{imgDerPers, cartelGenerico: true},
		});
	},
};
