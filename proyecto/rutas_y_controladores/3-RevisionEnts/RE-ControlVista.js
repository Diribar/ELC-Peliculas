"use strict";
// Variables
const procesos = require("./RE-Procesos");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procsProd = require("../2.1-Prod-RUD/PR-FN-Procesos");
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Procesos");
const validaRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Validar");
const procsLinks = require("../2.3-Links-CRUD/LK-FN-Procesos");

module.exports = {
	// TABLERO
	tableroControl: async (req, res) => {
		// Variables
		const tema = "revisionEnts";
		const codigo = "tableroControl";
		const revID = req.session.usuario.id;

		// Productos, Ediciones y Links
		let prods1 = procesos.TC.obtieneProdsConEdic(revID); // Altas y Ediciones
		let prods2 = procesos.TC.obtieneProds_SE_IR(revID); // creadoSinEdición, creadoAprobSinEdición, Inactivar y Recuperar
		let links = procesos.TC.obtieneProds_Links(revID);

		// RCLV
		let rclvs1 = procesos.TC.obtieneRCLVs(revID);
		let rclvs2 = procesos.TC.obtieneRCLVsConEdic(revID);

		// Espera a que se actualicen todos los resultados
		[prods1, prods2, links, rclvs1, rclvs2] = await Promise.all([prods1, prods2, links, rclvs1, rclvs2]);

		// Consolida los productos
		let AL = [...prods1.AL_conEdicion, ...prods2.AL_sinEdicion];
		AL.sort((a, b) => b.fechaRef - a.fechaRef);
		delete prods1.AL_conEdicion;
		delete prods2.AL_sinEdicion;
		let prods = {...prods1, ...prods2, ...links.productos, AL};

		// Consolida los RCLVs
		let rclvs = {...rclvs1, ...rclvs2};

		// Procesa los campos de las 2 familias de entidades
		prods = procesos.TC.procesaCampos.prods(prods);
		rclvs = procesos.TC.procesaCampos.rclvs(rclvs);

		// Obtiene información para la vista
		const dataEntry = req.session.tableros && req.session.tableros.revision ? req.session.tableros.revision : {};
		const {cantLinksEstaSem, cantLinksTotal} = links;

		// Va a la vista
		// return res.send(prods.AL)
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Revisión - Tablero de Entidades"},
			...{prods, rclvs, origen: "TE"},
			...{dataEntry, cantLinksEstaSem, cantLinksTotal},
		});
	},

	// ALTAS
	alta: {
		prodForm: async (req, res) => {
			// Variables
			const tema = "revisionEnts";
			const codigo = "producto/alta";
			const {entidad, id} = req.query;
			const origen = req.query.origen ? req.query.origen : "TE";
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);

			// Excluye los capítulos
			if (entidad == "capitulos")
				res.render("CMP-0Estructura", {
					informacion: {
						mensajes: ["Sólo se aprueban/rechazan películas y colecciones"],
						iconos: [
							{
								nombre: "fa-spell-check ",
								link: "/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=TE",
								titulo: "Regresar al Tablero de Control",
							},
						],
					},
				});

			// Obtiene el registro original
			let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
			include.push("statusRegistro", "creadoPor", "statusSugeridoPor");
			if (entidad == "colecciones") include.push("capitulos");
			let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

			// Obtiene avatar original
			let imgDerPers = original.avatar;
			imgDerPers = imgDerPers
				? (!imgDerPers.includes("/") ? "/externa/2-Productos/Revisar/" : "") + imgDerPers
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
			const bloqueDer = [
				procsCRUD.bloqueRegistro({...original, entidad}),
				await procsCRUD.fichaDelUsuario(original.statusSugeridoPor_id, petitFamilias),
			];
			// Info para la vista
			const statusRegistro_id = original.statusRegistro_id;
			const statusCreado = statusRegistro_id == creado_id;
			const statusLink_id = [creado_id, aprobado_id, recuperar_id];
			const links = await procsProd.obtieneLinksDelProducto({entidad, id, statusLink_id});
			const status_id = statusRegistro_id;
			const asocs = variables.asocs.rclvs;

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
		guardar: async (req, res) => {
			// Variables
			const {entidad, id, origen} = req.query;
			const cola = "/?entidad=" + entidad + "&id=" + id + (origen ? "&origen=" + origen : "");
			let datos = await procesos.guardar.obtieneDatos(req);
			const {original, statusOriginal_id, statusFinal_id} = datos;
			const {codigo, subcodigo, rclv, motivo_id, comentario, aprob} = datos;
			const producto = !rclv;
			const userID = original.statusSugeridoPor_id;
			const revID = req.session.usuario.id;
			const ahora = comp.fechaHora.ahora();
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
			const campoDecision = petitFamilias + (aprob ? "Aprob" : "Rech");
			const revisorPERL = req.session.usuario && req.session.usuario.rolUsuario.revisorPERL;
			const {baseUrl} = comp.reqBasePathUrl(req);
			let destino;

			// Limpia la variable 'datos'
			datos = {};

			// Acciones si es un RCLV
			if (rclv) {
				// Variables
				datos.avatar = req.file ? req.file.filename : original.avatar;

				// Acciones para alta
				if (subcodigo == "alta") {
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
					else if (original.avatar)
						comp.gestionArchivos.mueveImagen(original.avatar, "3-RCLVs/Revisar", "3-RCLVs/Final");

					// Acciones si es un registro de 'epocasDelAno'
					if (entidad == "epocasDelAno") {
						// Si tiene imagen, la copia en su carpeta
						if (datos.avatar) {
							const archivoAvatar = "4-EpocasDelAno/" + datos.carpetaAvatars + "/" + datos.avatar;
							comp.gestionArchivos.copiaImagen("3-RCLVs/Final" + datos.avatar, archivoAvatar);
						}

						// Actualiza los fechasDelAno
						const desde = datos.fechaDelAno_id;
						const duracion = parseInt(datos.diasDeDuracion) - 1;
						await procesos.guardar.actualizaDiasDelAno({desde, duracion, id});
					}
				}

				// Acciones para avatar por rechazo
				if (subcodigo == "rechazo") {
					// Si se había agregado un archivo, lo elimina
					if (req.file) comp.gestionArchivos.elimina(carpetaExterna + "9-Provisorio/", datos.avatar);

					// Si hay avatar en original, lo mueve de 'Revisar' a 'Final'
					if (original.avatar) comp.gestionArchivos.mueveImagen(original.avatar, "3-RCLVs/Revisar", "3-RCLVs/Final");
				}

				// Acciones si es un RCLV inactivo
				if (statusFinal_id == inactivo_id) {
					// Borra el vínculo en las ediciones de producto y las elimina si quedan vacías
					procsCRUD.eliminar.borraVinculoEdicsProds({entidadRCLV: entidad, rclvID: id});

					// Sus productos asociados:
					// Dejan de estar vinculados
					// Si no pasan el control de error y estaban aprobados, pasan al status 'creadoAprob'
					await procesos.guardar.prodsAsocs(entidad, id);
				}
			}

			// CONSECUENCIAS
			// Actualiza el status en el registro original
			// A. Datos que se necesitan con seguridad
			datos = {...datos, statusRegistro_id: statusFinal_id};
			// B. Datos sólo si es un alta/rechazo
			if (!original.leadTimeCreacion) {
				datos.altaRevisadaPor_id = revID;
				datos.altaRevisadaEn = ahora;
				if (rclv) datos.leadTimeCreacion = comp.obtieneLeadTime(original.creadoEn, ahora);
			}
			if (statusFinal_id != creadoAprob_id) {
				datos.statusSugeridoPor_id = revID;
				datos.statusSugeridoEn = ahora;
			}
			datos.motivo_id = motivo_id;
			// C. Actualiza el registro original --> es crítico el uso del 'await'
			await BD_genericas.actualizaPorId(entidad, id, datos);

			// Acciones si es una colección
			if (entidad == "colecciones") {
				// Actualiza el status de los capítulos
				statusFinal_id == aprobado_id
					? await procsCRUD.revisiones.capsAprobs(id)
					: await BD_genericas.actualizaTodosPorCondicion(
							"capitulos",
							{coleccion_id: id},
							{...datos, statusColeccion_id: statusFinal_id, statusSugeridoPor_id: usAutom_id}
					  );

				// Actualiza el campo 'prodAprob' en los links de sus capítulos
				procesos.guardar.prodAprobEnLink(id, statusFinal_id);
			}

			// Si es un RCLV y es un alta aprobada, actualiza la tabla 'histEdics' y esos mismos campos en el usuario --> debe estar después de que se grabó el original
			if (rclv && subcodigo == "alta" && aprob) procesos.alta.rclvEdicAprobRech(entidad, original, revID);

			// Agrega un registro en el histStatus
			// A. Genera la información
			let datosHist = {
				...{entidad, entidad_id: id},
				...{sugeridoPor_id: userID, sugeridoEn: original.statusSugeridoEn, statusOriginal_id},
				...{revisadoPor_id: revID, revisadoEn: ahora, statusFinal_id},
				...{aprobado: aprob, motivo_id, comentario},
			};
			// B. Agrega una 'duración' sólo si el usuario intentó un status "aprobado"
			const motivo =
				codigo == "rechazo" || (!aprob && codigo == "recuperar") ? motivosStatus.find((n) => n.id == motivo_id) : {};
			if (motivo.penalizac) datosHist.penalizac = Number(motivo.penalizac);
			// C. Guarda los datos históricos
			BD_genericas.agregaRegistro("histStatus", datosHist);

			// Aumenta el valor de aprob/rech en el registro del usuario
			BD_genericas.aumentaElValorDeUnCampo("usuarios", userID, campoDecision, 1);

			// Penaliza al usuario si corresponde
			if (datosHist.penalizac) comp.usuarioPenalizAcum(userID, motivo, petitFamilias);

			// Acciones si es un registro que se mueve a 'inactivo'
			// Elimina el archivo de avatar de las ediciones
			// Elimina las ediciones que tenga
			if (statusFinal_id == inactivo_id) procsCRUD.eliminar.eliminaAvatarMasEdics(entidad, id);

			// Si es un producto, actualiza los RCLV en el campo 'prodsAprob' --> debe estar después de que se grabó el original
			if (producto)
				procsCRUD.revisiones.accionesPorCambioDeStatus(entidad, {...original, statusRegistro_id: statusFinal_id});

			// Si se aprobó un 'recuperar' y el avatar original es un url, descarga el archivo avatar y actualiza el registro 'original'
			if (subcodigo == "recuperar" && aprob && original.avatar && original.avatar.includes("/"))
				procesos.descargaAvatarOriginal(original, entidad);

			// Opciones de redireccionamiento
			if (producto && codigo == "alta") destino = baseUrl + "/producto/edicion" + cola; // producto creado y aprobado
			else if (origen) destino = "/inactivar-captura" + cola; // otros casos con origen
			else destino = "/revision/tablero-de-control"; // sin origen

			// Fin
			return res.redirect(destino);
		},
	},

	// EDICION
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
			const articulo = entidad == "peliculas" || entidad == "colecciones" || entidad == "epocasDelAno" ? " la " : "l ";
			let avatarExterno, avatarsExternos, avatar, imgDerPers;
			let ingresos, reemplazos, bloqueDer, motivos, cantProds, titulo, ayudasTitulo;

			// Obtiene la versión original con include
			let include = [
				...comp.obtieneTodosLosCamposInclude(entidad),
				"statusRegistro",
				"creadoPor",
				"statusSugeridoPor",
				"altaRevisadaPor",
			];
			if (entidad == "capitulos") include.push("coleccion");
			if (entidad == "colecciones") include.push("capitulos");
			if (familia == "rclv") include.push(...variables.entidades.prods);
			let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

			// Obtiene la edición
			let edicion = await BD_genericas.obtienePorId(edicEntidad, edicID);

			// Acciones si el avatar está presente en la edición
			if (edicion.avatar) {
				// Averigua si se debe reemplazar el avatar en forma automática
				let reemplAvatarAutomaticam =
					edicion.avatar && // Que en la edición, el campo 'avatar' tenga un valor
					original.avatar && // Que en el original, el campo 'avatar' tenga un valor
					original.avatar == edicion.avatarUrl; // Mismo url para los campos 'original.avatar' y 'edicion.avatarUrl'

				// Reemplazo automático
				if (reemplAvatarAutomaticam) {
					await procesos.edicion.procsParticsAvatar({entidad, original, edicion, aprob: true}); // Avatar: impacto en los archivos de avatar (original y edicion)
					await BD_genericas.actualizaPorId(entidad, original.id, {avatar: edicion.avatar}); // REGISTRO ORIGINAL: actualiza el campo 'avatar' en el registro original
					await BD_genericas.actualizaPorId("prodsEdicion", edicion.id, {avatar: null, avatarUrl: null}); // REGISTRO EDICION: borra los campos de 'avatar' en el registro de edicion
					return res.redirect(req.originalUrl); // Recarga la ruta
				}

				// Reemplazo manual - Variables
				codigo += "/avatar";
				avatar = procsCRUD.obtieneAvatar(original, edicion);
				motivos = motivosEdics.filter((m) => m.avatar_prods);
				avatarExterno = !avatar.orig.includes("/externa/");
				const nombre = petitFamilias == "prods" ? original.nombreCastellano : original.nombre;
				avatarsExternos = variables.avatarsExternos(nombre);
				titulo = "Revisión" + delLa + entidadNombre + ": " + nombre;
			}
			// Acciones si el avatar no está presente en la edición
			else if (!edicion.avatar) {
				// Actualiza el avatar original si es un url
				if (original.avatar && original.avatar.includes("/") && entidad != "capitulos") {
					// Descarga el archivo avatar y actualiza el registro 'original'
					procesos.descargaAvatarOriginal(original, entidad);

					// Actualiza el registro 'edición'
					edicion.avatarUrl = null;
					const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
					BD_genericas.actualizaPorId(entidadEdic, edicID, {avatar: null, avatarUrl: null});
				}

				// Variables
				if (familia == "rclv") cantProds = await procsRCLV.detalle.prodsDelRCLV(original).then((n) => n.length);
				bloqueDer = [procsCRUD.bloqueRegistro({...original, entidad})];
				bloqueDer.push(await procsCRUD.fichaDelUsuario(edicion.editadoPor_id, petitFamilias));
				imgDerPers = procsCRUD.obtieneAvatar(original).orig;
				motivos = motivosEdics.filter((m) => m.prods);

				// Achica la edición a su mínima expresión
				edicion = await procsCRUD.puleEdicion(entidad, original, edicion);

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
				...{tema, codigo, titulo, title: original.nombreCastellano, ayudasTitulo, origen},
				...{entidad, id, familia, registro: original, prodOrig: original, prodEdic: edicion, entidadNombre, cantProds},
				...{ingresos, reemplazos, motivos, bloqueDer, urlActual: req.session.urlActual},
				...{avatar, avatarExterno, avatarsExternos, imgDerPers},
				...{omitirImagenDerecha: codigo.includes("avatar"), omitirFooter: codigo.includes("avatar")},
				...{cartelGenerico: true, cartelRechazo: codigo.includes("avatar")},
			});
		},
		avatar: async (req, res) => {
			// Variables
			const {entidad, id, edicID, rechazo, motivo_id} = {...req.query, ...req.body};
			const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
			const revID = req.session.usuario.id;
			const original = await BD_genericas.obtienePorId(entidad, id);
			const campo = "avatar";
			const aprob = !rechazo;
			let edicion = await BD_genericas.obtienePorId(entidadEdic, edicID);
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
				revID,
				campo,
				aprob,
				motivo_id,
			});

			// 3. Acciones si se terminó de revisar la edición de un producto
			if (!edicion && entidadEdic == "prodsEdicion")
				await procsCRUD.revisiones.statusAprob({entidad, registro: originalGuardado});

			// Fin
			if (edicion) return res.redirect(req.originalUrl);
			else return res.redirect("/revision/tablero-de-control");
		},
		solapam: async (req, res) => {
			// Variables
			const {entidad, id} = req.query;
			const revID = req.session.usuario.id;
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
			for (let campo in datos) if (datos[campo] === null) delete datos[campo];

			// Actualiza los fechasDelAno
			const desde = datos.fechaDelAno_id;
			const duracion = parseInt(datos.diasDeDuracion) - 1;
			await procesos.guardar.actualizaDiasDelAno({desde, duracion, id});

			// Actualiza el registro original
			datos = {...datos, solapamiento: false, editadoPor_id: revID, editadoEn: ahora};
			await BD_genericas.actualizaPorId("epocasDelAno", id, datos);

			// Fin
			return res.redirect("/revision/tablero-de-control");
		},
	},

	// LINKS
	links: async (req, res) => {
		// Variables
		const tema = "revisionEnts";
		const codigo = "abmLinks";
		const {entidad, id} = req.query;
		const revID = req.session.usuario.id;
		const origen = req.query.origen ? req.query.origen : "TE";

		// Configura el título
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const titulo = "Revisar los Links de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;

		// Obtiene el prodOrig con sus links originales para verificar que los tenga
		let include = ["links", "statusRegistro"];
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		const producto = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// RESUMEN DE PROBLEMAS DE PRODUCTO A VERIFICAR
		const informacion = procesos.problemasProd(producto, req.session.urlAnterior);
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Obtiene todos los links
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		include = ["statusRegistro", "ediciones", "prov", "tipo", "motivo"];
		const links = await BD_genericas.obtieneTodosPorCondicionConInclude("links", {[campo_id]: id}, include);
		links.sort((a, b) => a.tipo_id - b.tipo_id);
		for (let link of links) {
			link.href = !link.prov.embededPoner ? "//" + link.url : "";
			link.cond = procsLinks.condiciones(link, revID, tema);
			link.idioma = link.castellano ? "enCast" : link.subtitulos ? "subtCast" : "otroIdioma";
		}

		// Averigua cuál es el próximo producto
		const siguienteProducto = !origen ? await procesos.sigProd({producto, entidad, revID}) : "";

		// Información para la vista
		const avatar = producto.avatar
			? (!producto.avatar.includes("/") ? "/externa/2-Productos/Final/" : "") + producto.avatar
			: "/publico/imagenes/Avatar/Prod-Generico.jpg";
		const motivos = motivosStatus.filter((n) => n.links).map((n) => ({id: n.id, descripcion: n.descripcion}));
		const camposARevisar = variables.camposRevisar.links.map((n) => n.nombre);
		const imgDerPers = procsCRUD.obtieneAvatar(producto).orig;
		const ayudasTitulo = ["Sé muy cuidadoso de aprobar sólo links que respeten los derechos de autor"];

		// Va a la vista
		//return res.send(links)
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen},
			...{entidad, id, registro: producto, prodOrig: producto, avatar, userID: revID, familia: "producto"},
			...{links, linksProvs, linksTipos, motivos},
			...{camposARevisar, calidades: variables.calidades},
			...{imgDerPers, cartelGenerico: true, siguienteProducto},
		});
	},
};
