"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");
const validacsFM = require("../2.0-Familias/FM-FN-Validar");
const anchoMaxTablero = 32;

module.exports = {
	// Tableros
	tablRevision: {
		obtieneProdsRclvs: () => {
			// Variables
			let respuesta = {};

			// Convierte el array en un objeto
			for (let opcion of ["ST", "IN", "RC"]) respuesta[opcion] = statusErrores.filter((n) => n[opcion]);

			// Fin
			return respuesta;
		},
		obtieneProds1: async (revId) => {
			// Variables
			let include = [...variables.entidades.asocProds, ...variables.entidades.asocRclvs];
			let productos = [];

			// Obtiene todas las ediciones
			let ediciones = await baseDeDatos.obtieneTodos("prodsEdicion", include);

			// Elimina las ediciones con RCLV no aprobado
			ediciones = ediciones.filter(
				(edicion) =>
					!variables.entidades.asocRclvs.some((rclv) => edicion[rclv] && edicion[rclv].statusRegistro_id != aprobado_id)
			);

			// Obtiene los productos
			ediciones.map((n) => {
				const entidad = comp.obtieneDesdeCampo_id.entidadProd(n);
				const asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
				productos.push({
					...n[asociacion],
					entidad,
					fechaRef: n.editadoEn,
					fechaRefTexto: comp.fechaHora.diaMes(n.editadoEn),
					edicID: n.id,
				});
			});

			// Acciones varias
			if (productos.length) {
				// Deja los productos con status <= 'aprobado_id'
				productos = productos.filter((n) => n.statusRegistro_id <= aprobado_id);

				// Deja los productos en status distinto a 'creado', o creados por el revisor, o creados hace más de una hora
				productos = productos.filter(
					(n) =>
						n.statusRegistro_id != creado_id || // status distinto a 'creado'
						n.creadoPor_id == revId || // creado por el revisor
						n.creadoEn < comp.fechaHora.nuevoHorario(-1) // hace más de una hora
				);

				// Elimina los productos repetidos
				productos = comp.eliminaRepetidos(productos);

				// Elimina los productos con problemas de captura
				productos = await comp.sinProblemasDeCaptura(productos, revId);

				// Ordena por fecha descendente
				productos.sort((a, b) => b.fechaRef - a.fechaRef);
			}

			// Separa entre altas y ediciones
			const AL_conEdicion = productos.filter(
				(n) =>
					n.statusRegistro_id == creado_id && // status creado_id
					(n.entidad != "capitulos" || aprobados_ids.includes(n.statusColeccion_id)) // películas y colecciones, y capítulos con su colección aprobada
			);
			const ED = productos.filter((n) => aprobados_ids.includes(n.statusRegistro_id));

			// Fin
			return {AL_conEdicion, ED};
		},
		obtieneProds2: async (revId) => {
			// Variables
			const entidades = variables.entidades.prods;
			const camposFijos = {entidades, revId, include: "ediciones"};
			let campos;

			// AL: En staus 'creado'
			campos = {...camposFijos, status_id: creado_id};
			let AL_sinEdicion = comp
				.obtieneRegs(campos)
				.then((n) => n.filter((m) => m.entidad != "capitulos" || aprobados_ids.includes(m.statusColeccion_id))) // Deja solamente las películas y colecciones, y capítulos con su colección aprobada
				.then((n) => n.filter((m) => !m.ediciones.length)); // Deja solamente los sin edición

			// SE: Sin Edición (en status creadoAprob)
			campos = {...camposFijos, status_id: creadoAprob_id};
			let SE = comp
				.obtieneRegs(campos)
				.then((n) => n.filter((m) => m.entidad != "capitulos" || m.statusColeccion_id == aprobado_id)) // Deja solamente las películas, colecciones, y los capítulos con colección aprobada
				.then((n) => n.filter((m) => !m.ediciones.length)); // Deja solamente los registros sin edición

			// Espera los resultados
			[AL_sinEdicion, SE] = await Promise.all([AL_sinEdicion, SE]);

			// Fin
			return {AL_sinEdicion, SE};
		},
		obtieneProds3: async () => {
			// Obtiene los datos clave de los registros
			const statusRegistro_id = activos_ids;
			let registros = await Promise.all([
				baseDeDatos.obtieneTodosPorCondicion("peliculas", {statusRegistro_id}),
				baseDeDatos.obtieneTodosPorCondicion("capitulos", {statusRegistro_id}),
			])
				.then((n) => [
					...n[0].map((m) => ({entidad: "peliculas", ...m})),
					...n[1].map((m) => ({entidad: "capitulos", ...m})),
				])
				.then((n) => n.filter((m) => m.TMDB_id || m.IMDB_id || m.FA_id)); // excluye los que no tengan alguno de esos códigos

			// Obtiene los repetidos
			let repetidos = [];
			while (registros.length > 1) {
				// Obtiene el primer registro y lo elimina
				const registro = registros[0];
				registros.splice(0, 1);

				// Acciones si se encuentra un repetido
				let indice = registros.findIndex(
					(n) =>
						(n.TMDB_id && n.TMDB_id == registro.TMDB_id) ||
						(n.IMDB_id && n.IMDB_id == registro.IMDB_id) ||
						(n.FA_id && n.FA_id == registro.FA_id)
				);
				if (indice > -1) {
					repetidos.push(registro, registros[indice]);
					registros.splice(indice, 1);
				}
			}

			// Fin
			return {RP: repetidos};
		},
		obtieneSigProd_Links: async (revId) => FN_links.obtieneSigProd({revId}),
		obtieneRCLVs1: async (revId) => {
			// Variables
			const entidades = variables.entidades.rclvs;
			const camposFijos = {entidades, revId};
			let campos;

			// AL: Altas
			campos = {...camposFijos, status_id: creado_id, include: [...variables.entidades.prods, "prodsEdiciones"]};
			let AL = comp.obtieneRegs(campos);

			// SL: Con solapamiento
			campos = {...camposFijos, status_id: aprobado_id, include: "ediciones"};
			let SL = comp.obtieneRegs(campos).then((n) => n.filter((m) => m.solapamiento && !m.ediciones.length));

			// FM: Con fecha móvil
			campos = {...camposFijos, status_id: aprobado_id, include: "ediciones"};
			let FM = comp
				.obtieneRegs(campos)
				.then((originales) => originales.filter((original) => original.fechaMovil)) // con fecha móvil
				.then((originales) =>
					originales.map((original) => {
						// Obtiene la edición del usuario
						let edicion = original.ediciones.find((n) => n.editadoPor_id == revId);
						delete original.ediciones;

						// Actualiza el original con la edición
						if (edicion) {
							edicion = FN.purgaEdicionRclv(edicion, original.entidad);
							original = {...original, ...edicion};
						}

						// Fin
						return original;
					})
				) // fusiona el original con su edición
				.then((n) =>
					n.filter((m) => {
						let fechaFin_id = m.fechaDelAno_id + (m.diasDeDuracion ? m.diasDeDuracion : 0);
						if (fechaFin_id > 366) fechaFin_id -= 366;
						return (
							!m.anoFM || // no tiene año
							m.anoFM < anoHoy - 1 || // el año es menor que el año pasado
							(m.anoFM < anoHoy && fechaFin_id < fechaDelAnoHoy_id) || // comenzó el año pasado y ya terminó
							(m.anoFM == anoHoy && // comienza este año
								m.fechaDelAno_id < fechaDelAnoHoy_id && // ya comenzó
								m.fechaDelAno_id <= fechaFin_id && // termina este año
								fechaFin_id < fechaDelAnoHoy_id) // ya terminó
						);
					})
				) // sin año, año menor al actual, con fecha menor
				.then((originales) =>
					originales.map((original) => {
						const fechaRefTexto = fechasDelAno.find((n) => n.id == original.fechaDelAno_id).nombre;
						return {...original, fechaRefTexto};
					})
				) // Les agrega la fecha de ref
				.then((n) => n.sort((a, b) => a.fechaDelAno_id - b.fechaDelAno_id));

			// Espera los resultados
			[AL, SL, FM] = await Promise.all([AL, SL, FM]);

			// Fin
			return {AL, SL, FM};
		},
		obtieneRCLVs2: async (revId) => {
			// Variables
			let include = variables.entidades.asocRclvs;
			let rclvs = [];

			// Obtiene todas las ediciones ajenas
			let ediciones = await baseDeDatos.obtieneTodos("rclvsEdicion", include);

			// Obtiene los rclvs originales y deja solamente los rclvs aprobados
			if (ediciones.length) {
				// Obtiene los rclvs originales
				ediciones.map((n) => {
					let entidad = comp.obtieneDesdeCampo_id.entidadRCLV(n);
					let asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
					rclvs.push({
						...n[asociacion],
						entidad,
						editadoEn: n.editadoEn,
						edicID: n.id,
						fechaRef: n.editadoEn,
						fechaRefTexto: comp.fechaHora.diaMes(n.editadoEn),
					});
				});
				// Deja solamente los rclvs aprobados
				rclvs = rclvs.filter((n) => n.statusRegistro_id == aprobado_id);
			}

			// Elimina los repetidos
			if (rclvs.length) {
				rclvs.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
				rclvs = comp.eliminaRepetidos(rclvs);
			}

			// Deja solamente los sin problemas de captura
			if (rclvs.length) rclvs = await comp.sinProblemasDeCaptura(rclvs, revId);

			// Fin
			return {ED: rclvs};
		},
	},
	tablManten: {
		obtieneProds: async (usuario_id) => {
			// Variables
			const entidades = variables.entidades.prods;
			const camposFijos = {entidades, usuario_id};
			let campos;

			// Productos Inactivos
			campos = {...camposFijos, status_id: inactivo_id};
			let inactivos = FN_tablManten.obtieneRegs(campos);

			// Productos Aprobados
			campos = {...camposFijos, status_id: aprobado_id};
			let prodsAprob = FN_tablManten.obtieneRegs(campos);

			// Productos Sin Edición (en status creadoAprob)
			let SE_pel = FN_tablManten.obtieneSinEdicion("peliculas");
			let SE_col = FN_tablManten.obtieneSinEdicion("colecciones");
			let SE_cap = FN_tablManten.obtieneSinEdicion("capitulos");

			// Calificaciones de productos y Preferencia por productos
			let cal = baseDeDatos.obtieneTodosPorCondicion("calRegistros", {usuario_id: usuario_id});
			let ppp = baseDeDatos.obtieneTodosPorCondicion("pppRegistros", {
				usuario_id: usuario_id,
				ppp_id: pppOpcsObj.yaLaVi.id,
			});

			// Espera las lecturas
			[inactivos, prodsAprob, SE_pel, SE_col, SE_cap, cal, ppp] = await Promise.all([
				inactivos,
				prodsAprob,
				SE_pel,
				SE_col,
				SE_cap,
				cal,
				ppp,
			]);
			const pelisColes = prodsAprob.filter((m) => m.entidad != "capitulos");
			const pppSinCal = ppp.filter((n) => !cal.some((m) => m.entidad == n.entidad && m.entidad_id == n.entidad_id));

			// Resultados
			let resultados = {
				// Productos
				SE: [...SE_pel, ...SE_col, ...SE_cap], // sin edición
				IN: inactivos.filter((n) => !n.statusColeccion_id || n.statusColeccion_id == aprobado_id), // películas y colecciones inactivas, y capítulos con su colección aprobada
				SC: pelisColes.filter((n) => pppSinCal.find((m) => m.entidad == n.entidad && m.entidad_id == n.id)), // prodsAprob - Sin calificar
				ST: pelisColes.filter((n) => n.tema_id == 1), // prodsAprob - Sin tema

				// Prods - sin links
				SL_pelis: pelisColes.filter((n) => !n.linksGral && n.entidad == "peliculas"), // películas
				SL_coles: pelisColes.filter((n) => !n.linksGral && n.entidad == "colecciones"), // colecciones

				// Tiene links, pero no variantes básicas
				SLG_basico: pelisColes.filter((n) => n.linksGral && !n.linksGratis), // sin links gratuitos
				SLC_basico: pelisColes.filter((n) => n.linksGral && !n.linksCast && !n.linksSubt), // sin links en castellano

				// Links HD
				SL_HD_pelis: pelisColes.filter((n) => n.linksGral && !n.HD_Gral && n.entidad == "peliculas"), // con Links pero sin HD
				SL_HD_coles: pelisColes.filter((n) => n.linksGral && !n.HD_Gral && n.entidad == "colecciones"), // con Links pero sin HD
				SLG_HD: pelisColes.filter((n) => n.HD_Gral && n.linksGratis && !n.HD_Gratis), // sin HD gratuitos
				SLC_HD: pelisColes.filter((n) => n.HD_Gral && (n.linksCast || n.linksSubt) && !n.HD_Cast && !n.HD_Subt), // sin HD en castellano
			};

			// Fin
			return resultados;
		},
		obtieneRCLVs: async (usuario_id) => {
			// Variables
			const entidades = variables.entidades.rclvs;
			const camposFijos = {entidades, usuario_id};
			const include = [...variables.entidades.prods, "prodsEdiciones", "fechaDelAno"];
			let campos;

			// Inactivos
			campos = {...camposFijos, status_id: inactivo_id};
			let IN = FN_tablManten.obtieneRegs(campos);

			// Aprobados
			campos = {...camposFijos, status_id: aprobado_id};
			let rclvsAprob = FN_tablManten.obtieneRegs({...campos, include});

			// Await
			[IN, rclvsAprob] = await Promise.all([IN, rclvsAprob]);

			// Sin Avatar
			const SA = rclvsAprob.filter((m) => !m.avatar && m.id > 10);

			// Con solapamiento de fechas
			const SF = rclvsAprob.filter((m) => m.solapam_fechas);

			// Sin producto
			const SP = rclvsAprob.filter(
				(m) => !m.peliculas.length && !m.colecciones.length && !m.capitulos.length && !m.prodsEdiciones.length
			);

			// Fin
			return {IN, SA, SF, SP};
		},
		obtieneLinksInactivos: async (usuario_id) => {
			// Variables
			let include = variables.entidades.asocProds;
			let condicion = {statusRegistro_id: inactivo_id};

			// Obtiene los links 'a revisar'
			let linksInactivos = await baseDeDatos.obtieneTodosPorCondicion("links", condicion, include);

			// Obtiene los productos
			let productos = linksInactivos.length
				? await FN_tablManten.obtieneProdsDeLinks(linksInactivos, usuario_id)
				: {LI: []};

			// Fin
			return productos;
		},
	},

	// Alta
	rclv: {
		// Alta Guardar
		edicAprobRech: async function (entidad, original, revId) {
			// Variables
			const usuario_id = original.creadoPor_id;
			const familia = comp.obtieneDesdeEntidad.familias(entidad);
			const camposRevisar = variables.camposRevisar[familia].filter((n) => n[entidad] || n[familia]);
			const ahora = comp.fechaHora.ahora();
			let ediciones = {edicsAprob: 0, edicsRech: 0};
			let datosCompleto = {};

			// Prepara la información
			const datosCabecera = {
				entidad,
				entidad_id: original.id,
				sugeridoPor_id: original.creadoPor_id,
				sugeridoEn: original.creadoEn,
				revisadoPor_id: revId,
				revisadoEn: ahora,
				leadTimeEdicion: comp.obtieneLeadTime(original.creadoEn, ahora),
			};

			// Obtiene el RCLV actual
			const include = comp.obtieneTodosLosCamposInclude(entidad);
			const RCLV_actual = await baseDeDatos.obtienePorId(entidad, original.id, include);

			// Rutina para comparar los campos
			for (let campoRevisar of camposRevisar) {
				// Variables
				const campo = campoRevisar.nombre;
				const relacInclude = campoRevisar.relacInclude;

				// Si el campo no fue sugerido por el usuario, saltea la ruta
				if (campo == "prioridad_id") continue;

				// Valores a comparar
				const {valorAprob, valorDesc} = this.valoresComparar(original, RCLV_actual, relacInclude, campo);

				// Si ninguna de las variables tiene un valor, saltea la rutina
				if (!valorAprob && !valorDesc) continue;

				// Genera la información
				datosCompleto = {...datosCabecera, campo, titulo: campoRevisar.titulo, valorAprob};

				// Si hubo una edición del revisor, actualiza/completa los datos
				if (valorAprob != valorDesc) {
					datosCompleto.valorDesc = valorDesc;
					let motivo = ["nombre", "nombreAltern"].includes(campo) ? motivoVersionActual : motivoInfoErronea;
					datosCompleto.motivo_id = motivo.id; // con este campo se sabe si fue rechazado
					datosCompleto.penalizac = motivo.penalizac;
				}

				// Guarda los registros en "histEdics"
				baseDeDatos.agregaRegistro("histEdics", datosCompleto);

				// Aumenta la cantidad de edicsAprob / edicsRech
				const aprobRech = valorAprob == valorDesc ? "Aprob" : "Rech";
				ediciones["edics" + aprobRech]++;
			}

			// Actualiza en el usuario el campo edicsAprob / edicsRech, según cuál tenga más
			const campoEdic =
				ediciones.edicsAprob > ediciones.edicsRech
					? "edicsAprob"
					: ediciones.edicsAprob < ediciones.edicsRech
					? "edicsRech"
					: "";
			if (campoEdic) baseDeDatos.aumentaElValorDeUnCampo("usuarios", usuario_id, campoEdic, 1);

			// Fin
			return;
		},
		valoresComparar: (original, RCLV_actual, relacInclude, campo) => {
			// Valores a comparar
			let valorAprob = relacInclude ? RCLV_actual[relacInclude].nombre : RCLV_actual[campo];
			let valorDesc = relacInclude ? original[relacInclude].nombre : original[campo];

			// Casos especiales
			if (["soloCfc", "ama"].includes(campo)) {
				valorAprob = RCLV_actual[campo] == 1 ? "SI" : "NO";
				valorDesc = original[campo] == 1 ? "SI" : "NO";
			}
			if (campo == "epocaOcurrencia_id") {
				valorAprob = RCLV_actual[relacInclude].nombre_pers;
				valorDesc = original[relacInclude].nombre_pers;
			}

			// Fin
			return {valorAprob, valorDesc};
		},
	},

	guardar: {
		obtieneDatos: async function (req) {
			// Variables
			const entidad = req.params.entidad ? req.params.entidad : req.baseUrl.slice(1);
			const {id, origen, desaprueba, prodEntidad, prodId} = req.query;
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const {ruta} = comp.partesDelUrl(req);
			const codigo = procsFM.codigo({ruta, familia}); // 'alta', 'rechazar', 'revisionInactivar', 'revisionRecuperar'
			const aprobado = !desaprueba || codigo == "alta";
			const producto = familia == "producto";
			const rclv = familia == "rclv";

			// Obtiene el registro original
			let include = comp.obtieneTodosLosCamposInclude(entidad);
			if (producto) include.push("links");
			const original = await baseDeDatos.obtienePorId(entidad, id, include);

			// Obtiene el status final, motivo_id, y comentario
			const {statusFinal_id, motivo_id} = await FN.statusFinalMasMotivo({codigo, desaprueba, rclv, entidad, original, req});
			const comentario = await procsFM.comentario({...req.body, codigo, motivo_id, statusFinal_id, entidad, id});

			// Más variables
			const statusOriginal_id = original.statusRegistro_id;
			const cola =
				"/?entidad=" +
				(entidad + "&id=" + id) +
				(prodEntidad ? "&prodEntidad=" + prodEntidad : "") +
				(prodId ? "&prodId=" + prodId : "") +
				(origen ? "&origen=" + origen : "");
			const revId = req.session.usuario.id;
			const ahora = comp.fechaHora.ahora();
			const revisorPERL = req.session.usuario && req.session.usuario.rolUsuario.revisorPERL;
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
			const {baseUrl} = comp.partesDelUrl(req);
			const usuario_id = original.statusSugeridoPor_id;
			const campoDecision = petitFamilias + (aprobado ? "Aprob" : "Rech");

			// Fin
			return {
				...{entidad, id, origen, original, statusOriginal_id, statusFinal_id},
				...{codigo, producto, rclv, motivo_id, comentario, aprobado},
				...{cola, revId, ahora, revisorPERL, petitFamilias, baseUrl, usuario_id, campoDecision},
			};
		},
		prodsAsocs: async (entidad, id) => {
			// Variables
			const entidadesProd = variables.entidades.prods;
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const statusSugeridoPor_id = usAutom_id;
			const statusSugeridoEn = comp.fechaHora.ahora();
			const statusCreadoAprob = {statusSugeridoPor_id, statusSugeridoEn, statusRegistro_id: creadoAprob_id};

			// Rutina por entidadProd
			for (let entidadProd of entidadesProd) {
				// Actualiza los productos no aprobados, quitándole el valor al 'campo_id'
				FN.actualizaLosProdsVinculadosNoAprobados({entidad: entidadProd, campo_id, id});

				// Obtiene los productos aprobados vinculados
				const condicion = {[campo_id]: id, statusRegistro_id: aprobado_id};
				let prodsVinculados = await baseDeDatos.obtieneTodosPorCondicion(entidadProd, condicion);

				// Actualiza los productos aprobados, quitándole el valor al 'campo_id' y fijándose si tiene errores
				for (let prodVinculado of prodsVinculados) {
					// Averigua si el producto tiene errores cuando se le actualiza el 'campo_id'
					let objeto = {[campo_id]: 1};
					prodVinculado = {...prodVinculado, ...objeto, publico: true, epocaOcurrencia: true};
					const errores = await validacsFM.validacs.consolidado({datos: prodVinculado});

					// Si tiene errores, se le cambia el status a 'creadoAprob'
					if (errores.impideAprobado) objeto = {...objeto, ...statusCreadoAprob};

					// Actualiza el registro del producto
					baseDeDatos.actualizaPorId(entidadProd, prodVinculado.id, objeto);

					// Si es una colección en status creadoAprob_id, actualiza sus capítulos que tengan status aprobado
					if (entidadProd == "colecciones" && errores.impideAprobado) {
						const condicion = {coleccion_id: prodVinculado.id, statusRegistro_id: aprobado_id};
						baseDeDatos.actualizaPorCondicion("capitulos", condicion, statusCreadoAprob);
					}
				}
			}
		},
		actualizaProdAprobEnLink: async (coleccion_id, statusCol) => {
			// Variables
			const prodAprob = activos_ids.includes(statusCol); // antes era 'aprobados_ids'
			const capsID = await baseDeDatos
				.obtieneTodosPorCondicion("capitulos", {coleccion_id})
				.then((n) => n.map((m) => m.id));

			// Actualiza el campo 'prodAprob' a los links de la colección
			await baseDeDatos.actualizaPorCondicion("links", {capitulo_id: capsID}, {prodAprob});

			// Fin
			return;
		},
	},

	// Edición
	edicion: {
		// Cada vez que se revisa un avatar
		procsParticsAvatar: async ({entidad, original, edicion, aprob}) => {
			// TAREAS:
			// - Si se cumplen ciertas condiciones, descarga el avatar del original
			// - Borra el campo 'avatarUrl' en el registro de edicion
			// - Impacto en los archivos de avatar (original y edicion)

			// Variables
			const familias = comp.obtieneDesdeEntidad.familias(entidad);

			// Acciones para productos
			if (familias == "productos") {
				// Variables
				const url = original.avatar;

				// Condiciones 'AND' que se deben cumplir para descargar el avatar original
				// 1. Si la sugerencia fue rechazada
				// 2. Si el avatar original es un url
				// 3. Si el registro es una pelicula o coleccion,
				if (!aprob && url && url.includes("/") && entidad != "capitulos") {
					// Asigna un nombre al archivo a descargar
					original.avatar = Date.now() + path.extname(url);

					// Descarga el url
					let rutaYnombre = carpetaExterna + "2-Productos/Final/" + original.avatar;
					await comp.gestionArchivos.descarga(url, rutaYnombre);
				}

				// 2. Borra el campo 'avatarUrl' en el registro de edicion
				await baseDeDatos.actualizaPorId("prodsEdicion", edicion.id, {avatarUrl: null});
			}

			// Impacto en los archivos de avatar (original y edicion)
			await FN_edicion.actualizaArchivoAvatar({entidad, original, edicion, aprob});

			// Si es un registro de 'epocasDelAno', guarda el avatar en la carpeta tematica
			if (entidad == "epocasDelAno" && aprob) {
				let carpeta_avatar = edicion.carpetaAvatars ? edicion.carpetaAvatars : original.carpetaAvatars;
				carpeta_avatar = "4-EpocasDelAno/" + carpeta_avatar + "/";
				comp.gestionArchivos.copiaImagen("3-RCLVs/Final/" + edicion.avatar, carpeta_avatar + edicion.avatar);
			}

			// Fin
			return;
		},
		// Prod-Edición Form
		ingrReempl: async (original, edicion) => {
			// Obtiene la familia
			const familias = original.fuente ? "productos" : "rclvs";

			// Obtiene todos los campos a revisar
			const camposRevisar = [...variables.camposRevisar[familias]]; // Escrito así para desligarlos
			let resultado = [];

			// Deja solamente la intersección entre: los campos presentes en edición y los que se comparan
			for (let campoEdicion in edicion) {
				// Obtiene el campo con varios datos
				let campoRevisar = camposRevisar.find((n) => n.nombre == campoEdicion);

				// Si el campoRevisar no existe en los campos a revisar, saltea la rutina
				if (!campoRevisar) continue;

				// Obtiene las variables de include
				let {relacInclude} = campoRevisar;

				// Criterio para determinar qué valores mostrar
				const esEdicion = true;
				campoRevisar.mostrarOrig = await FN_edicion.valoresParaMostrar(original, relacInclude, campoRevisar);
				campoRevisar.mostrarEdic = await FN_edicion.valoresParaMostrar(edicion, relacInclude, campoRevisar, esEdicion);
				if (!campoRevisar.mostrarEdic) campoRevisar.mostrarEdic = "(vacío)";

				// Consolida los resultados
				resultado.push(campoRevisar);
			}

			// Paises
			const indicePais = resultado.findIndex((n) => n.nombre == "paises_id");
			if (indicePais >= 0) {
				let paises_id;

				// Países original
				paises_id = resultado[indicePais].mostrarOrig;
				const mostrarOrig = paises_id ? await comp.paises_idToNombre(paises_id) : "";

				// Países edición
				paises_id = resultado[indicePais].mostrarEdic;
				const mostrarEdic = await comp.paises_idToNombre(paises_id);

				// Fin
				resultado[indicePais] = {...resultado[indicePais], mostrarOrig, mostrarEdic};
			}

			// Separa los resultados entre ingresos y reemplazos
			const ingresos = resultado.filter((n) => !n.mostrarOrig); // Datos de edición, sin valor en la versión original
			const reemplazos = resultado.filter((n) => n.mostrarOrig);

			// Fin
			return [ingresos, reemplazos];
		},
		// API-edicAprobRech / VISTA-avatarGuardar - Cada vez que se aprueba/rechaza un valor editado
		edicAprobRech: async function (objeto) {
			// Variables
			const {entidad, original, originalGuardado, revId, campo, aprob, motivo_id} = objeto;
			let {edicion} = objeto;
			const familias = comp.obtieneDesdeEntidad.familias(entidad);
			const nombreEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
			const decision = "edics" + (aprob ? "Aprob" : "Rech");
			const ahora = comp.fechaHora.ahora();
			const camposRevisar = variables.camposRevisar[familias].filter((n) => n[entidad] || n[familias]);
			const campoRevisar = camposRevisar.find((n) => n.nombre == campo);
			const relacInclude = campoRevisar.relacInclude;
			const titulo = campoRevisar.titulo;
			let motivo;

			// Genera la información a actualizar
			let datos = {
				editadoPor_id: edicion.editadoPor_id,
				editadoEn: edicion.editadoEn,
				edicRevisadaPor_id: revId,
				edicRevisadaEn: ahora,
				leadTimeEdicion: comp.obtieneLeadTime(edicion.editadoEn, ahora),
			};

			// Acciones si se aprobó el campo
			if (aprob) {
				// 1. Prepara la info a guardar
				datos[campo] = edicion[campo];
				if (campo == "anoEstreno") datos.epocaEstreno_id = epocasEstreno.find((n) => n.desde <= edicion.anoEstreno).id;

				// 2. Actualiza el registro 'original'
				await baseDeDatos.actualizaPorId(entidad, original.id, datos);

				// 3. Si es una colección, revisa si corresponde actualizar ese campo en sus capítulos
				if (entidad == "colecciones") await procsFM.transfDatosDeColParaCaps(original, edicion, campo);
			}

			// Acciones si el campo fue sugerido por el usuario
			const camposNoPermInput = ["epocaOcurrencia_id", "publico_id", "prioridad_id"]; // campos que en 'creadoAprob_id' no se completan con el rol 'permInput'
			const fueProvistoPorElUsuario1 = original.statusRegistro_id == creadoAprob_id && !camposNoPermInput.includes(campo);
			const fueProvistoPorElUsuario2 = original.statusRegistro_id == aprobado_id;
			if (fueProvistoPorElUsuario1 || fueProvistoPorElUsuario2) {
				// 3. Actualiza la tabla de 'histEdics'
				let datosEdic = {entidad, entidad_id: original.id, campo, titulo};
				datosEdic = {
					...datosEdic,
					sugeridoPor_id: edicion.editadoPor_id,
					sugeridoEn: edicion.editadoEn,
					revisadoPor_id: revId,
					revisadoEn: ahora,
				};
				// Agrega el motivo del rechazo
				if (!aprob) {
					motivo = motivosEdics.find((n) => (motivo_id ? n.id == motivo_id : n.info_erronea));
					datosEdic.penalizac = motivo.penalizac;
					datosEdic.motivo_id = motivo.id;
				}
				// Asigna los valores 'aprob' y 'rech'
				let mostrarOrig = await FN_edicion.valoresParaMostrar(original, relacInclude, campoRevisar);
				let mostrarEdic = await FN_edicion.valoresParaMostrar(edicion, relacInclude, campoRevisar);
				datosEdic.valorDesc = aprob ? mostrarOrig : mostrarEdic;
				datosEdic.valorAprob = aprob ? mostrarEdic : mostrarOrig;
				// Agrega el registro
				baseDeDatos.agregaRegistro("histEdics", datosEdic);

				// 4. Aumenta el campo 'edicsAprob/edicsRech' en el registro del usuario
				baseDeDatos.aumentaElValorDeUnCampo("usuarios", edicion.editadoPor_id, decision, 1);

				// 5. Si corresponde, penaliza al usuario
				if (motivo) comp.penalizacAcum(edicion.editadoPor_id, motivo, familias);
			}

			// Elimina el valor del campo en el registro de 'edición' y en la variable
			await baseDeDatos.actualizaPorId(nombreEdic, edicion.id, {[campo]: null});
			delete edicion[campo];
			if (relacInclude) delete edicion[relacInclude]; // Es necesario eliminarla para que no la compare

			// 7. Disminuye la edición a su mínima expresión, y si corresponde la elimina
			edicion = await comp.puleEdicion(entidad, originalGuardado, edicion);

			// Fin
			return edicion;
		},
		// API-edicAprobRech / VISTA-avatarGuardar - Cada vez que se aprueba/rechaza un valor editado
		cartelNoQuedanCampos: {
			mensajes: ["Se terminó de procesar esta edición.", "Podés volver al tablero de control"],
			iconos: [variables.vistaTablero],
		},
		// RCLV-Edición Form
		RCLV_EdicForm_ingrReempl: async (rclvOrig, edicion) => {
			// Obtiene todos los campos a revisar
			let campos = [...variables.camposRevisar.rclvs];
			let resultado = [];

			// Deja solamente los campos presentes en edicion
			for (let nombre in edicion) {
				// Obtiene el campo con varios datos
				let campo = campos.find((n) => n.nombre == nombre);
				// Si el campo no existe en los campos a revisar, saltea la rutina
				if (!campo) continue;
				// Obtiene las variables de include
				let relacInclude = campo.relacInclude;
				// Criterio para determinar qué valores originales mostrar
				campo.mostrarOrig =
					relacInclude && rclvOrig[relacInclude] // El producto original tiene un valor 'include'
						? rclvOrig[relacInclude].nombre // Muestra el valor 'include'
						: rclvOrig[nombre]; // Muestra el valor 'simple'
				// Criterio para determinar qué valores editados mostrar
				campo.mostrarEdic =
					relacInclude && edicion[relacInclude] // El producto editado tiene un valor 'include'
						? edicion[relacInclude].nombre // Muestra el valor 'include'
						: edicion[nombre]; // Muestra el valor 'simple'
				// Consolidar los resultados
				resultado.push(campo);
			}
			// Separa los resultados entre ingresos y reemplazos
			let ingresos = resultado.filter((n) => !n.mostrarOrig); // Datos de edición, sin valor en la versión original
			let reemplazos = resultado.filter((n) => n.mostrarOrig);
			// Fin
			return [ingresos, reemplazos];
		},
	},

	// Links
	links: {
		problemasProd: (producto, urlAnterior) => {
			// Variables
			let informacion;
			const vistaAnterior = variables.vistaAnterior(urlAnterior);
			const vistaTablero = variables.vistaTablero;

			// El producto no posee links
			if (!informacion && !producto.links.length)
				informacion = {mensajes: ["Este producto no tiene links en nuestra Base de Datos"]};
			// Agrega los íconos
			if (informacion) informacion.iconos = [vistaAnterior, vistaTablero];

			// Fin
			return informacion;
		},
		obtieneSigProd: async (datos) => FN_links.obtieneSigProd(datos),
		variables: ({link, req}) => {
			const {IN, aprob, motivo_id} = req.query;
			const id = link.id;
			const revId = req.session.usuario.id;
			const decisAprob = aprob == "SI";
			const campoDecision = "links" + (decisAprob ? "Aprob" : "Rech");
			const asocProd = comp.obtieneDesdeCampo_id.asocProd(link);
			const anoEstreno = link[asocProd].anoEstreno;
			const ahora = comp.fechaHora.ahora();
			const fechaVencim = FN_links.fechaVencim({link, IN, ahora});
			const statusRegistro_id = IN == "SI" ? aprobado_id : inactivo_id;
			const statusCreado = link.statusRegistro_id == creado_id;

			// Variables para el historial
			const {statusRegistro_id: statusOriginal_id, statusSugeridoPor_id: statusOriginalPor_id} = link;
			const statusFinal_id = statusRegistro_id;

			// Arma los datos
			let datosLink = {
				...{fechaVencim, anoEstreno, statusSugeridoPor_id: revId, statusSugeridoEn: ahora, statusRegistro_id},
				motivo_id: statusRegistro_id == inactivo_id ? (motivo_id ? motivo_id : link.motivo_id) : null,
			};
			if (statusCreado) {
				datosLink.altaRevisadaPor_id = revId;
				datosLink.altaRevisadaEn = ahora;
				datosLink.leadTimeCreacion = comp.obtieneLeadTime(link.creadoEn, ahora);
			}

			// Fin
			let respuesta = {id, statusRegistro_id, statusCreado, decisAprob, datosLink, campoDecision};
			respuesta = {...respuesta, motivo_id, revId, statusOriginalPor_id, statusOriginal_id, statusFinal_id};
			return respuesta;
		},
	},

	// Varios
	descargaAvatarOriginal: async (original, entidad) => {
		// Descarga el archivo avatar
		const familias = comp.obtieneDesdeEntidad.familias(entidad);
		const carpeta = familias == "productos" ? "2-Productos" : "3-RCLVs";
		const ruta = carpetaExterna + carpeta + "/Final/";
		const avatar = Date.now() + path.extname(original.avatar);
		comp.gestionArchivos.descarga(original.avatar, ruta + avatar);

		// Actualiza el registro 'original'
		await baseDeDatos.actualizaPorId(entidad, original.id, {avatar});

		// Fin
		return;
	},
	procesaCampos: {
		prodsRclvs: (registros) => {
			// Reconvierte los elementos
			for (let rubro in registros)
				registros[rubro] = registros[rubro].map((n) => {
					// Variables
					const {entidad, entidad_id: id, nombre, fechaRef} = n;
					const fechaRefTexto = comp.fechaHora.diaMes(fechaRef);
					const abrev = entidad.slice(0, 3).toUpperCase();

					// Fin
					return {entidad, id, nombre, fechaRef, fechaRefTexto, abrev};
				});

			// Fin
			return registros;
		},
		prods: (productos) => {
			// Reconvierte los elementos
			for (let rubro in productos)
				productos[rubro] = productos[rubro].map((n) => {
					// Variables
					const {entidad, id} = n;
					const nombre =
						(n.nombreCastellano.length > anchoMaxTablero
							? n.nombreCastellano.slice(0, anchoMaxTablero - 1).trim() + "…"
							: n.nombreCastellano) + (n.anoEstreno ? " (" + n.anoEstreno + ")" : "");
					const fechaRef = n.fechaRef ? n.fechaRef : n.statusSugeridoEn;
					const fechaRefTexto = n.fechaRefTexto ? n.fechaRefTexto : comp.fechaHora.diaMes(fechaRef);
					const abrev = entidad.slice(0, 3).toUpperCase();
					const links = n.linksGral || n.linksTrailer;

					// Comienza el armado de los datos
					let datos = {entidad, id, nombre, fechaRef, fechaRefTexto, abrev, links};

					// Completa los datos
					if (rubro == "ED") datos.edicID = n.edicID;
					if (n.entidad == "colecciones") datos.csl = n.csl;

					// Fin
					return datos;
				});

			// Fin
			return productos;
		},
		rclvs: (rclvs) => {
			// Reconvierte los elementos
			for (let rubro in rclvs)
				rclvs[rubro] = rclvs[rubro].map((n) => {
					// Variables
					const {entidad, id} = n;
					const nombre = n.nombre.length > anchoMaxTablero ? n.nombre.slice(0, anchoMaxTablero - 1) + "…" : n.nombre;
					const fechaRef = n.fechaRef ? n.fechaRef : n.statusSugeridoEn;
					const fechaRefTexto = n.fechaRefTexto ? n.fechaRefTexto : comp.fechaHora.diaMes(fechaRef);
					const abrev = entidad.slice(0, 3).toUpperCase();

					// Comienza el armado de los datos
					let datos = {entidad, id, nombre, fechaRef, fechaRefTexto, abrev};

					// Completa los datos
					if (rubro == "ED") datos.edicID = n.edicID;

					// Fin
					return datos;
				});

			// Fin
			return rclvs;
		},
	},
};

