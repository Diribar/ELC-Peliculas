"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");
const validacsFM = require("../2.0-Familias/FM-FN-Validar");
const procsProd = require("../2.1-Prods-RUD/PR-FN-Procesos");
const procsRCLV = require("../2.2-RCLVs/RCLV-FN-Procesos");
const validaRCLV = require("../2.2-RCLVs/RCLV-FN-Validar");
const procsLinks = require("../2.3-Links/LK-FN-Procesos");
const procesos = require("./RE-Procesos");

module.exports = {
	// Tablero
	tableroEntidades: async (req, res) => {
		// Variables
		const tema = "revisionEnts";
		const codigo = "tableroControl";
		const revId = req.session.usuario.id;

		// Productos y RCLVs
		let prodsRclvs = procesos.tablRevision.obtieneProdsRclvs(); // Correcciones de Motivo y Status

		// Productos y Ediciones
		let prods1 = procesos.tablRevision.obtieneProds1(revId); // Altas y Ediciones
		let prods2 = procesos.tablRevision.obtieneProds2(revId); // Pendientes de aprobar sinEdición,
		let prods3 = procesos.tablRevision.obtieneProds3(); // películas y colecciones repetidas

		// RCLV
		let rclvs1 = procesos.tablRevision.obtieneRCLVs1(revId);
		let rclvs2 = procesos.tablRevision.obtieneRCLVs2(revId);

		// Links
		let sigProd = procesos.tablRevision.obtieneSigProd_Links(revId);

		// Espera a que se actualicen todos los resultados
		let datos = [prods1, prods2, prods3, rclvs1, rclvs2, sigProd];
		[prods1, prods2, prods3, rclvs1, rclvs2, sigProd] = await Promise.all(datos);
		let prods = {...prods1, ...prods2, ...prods3};
		let rclvs = {...rclvs1, ...rclvs2};

		// Consolida las altas de productos
		let AL = [...prods1.AL_conEdicion, ...prods2.AL_sinEdicion];
		delete prods1.AL_conEdicion;
		delete prods2.AL_sinEdicion;
		AL.sort((a, b) => b.fechaRef - a.fechaRef);
		prods.AL = AL;

		// Consolida y procesa los productos y RCLVs
		prodsRclvs = procesos.procesaCampos.prodsRclvs(prodsRclvs);
		prods = procesos.procesaCampos.prods(prods);
		rclvs = procesos.procesaCampos.rclvs(rclvs);

		// Obtiene información para la vista
		const dataEntry = req.session.tableros && req.session.tableros.entidades ? req.session.tableros.entidades : {};
		const mostrarRclvs = Object.values(rclvs).reduce((acum, i) => acum + i.length, 0);

		// Va a la vista
		//return res.send(prodsRclvs);
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Tablero de Entidades"},
			...{prodsRclvs, prods, rclvs, sigProd, origen: "TE", dataEntry, mostrarRclvs},
		});
	},
	// Tablero de mantenimiento
	tableroMantenim: async (req, res) => {
		// Variables
		const tema = "mantenimiento";
		const codigo = "tableroControl";
		const userId = req.session.usuario.id;
		const omnipotente = req.session.usuario.rolUsuario_id == rolOmnipotente_id;

		// Productos
		let prods = procesos.tablManten.obtieneProds(userId).then((n) => procesos.procesaCampos.prods(n));
		let rclvs = procesos.tablManten.obtieneRCLVs(userId).then((n) => procesos.procesaCampos.rclvs(n));
		let prodsConLinksInactivos = procesos.tablManten
			.obtieneLinksInactivos(userId)
			.then((n) => procesos.procesaCampos.prods(n));

		// RCLVs
		[prods, rclvs, prodsConLinksInactivos] = await Promise.all([prods, rclvs, prodsConLinksInactivos]);

		// Une Productos y Links
		prods = {...prods, ...prodsConLinksInactivos};

		// Obtiene información para la vista
		const dataEntry = req.session.tableros && req.session.tableros.mantenimiento ? req.session.tableros.mantenimiento : {};

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Tablero de Mantenimiento", origen: "TM"},
			...{prods, rclvs, omnipotente},
			dataEntry,
		});
	},

	// Cambios de status
	altaProdForm: async (req, res) => {
		// Variables
		const tema = "revisionEnts";
		const codigo = "producto/alta";
		const {entidad, id} = req.query;
		const origen = req.query.origen ? req.query.origen : "TE";
		const familia = comp.obtieneDesdeEntidad.familia(entidad);

		// Obtiene el registro original
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("statusRegistro", "creadoPor", "statusSugeridoPor");
		if (entidad == "colecciones") include.push("capitulos");
		if (entidad == "capitulos") include.push("coleccion");
		const original = await baseDeDatos.obtienePorId(entidad, id, include);

		// Obtiene avatar original
		let imgDerPers = original.avatar;
		imgDerPers = imgDerPers
			? (!imgDerPers.includes("/") ? "/Externa/2-Productos/Revisar/" : "") + imgDerPers
			: "/publico/imagenes/Avatar/Prod-Generico.jpg";

		// Configura el título de la vista
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;
		// Ayuda para el titulo
		const ayudasTitulo = [
			"Necesitamos que nos digas si estás de acuerdo en que está alineado con nuestro perfil.",
			"Si considerás que no, te vamos a pedir que nos digas el motivo.",
		];

		// Info para el bloque Izquierdo
		const {infoGral, actores} = procsProd.bloqueIzq(original);
		const bloqueIzq = {infoGral, actores};

		// Bloque Derecho
		const bloqueDer = {
			registro: await procsFM.bloques.registro({...original, entidad}),
			usuario: await procsFM.bloques.usuario(original.statusSugeridoPor_id, entidad),
		};

		// Info para la vista
		const statusRegistro_id = original.statusRegistro_id;
		const statusCreado = statusRegistro_id == creado_id;
		const statusLink_id = [creado_id, aprobado_id, recuperar_id];
		const links = await procsProd.obtieneLinksDelProducto({entidad, id, statusLink_id, origen: "RPA"});
		const status_id = statusRegistro_id;
		const asocs = variables.entidades.asocRclvs;

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen},
			...{entidad, id, familia, status_id, statusCreado},
			...{entidadNombre, registro: original, links},
			...{imgDerPers, tituloImgDerPers: original.nombreCastellano},
			...{bloqueIzq, bloqueDer, RCLVs: [], asocs},
			...{urlActual: req.session.urlActual, cartelRechazo: true},
		});
	},
	cambioStatusGuardar: async (req, res) => {
		// Variables
		let datos = await procesos.guardar.obtieneDatos(req);
		const {entidad, id, origen, original, statusOriginal_id, statusFinal_id} = datos;
		const {codigo, producto, rclv, motivo_id, comentario, aprobado} = datos;
		const {cola, revId, ahora, revisorPERL, petitFamilias, baseUrl, userId, campoDecision} = datos;
		datos = {}; // limpia la variable 'datos'
		let destino;

		// Acciones si es un RCLV
		if (rclv) {
			// Variables
			datos.avatar = req.file ? req.file.filename : original.avatar;

			// Acciones para alta
			if (codigo == "alta") {
				// Obtiene los datos
				datos = {...datos, ...req.body, ...req.query, revisorPERL, imgOpcionalnal: true};

				// Si recibimos un avatar, se completa la información
				if (req.file) datos.tamano = req.file.size;

				// Averigua si hay errores de validación y toma acciones
				let errores = await validaRCLV.consolidado(datos);
				if (errores.hay) {
					// Guarda session y cookie
					req.session[entidad] = datos;
					res.cookie(entidad, datos, {maxAge: unDia});

					// Si se agregó un archivo avatar, lo elimina
					if (req.file) comp.gestionArchivos.elimina(carpetaExterna + "9-Provisorio/", datos.avatar);

					// Fin
					return res.redirect(req.originalUrl);
				}

				// Procesa los datos del Data Entry
				datos = procsRCLV.altaEdicGuardar.procesaLosDatos(datos);

				// Acciones si recibimos un avatar
				if (req.file) {
					// Lo mueve de 'Provisorio' a 'Final'
					comp.gestionArchivos.mueveImagen(datos.avatar, "9-Provisorio", "3-RCLVs/Final");

					// Elimina el eventual anterior
					if (original.avatar) comp.gestionArchivos.elimina(carpetaExterna + "3-RCLVs/Revisar/", original.avatar);
				}
				// Si no recibimos un avatar y hay avatar en original, lo mueve de 'Revisar' a 'Final'
				else if (original.avatar) comp.gestionArchivos.mueveImagen(original.avatar, "3-RCLVs/Revisar", "3-RCLVs/Final");

				// Acciones si es un registro de 'epocasDelAno'
				if (entidad == "epocasDelAno") {
					// Si tiene imagen, la copia en su carpeta
					if (datos.avatar) {
						const archivoAvatar = "4-EpocasDelAno/" + datos.carpetaAvatars + "/" + datos.avatar;
						comp.gestionArchivos.copiaImagen("3-RCLVs/Final" + datos.avatar, archivoAvatar);
					}

					// Actualiza el solapamiento
					comp.actualizaSolapam();
				}
			}

			// Acciones para avatar por rechazo
			if (codigo == "rechazar") {
				// Si se había agregado un archivo, lo elimina
				if (req.file) comp.gestionArchivos.elimina(carpetaExterna + "9-Provisorio/", datos.avatar);

				// Si hay avatar en original, lo mueve de 'Revisar' a 'Final'
				if (original.avatar) comp.gestionArchivos.mueveImagen(original.avatar, "3-RCLVs/Revisar", "3-RCLVs/Final");
			}

			// Acciones si es un RCLV inactivo
			if (statusFinal_id == inactivo_id) {
				// Borra el vínculo en las ediciones de producto y las elimina si quedan vacías
				procsFM.elimina.vinculoEdicsProds({entidadRCLV: entidad, rclvID: id});

				// Sus productos asociados:
				// Dejan de estar vinculados
				// Si no pasan el control de error y estaban aprobados, pasan al status 'creadoAprob'
				await procesos.guardar.prodsAsocs(entidad, id);
			}
		}

		// Datos que se necesitan con seguridad
		datos = {
			...datos,
			motivo_id,
			statusRegistro_id: statusFinal_id,
			statusSugeridoPor_id: revId,
			statusSugeridoEn: ahora,
		};

		// Datos sólo si es un alta
		if (!original.altaRevisadaEn) {
			datos.altaRevisadaPor_id = revId;
			datos.altaRevisadaEn = ahora;
			if (rclv) datos.leadTimeCreacion = comp.obtieneLeadTime(original.creadoEn, ahora);
		}

		// CONSECUENCIAS - Actualiza el registro original --> es crítico el uso del 'await'
		await baseDeDatos.actualizaPorId(entidad, id, datos);

		// CONSECUENCIAS - Si corresponde, actualiza o crea el campo 'azar'
		if (producto && aprobados_ids.includes(statusFinal_id)) {
			// Variables
			const azar = comp.azar();
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const datos = {[campo_id]: id, azar};
			if (entidad != "peliculas") datos.grupoCol_id = entidad == "colecciones" ? id : original.coleccion_id;

			// Actualiza o agrega un registro
			const prodComplem = await baseDeDatos.obtienePorCondicion("prodsComplem", {[campo_id]: id});
			if (!prodComplem) await baseDeDatos.agregaRegistro("prodsComplem", datos);
			else if (!prodComplem.azar) baseDeDatos.actualizaPorId("prodsComplem", prodComplem.id, {azar});
		}

		// CONSECUENCIAS - Actualiza 'inactivar' y 'recuperar'
		if (inacRecup_ids.includes(statusOriginal_id)) await comp.revisaStatus.consolidado();

		// CONSECUENCIAS - Acciones si es una colección
		if (entidad == "colecciones") {
			// 1. Actualiza el status de los capítulos
			statusFinal_id == aprobado_id
				? await validacsFM.capsAprobs(id)
				: await baseDeDatos.actualizaTodosPorCondicion(
						"capitulos",
						{coleccion_id: id},
						{...datos, statusColeccion_id: statusFinal_id, statusSugeridoPor_id: usAutom_id}
				  );

			// 2. Actualiza el campo 'prodAprob' en los links de sus capítulos
			procesos.guardar.actualizaProdAprobEnLink(id, statusFinal_id);

			// 3. Si la colección fue aprobada, actualiza sus status de links
			if (aprobados_ids.includes(statusFinal_id)) {
				// Si no existe su registro 'capsSinLink', lo agrega
				if (!(await baseDeDatos.obtienePorCondicion("capsSinLink", {coleccion_id: id})))
					await baseDeDatos.agregaRegistro("capsSinLink", {coleccion_id: id});

				// Actualiza su link
				comp.actualizaCalidadesDeLinkEnCole(id);
			}
		}

		// CONSECUENCIAS - Si es un capítulo, actualiza el status de link de su colección
		if (entidad == "capitulos") comp.actualizaCalidadesDeLinkEnCole(original.coleccion_id);

		// CONSECUENCIAS - Si es un RCLV y es un alta, actualiza la tabla 'histEdics' y esos mismos campos en el usuario --> debe estar después de que se grabó el original
		if (rclv && codigo == "alta") procesos.rclv.edicAprobRech(entidad, original, revId);

		// CONSECUENCIAS - statusHistorial: si el registro 'inactivar_id' no tiene comentarios, lo elimina
		const condicion = {entidad, entidad_id: id, statusFinal_id: inactivar_id, comentario: null};
		baseDeDatos.eliminaTodosPorCondicion("statusHistorial", condicion);

		// CONSECUENCIAS - statusHistorial: Agrega un registro
		let datosHist = {
			...{entidad, entidad_id: id, aprobado}, // entidad
			...{statusOriginalPor_id: userId, statusFinalPor_id: revId}, // personas
			...{statusOriginal_id: statusOriginal_id, statusFinal_id}, // status
			...{statusOriginalEn: original.statusSugeridoEn}, // fecha
			...{motivo_id, comentario},
		};
		const motivo = motivo_id ? statusMotivos.find((n) => n.id == motivo_id) : {};
		if (motivo.penalizac) datosHist.penalizac = Number(motivo.penalizac); // Agrega una 'duración' sólo si el usuario intentó un status "aprobado"
		baseDeDatos.agregaRegistro("statusHistorial", datosHist); // Guarda los datos históricos

		// CONSECUENCIAS - Aumenta el valor de aprob/rech en el registro del usuario, en el campo 'original'
		baseDeDatos.aumentaElValorDeUnCampo("usuarios", userId, campoDecision, 1);

		// CONSECUENCIAS - Penaliza al usuario si corresponde
		if (datosHist.penalizac) comp.penalizacAcum(userId, motivo, petitFamilias);

		// CONSECUENCIAS - Acciones para producto (rclvs y links) --> debe estar después de que se grabó el original
		if (producto) await validacsFM.accionesPorCambioDeStatus(entidad, {...original, statusRegistro_id: statusFinal_id});

		// CONSECUENCIAS - Si se aprobó un 'recuperar' que no es un capítulo, y el avatar original es un url, descarga el archivo avatar y actualiza el registro 'original'
		if (codigo == "recuperar" && aprobado && entidad != "capitulo" && original.avatar && original.avatar.includes("/"))
			procesos.descargaAvatarOriginal(original, entidad);

		// Opciones de redireccionamiento
		if (producto && codigo == "alta") destino = baseUrl + "/producto/edicion" + cola; // producto creado y aprobado
		else if (origen) destino = "/inactivar-captura" + cola; // otros casos con origen
		else destino = "/revision/tablero-de-entidades"; // sin origen

		// Fin
		return res.redirect(destino);
	},

	// Edición
	edic: {
		form: async (req, res) => {
			// Tema y Código
			const tema = "revisionEnts";
			const {ruta} = comp.reqBasePathUrl(req);
			let codigo = ruta.slice(1, -1); // No se puede poner 'const', porque más adelante puede cambiar

			// Variables
			const {entidad, id, edicID} = req.query;
			const origen = req.query.origen ? req.query.origen : "TE";
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
			const edicEntidad = comp.obtieneDesdeEntidad.entidadEdic(entidad);
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
			const delLa = comp.obtieneDesdeEntidad.delLa(entidad);
			const articulo = ["peliculas", "colecciones", "epocasDelAno"].includes(entidad) ? " la " : "l ";
			const userId = req.session.usuario.id;

			// Obtiene los include
			const includeEdic = comp.obtieneTodosLosCamposInclude(entidad);
			let includeOrig = [...includeEdic, "statusRegistro", "creadoPor", "statusSugeridoPor", "altaRevisadaPor"];
			if (entidad == "capitulos") includeOrig.push("coleccion");
			if (entidad == "colecciones") includeOrig.push("capitulos");
			if (familia == "rclv") includeOrig.push(...variables.entidades.prods);

			// Obtiene los registros
			let original = await baseDeDatos.obtienePorId(entidad, id, includeOrig);
			let edicion = await baseDeDatos.obtienePorId(edicEntidad, edicID, includeEdic);

			// Si el avatar está presente en la edición, muestra esa vista
			if (edicion.avatar) {
				// Averigua si se debe reemplazar el avatar en forma automática
				const reemplAvatarAutomaticam =
					edicion.avatar && // Que en la edición, el campo 'avatar' tenga un valor
					original.avatar && // Que en el original, el campo 'avatar' tenga un valor
					original.avatar == edicion.avatarUrl; // Mismo url para los campos 'original.avatar' y 'edicion.avatarUrl'

				// Reemplazo automático
				if (reemplAvatarAutomaticam) {
					await procesos.edicion.procsParticsAvatar({entidad, original, edicion, aprob: true}); // Avatar: impacto en los archivos de avatar (original y edicion)
					await baseDeDatos.actualizaPorId(entidad, original.id, {avatar: edicion.avatar}); // REGISTRO ORIGINAL: actualiza el campo 'avatar' en el registro original
					await baseDeDatos.actualizaPorId("prodsEdicion", edicion.id, {avatar: null, avatarUrl: null}); // REGISTRO EDICION: borra los campos de 'avatar' en el registro de edicion
					return res.redirect(req.originalUrl); // Recarga la ruta
				}

				// Reemplazo manual - Variables
				codigo += "/avatar";
				const avatar = procsFM.obtieneAvatar(original, edicion);
				const motivos = motivosEdics.filter((m) => m.avatar_prods);
				const avatarExterno = !avatar.orig.includes("/Externa/");
				const nombre = original.nombreCastellano ? original.nombreCastellano : original.nombre;
				const avatarsExternosPelis = variables.avatarsExternosPelis(nombre);
				const titulo = "Revisión" + delLa + entidadNombre + ": " + nombre;

				// Va a la vista
				return res.render("CMP-0Estructura", {
					...{tema, codigo, titulo, origen}, //title: nombre,
					...{entidad, id, familia, registro: original, prodOrig: original, prodEdic: edicion},
					...{entidadNombre, motivos, urlActual: req.session.urlActual},
					...{avatar, avatarExterno, avatarsExternosPelis},
					...{cartelGenerico: true, cartelRechazo: true, estrucPers: true},
				});
			}

			// Actualiza el avatar original si es un url
			if (original.avatar && original.avatar.includes("/") && entidad != "capitulos") {
				// Descarga el archivo avatar y actualiza el registro 'original'
				procesos.descargaAvatarOriginal(original, entidad);

				// Actualiza el registro 'edición'
				edicion.avatarUrl = null;
				const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
				baseDeDatos.actualizaPorId(entidadEdic, edicID, {avatar: null, avatarUrl: null});
			}

			// Más variables
			const prodsDelRCLV = familia == "rclv" ? await procsFM.prodsDelRCLV(original, userId) : null;
			const canonNombre = familia == "rclv" ? comp.canonNombre(original) : null;
			const bloqueDer = {
				registro: await procsFM.bloques.registro({...original, entidad}),
				usuario: await procsFM.bloques.usuario(edicion.editadoPor_id, "ediciones"),
			};
			const imgDerPers = procsFM.obtieneAvatar(original).orig;
			const motivos = motivosEdics.filter((m) => m.prods);

			// Achica la edición a su mínima expresión
			edicion = await comp.puleEdicion(entidad, original, edicion);

			// Fin, si no quedan campos
			if (!edicion) return res.render("CMP-0Estructura", {informacion: procesos.cartelNoQuedanCampos});

			// Obtiene los ingresos y reemplazos
			const [ingresos, reemplazos] = await procesos.edicion.ingrReempl(original, edicion);

			// Variables para la vista
			const titulo = "Revisión de la Edición de" + articulo + entidadNombre;
			const ayudasTitulo = [
				"Necesitamos que nos digas si estás de acuerdo con la información editada.",
				"Si considerás que no, te vamos a pedir que nos digas el motivo.",
			];

			// Va a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, ayudasTitulo, origen}, //title: original.nombreCastellano,
				...{entidad, id, familia, registro: original, prodOrig: original, prodEdic: edicion, prodsDelRCLV},
				...{canonNombre, entidadNombre, imgDerPers},
				...{ingresos, reemplazos, motivos, bloqueDer, urlActual: req.session.urlActual},
				...{cartelGenerico: true},
			});
		},
		avatar: async (req, res) => {
			// Variables
			const {entidad, id, edicID, rechazar, motivo_id} = {...req.query, ...req.body};
			const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
			const revId = req.session.usuario.id;
			const original = await baseDeDatos.obtienePorId(entidad, id);
			const campo = "avatar";
			const aprob = !rechazar;
			let edicion = await baseDeDatos.obtienePorId(entidadEdic, edicID);
			const originalGuardado = aprob ? {...original, [campo]: edicion[campo]} : {...original};

			// 1. PROCESOS PARTICULARES PARA AVATAR
			await procesos.edicion.procsParticsAvatar({entidad, original, edicion, aprob});
			if (entidadEdic == "prodsEdicion") delete edicion.avatarUrl;

			// 2. PROCESOS COMUNES A TODOS LOS CAMPOS
			edicion = await procesos.edicion.edicAprobRech({
				entidad,
				original,
				originalGuardado,
				edicion,
				revId,
				campo,
				aprob,
				motivo_id,
			});

			// 3. Acciones si se terminó de revisar la edición de un producto
			if (!edicion && entidadEdic == "prodsEdicion") await validacsFM.statusAprob({entidad, registro: originalGuardado});

			// Fin
			if (edicion) return res.redirect(req.originalUrl);
			else return res.redirect("/revision/tablero-de-entidades");
		},
		solapam: async (req, res) => {
			// Variables
			const {entidad, id} = req.query;
			const revId = req.session.usuario.id;
			const ahora = comp.fechaHora.ahora();
			let datos = {...req.body, entidad}; // la 'entidad' hace falta para una función posterior

			// Averigua si hay errores de validación y toma acciones
			let errores = await validaRCLV.fecha(datos);
			if (errores) {
				// Guarda session y cookie
				req.session.epocasDelAno = datos;
				res.cookie("epocasDelAno", datos, {maxAge: unDia});

				// Fin
				return res.redirect(req.originalUrl);
			}

			// Procesa los datos del Data Entry
			datos = procsRCLV.altaEdicGuardar.procesaLosDatos(datos);
			for (let prop in datos) if (datos[prop] === null) delete datos[prop];

			// Actualiza el registro original
			datos = {...datos, editadoPor_id: revId, editadoEn: ahora};
			await baseDeDatos.actualizaPorId("epocasDelAno", id, datos);

			// Actualiza el solapamiento
			comp.actualizaSolapam();

			// Fin
			return res.redirect("/revision/tablero-de-entidades");
		},
	},

	// Links
	links: async (req, res) => {
		// Variables
		const tema = "revisionEnts";
		const codigo = "abmLinks";
		const {entidad, id} = req.query;
		const revId = req.session.usuario.id;
		const origen = req.query.origen ? req.query.origen : "TE";

		// Configura el título
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const titulo = "Revisar los Links de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;

		// Obtiene el prodOrig con sus links originales para verificar que los tenga
		let include = ["links", "statusRegistro"];
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		const producto = await baseDeDatos.obtienePorId(entidad, id, include);

		// Errores del producto a verificar
		const informacion = procesos.links.problemasProd(producto, req.session.urlAnterior);
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Obtiene todos los links
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		include = ["statusRegistro", "ediciones", "prov", "tipo", "motivo"];
		const links = await baseDeDatos.obtieneTodosPorCondicion("links", {[campo_id]: id}, include);
		links.sort((a, b) => a.tipo_id - b.tipo_id);
		for (let link of links) {
			if (!link.prov.embededPoner || !link.gratuito) link.href = "//" + link.url;
			link.cond = procsLinks.condicion(link, revId, tema);
			link.idioma = link.castellano ? "enCast" : link.subtitulos ? "subtCast" : "otroIdioma";
		}

		// Genera el link del próximo producto
		const sigProd =
			origen == "TE"
				? req.sigProd // aprovecha el dato disponible
					? req.sigProd
					: await procesos.links.obtieneSigProd({entidad, id, revId})
				: null;
		const linkSigProd = sigProd
			? "/inactivar-captura/?entidad=".concat(entidad, "&id=", id) +
			  "&prodEntidad=".concat(sigProd.entidad, "&prodId=", sigProd.id, "&origen=RL")
			: null;

		// Información para la vista
		const avatar = producto.avatar
			? (!producto.avatar.includes("/") ? "/Externa/2-Productos/Final/" : "") + producto.avatar
			: "/publico/imagenes/Avatar/Prod-Generico.jpg";
		const motivos = statusMotivos.filter((n) => n.links).map((n) => ({id: n.id, descripcion: n.descripcion}));
		const camposARevisar = variables.camposRevisar.links.map((n) => n.nombre);
		const imgDerPers = procsFM.obtieneAvatar(producto).orig;
		const ayudasTitulo = ["Sé muy cuidadoso de aprobar sólo links que respeten los derechos de autor"];

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen},
			...{entidad, id, registro: producto, prodOrig: producto, avatar, userId: revId, familia: "producto"},
			...{links, linksProvs, linksTipos, motivos},
			...{camposARevisar, calidades: variables.calidades},
			...{imgDerPers, cartelGenerico: true, linkSigProd},
		});
	},
};