// Funciones
let FN_links = {
	obtieneSigProd: async function (datos) {
		// Variables
		const {ediciones: edicsPend, prods} = cantLinksVencPorSem["0"];
		if (!prods) return; // si no hay nada para revisar, interrumpe la función
		let respuesta;

		// Ediciones
		if (edicsPend) {
			const ediciones = await this.obtieneLinks.ediciones();
			respuesta = await this.obtieneProdLink({links: ediciones, datos});
			if (respuesta) return respuesta;
		}

		// Obtiene los links
		const links = await this.obtieneLinks.links(); // obtiene los links 'a revisar'
		if (!links.length) return; // Si no hay links, interrumpe la función

		// Altas
		const creados = links.filter((n) => n.statusRegistro_id == creado_id);
		respuesta = await this.obtieneProdLink({links: creados, datos});
		if (respuesta) return respuesta;

		// Estándar - Capítulos
		const capitulos = links.filter((n) => n.capitulo_id && comp.linksVencPorSem.condicEstandar(n));
		respuesta = await this.obtieneProdLink({links: capitulos, datos});
		if (respuesta) return respuesta;

		// Estándar - Películas y Colecciones
		const pelisColes = links.filter((n) => !n.capitulo_id && comp.linksVencPorSem.condicEstandar(n));
		respuesta = await this.obtieneProdLink({links: pelisColes, datos});
		if (respuesta) return respuesta;

		// Estreno reciente
		const estrRec = links.filter((n) => comp.linksVencPorSem.condicEstrRec(n));
		respuesta = await this.obtieneProdLink({links: estrRec, datos});
		if (respuesta) return respuesta;

		// Fin
		return null;
	},
	obtieneLinks: {
		ediciones: async () => {
			const include = variables.entidades.asocProds;
			const ediciones = await baseDeDatos.obtieneTodos("linksEdicion", include);
			return ediciones;
		},
		links: async () => {
			// Variables
			const include = variables.entidades.asocProds;

			// Obtiene los links en status 'a revisar'
			const condicion = {statusRegistro_id: [...creados_ids, ...inacRecup_ids], prodAprob: true};
			const originales = await baseDeDatos
				.obtieneTodosPorCondicion("links", condicion, include)
				.then((n) => n.sort((a, b) => (a.capitulo_id && !b.capitulo_id ? -1 : !a.capitulo_id && b.capitulo_id ? 1 : 0))) // agrupados por capítulos y no capítulos
				.then((n) => n.sort((a, b) => (a.capitulo_id && b.capitulo_id ? a.capitulo_id - b.capitulo_id : 0))) // ordenados por capítulos
				.then((n) => n.sort((a, b) => (a.capitulo_id && b.capitulo_id ? a.grupoCol_id - b.grupoCol_id : 0))); // ordenados por colección
			//.then((n) => n.sort((a, b) => (a.statusSugeridoEn < b.statusSugeridoEn ? -1 : 1)));

			// Fin
			return originales;
		},
	},
	obtieneProdLink: async function ({links, datos}) {
		if (!links.length) return;

		// Variables
		const {entidad, id, revId} = datos;
		let productos;

		// Obtiene los productos
		productos = this.obtieneProds(links);
		productos = await this.puleLosResultados({productos, revId});

		// Devuelve un producto o link
		if (productos.length) {
			if (entidad && id) {
				const sigProd = this.prodDistintoAlActual({productos, entidad, id});
				if (sigProd) return sigProd;
			} else return {entidad: productos[0].entidad, id: productos[0].id};
		}

		// Fin
		return;
	},
	obtieneProds: (links) => {
		// Variables
		let productos = [];

		// Obtiene los productos
		for (let link of links) {
			// Variables
			const entidad = comp.obtieneDesdeCampo_id.entidadProd(link);
			const asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
			const campoFecha = link.statusRegistro_id ? "statusSugeridoEn" : "editadoEn";
			const fechaRef = link[campoFecha];

			// Acumula los productos
			productos.push({...link[asociacion], entidad, fechaRef});
		}

		// Fin
		return productos;
	},
	puleLosResultados: async ({productos, revId}) => {
		// Deja solamente los registros sin problemas de captura
		if (productos.length) productos = await comp.sinProblemasDeCaptura(productos, revId);

		// Acciones si hay más de un producto
		if (productos.length > 1) {
			// Elimina los repetidos dentro del grupo
			productos = comp.eliminaRepetidos(productos);

			// Ordena los productos
			productos
				.sort((a, b) => a.fechaRef - b.fechaRef) // por fecha más antigua
				.sort((a, b) => (a.capitulo && b.capitulo ? a.capitulo - b.capitulo : a.capitulo ? -1 : 0)) // por capítulo
				.sort((a, b) => (a.temporada && b.temporada ? a.temporada - b.temporada : a.temporada ? -1 : 0)) // por temporada
				.sort((a, b) => (a.coleccion_id && b.coleccion_id ? a.coleccion_id - b.coleccion_id : a.coleccion_id ? -1 : 0)) // por colección
				.sort((a, b) => (a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0)); // por entidad
		}

		// Fin
		return productos;
	},
	prodDistintoAlActual: ({productos, entidad, id}) => {
		// Elije un producto distinto al actual
		let sigProd = productos.find((n) => n.entidad != entidad || n.id != id);
		if (sigProd) sigProd = {entidad: sigProd.entidad, id: sigProd.id};

		// Fin
		return sigProd;
	},
	fechaVencim: ({link, ahora, IN}) => {
		// Resultado para rechazado
		if (IN != "SI") return null;

		// Resultado para 'creado'
		const ahoraTiempo = ahora.getTime();
		if (comp.linksVencPorSem.condicCreado(link)) return new Date(ahoraTiempo + linksVU_primRev);

		// Variables - si es una categoría estándar, averigua su semana
		const entidad = comp.linksVencPorSem.condicEstrRec(link) ? "estrRec" : link.capitulo_id ? "capitulos" : "pelisColes";

		// Obtiene la cantidad de links que vence cada semana
		const cantLinksVencsPorSemMayorCorte = Object.values(cantLinksVencPorSem)
			.slice(0, -1) // descarta los registros que no pertenecen a semanas
			.slice(linkSemInicial) // descarta los registros de las semanas anteriores a linkSemInicial
			.map((n) => n[entidad]);

		// Obtiene la semana a la cual agregarle una fecha de vencimiento, comenzando desde la más reciente
		const semana = cantLinksVencsPorSemMayorCorte.findIndex((n) => n < cantLinksVencPorSem.promSem[entidad]) + linkSemInicial;

		// Fin
		return new Date(ahoraTiempo + semana * unaSemana);
	},
};
let FN_tablManten = {
	obtieneRegs: async function (campos) {
		// Variables
		const {entidades} = campos;
		campos.include ? campos.include.push("ediciones") : (campos.include = ["ediciones"]);
		let resultados = [];

		// Obtiene los resultados
		for (let entidad of entidades) resultados.push(this.lecturaBD({entidad, ...campos}));

		// Consolida los resultados y los ordena
		resultados = await Promise.all(resultados)
			.then((n) => n.flat())
			.then((n) => n.sort((a, b) => b.statusSugeridoEn - a.statusSugeridoEn));

		// Quita los comprometidos por capturas
		resultados = await comp.sinProblemasDeCaptura(resultados, campos.usuario_id);

		// Fin
		return resultados;
	},
	lecturaBD: async ({status_id, include, entidad}) => {
		// Variables
		let includeBD = [...include];
		if (entidad == "colecciones") includeBD.push("csl");

		// Condiciones
		let condicion = {statusRegistro_id: status_id}; // Con status según parámetro
		if (variables.entidades.rclvs.includes(entidad)) condicion.id = {[Op.gt]: idMinRclv}; // Excluye los registros RCLV cuyo ID es <= idMinRclv

		// Resultado
		const resultados = await baseDeDatos.obtieneTodosPorCondicion(entidad, condicion, includeBD).then((n) =>
			n.map((m) => {
				let edicion = m.ediciones.find((m) => m.editadoPor_id == condicion.usuario_id);
				delete m.ediciones;
				if (edicion) {
					edicion = purgaEdicion(edicion, entidad);
					m = {...m, ...edicion}; // Actualiza el original con la edición
				}
				return {...m, entidad};
			})
		);

		// Fin
		return resultados;
	},
	obtieneSinEdicion: (entidad) => {
		// Variables
		const condicion = {statusRegistro_id: creadoAprob_id};
		if (entidad == "capitulos") condicion.statusColeccion_id = aprobado_id;

		// Obtiene la información
		return baseDeDatos
			.obtieneTodosPorCondicion(entidad, condicion, "ediciones")
			.then((n) => n.filter((m) => !m.ediciones.length))
			.then((n) => n.map((m) => ({...m, entidad})));
	},
	obtieneProdsDeLinks: async (links, usuario_id) => {
		// Variables
		let LI = [];

		// Obtiene los prods
		for (let link of links) {
			// Variables
			const entidad = comp.obtieneDesdeCampo_id.entidadProd(link);
			const asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
			const fechaRef = link.statusSugeridoEn;
			const fechaRefTexto = comp.fechaHora.diaMes(link.statusSugeridoEn);

			// Agrega los registros
			LI.push({...link[asociacion], entidad, fechaRef, fechaRefTexto});
		}

		if (LI.length > 1) {
			// Ordena
			LI.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef)); // Fecha más reciente

			// Elimina repetidos
			LI = comp.eliminaRepetidos(LI);
		}

		// Deja solamente los prods aprobados
		if (LI.length) LI = LI.filter((n) => aprobados_ids.includes(n.statusRegistro_id));

		// Deja solamente los prods sin problemas de captura
		if (LI.length) LI = await comp.sinProblemasDeCaptura(LI, usuario_id);

		// Fin
		return {LI};
	},
};
let FN_edicion = {
	valoresParaMostrar: async (registro, relacInclude, campoRevisar, esEdicion) => {
		// Variables
		const campo = campoRevisar.nombre;
		const casosEspeciales = [
			...["cfc", "bhr", "musical", "color", "deporte", "crueldad", "capEnCons"], // productos
			...["fechaMovil", "soloCfc", "ama"], // rclvs
			...["castellano", "subtitulos", "gratuito"], // links
		];

		// Obtiene una primera respuesta
		let resultado = relacInclude
			? registro[relacInclude] // El registro tiene un valor 'include'
				? registro[relacInclude].nombre // Muestra el valor 'include'
				: null
			: registro[campo]; // Muestra el valor 'simple'

		// Casos especiales
		if (casosEspeciales.includes(campo)) resultado = resultado == 1 ? "SI" : resultado == 0 ? "NO" : "";
		// Prioridad
		else if (campo == "prioridad_id") resultado = prioridadesRclv.find((n) => n.id == resultado).nombre;
		// Reemplaza 'Ninguno' por 'null'
		else if (!esEdicion && variables.entidades.rclvs_id.includes(campo) && registro[campo] == 1) resultado = null;

		// Últimas correcciones
		if (resultado === "") resultado = null;

		// Fin
		return resultado;
	},
	actualizaArchivoAvatar: async ({entidad, original, edicion, aprob}) => {
		// Variables
		const avatarOrig = original.avatar;
		const url = avatarOrig && avatarOrig.includes("/");
		const avatarEdic = edicion.avatar;
		const familias = comp.obtieneDesdeEntidad.familias(entidad);
		const carpeta = familias == "productos" ? "2-Productos" : "3-RCLVs";

		// Reemplazo
		if (aprob) {
			// ARCHIVO ORIGINAL: si el 'avatar original' es un archivo, lo elimina
			const rutaFinal = carpetaExterna + carpeta + "/Final/";
			if (avatarOrig && !url && comp.gestionArchivos.existe(rutaFinal + avatarOrig))
				comp.gestionArchivos.elimina(rutaFinal, avatarOrig);

			// ARCHIVO NUEVO: mueve el archivo de edición a la carpeta definitiva
			comp.gestionArchivos.mueveImagen(avatarEdic, carpeta + "/Revisar", carpeta + "/Final");
		}

		// Rechazo - Elimina el archivo de edicion
		else if (!aprob) comp.gestionArchivos.elimina(carpetaExterna + carpeta + "/Revisar/", avatarEdic);

		// Fin
		return;
	},
};
let FN = {
	purgaEdicionRclv: (edicion, entidad) => {
		// Quita de edición los campos 'null'
		for (let prop in edicion) if (edicion[prop] === null) delete edicion[prop];

		// Quita de edición los campos que no se comparan
		const familias = comp.obtieneDesdeEntidad.familias(entidad);
		const campos = variables.camposRevisar[familias].map((n) => n.nombre);
		for (let prop in edicion) if (!campos.includes(prop)) delete edicion[prop];

		// Fin
		return edicion;
	},
	actualizaLosProdsVinculadosNoAprobados: async ({entidad, campo_id, id}) => {
		// Variables
		const condicion = {[campo_id]: id, statusRegistro_id: {[Op.ne]: aprobado_id}};
		const datos = {[campo_id]: 1};

		// Actualiza
		await baseDeDatos.actualizaPorCondicion(entidad, condicion, datos);

		// Fin
		return;
	},
	statusFinalMasMotivo: async ({codigo, desaprueba, rclv, entidad, original, req}) => {
		// Variables
		const statusAprob =
			codigo == "alta" || (codigo == "revisionInactivar" && desaprueba) || (codigo == "revisionRecuperar" && !desaprueba);
		const datos = {entidad, ...original, publico: true, epocaOcurrencia: true};
		const prodCreadoAprob =
			statusAprob && !rclv ? await validacsFM.validacs.consolidado({datos}).then((n) => n.impideAprobado) : null;

		// Obtiene el status final
		const statusFinal_id = statusAprob
			? rclv
				? aprobado_id // si es un RCLV, se aprueba
				: prodCreadoAprob // si es un producto, revisa si tiene errores
				? creadoAprob_id // si tiene errores que impiden el aprobado, status 'creadoAprob'
				: entidad == "capitulos"
				? original.statusColeccion_id // capítulo sin errores, toma el status de su colección
				: aprobado_id // película/colección sin errores, queda aprobado
			: inactivo_id;

		// Obtiene el motivo
		const motivoRegAnt = ["revisionInactivar", "revisionRecuperar"].includes(codigo)
			? await baseDeDatos
					.obtienePorCondicionElUltimo("statusHistorial", {entidad, entidad_id: original.id}, "statusFinalEn")
					.then((n) => n.motivo_id)
			: null;
		const motivo_id = motivoRegAnt
			? motivoRegAnt // si es un revisionInactivar o revisionRecuperar, lo toma del registro anterior
			: codigo == "rechazar"
			? req.body.motivo_id // si es un rechazo, lo toma del formulario
			: null;

		// Fin
		return {statusFinal_id, motivo_id};
	},
};
