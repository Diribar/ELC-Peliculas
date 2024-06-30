"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");
const validacsFM = require("../2.0-Familias/FM-FN-Validar");

module.exports = {
	// Tableros
	tablRevision: {
		obtieneProds1: async (revID) => {
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
				let entidad = comp.obtieneDesdeCampo_id.entidadProd(n);
				let asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
				productos.push({
					...n[asociacion],
					entidad,
					fechaRefTexto: comp.fechaHora.diaMes(n.editadoEn),
					edicID: n.id,
					fechaRef: n.editadoEn,
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
						n.creadoPor_id == revID || // creado por el revisor
						n.creadoEn < comp.fechaHora.nuevoHorario(-1) // hace más de una hora
				);

				// Elimina los productos repetidos
				productos = comp.eliminaRepetidos(productos);

				// Elimina los productos con problemas de captura
				productos = comp.sinProblemasDeCaptura(productos, revID);

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
		obtieneProds2: async (revID) => {
			// Variables
			const entidades = [...variables.entidades.prods];
			let campos;

			// AL: En staus 'creado'
			campos = {
				entidades,
				status_id: creado_id,
				campoFecha: "creadoEn",
				campoRevID: "creadoPor_id",
				revID,
				include: "ediciones",
			};
			let AL_sinEdicion = tablRevision
				.obtieneRegs(campos)
				.then((n) => n.filter((m) => m.entidad != "capitulos" || aprobados_ids.includes(m.statusColeccion_id))) // Deja solamente las películas y colecciones, y capítulos con su colección aprobada
				.then((n) => n.filter((m) => !m.ediciones.length)); // Deja solamente los sin edición

			// SE: Sin Edición (en status creadoAprob)
			campos = {entidades, status_id: creadoAprob_id, revID, include: "ediciones"};
			let SE = tablRevision
				.obtieneRegs(campos)
				.then((n) => n.filter((m) => m.entidad != "capitulos" || m.statusColeccion_id == aprobado_id)) // Deja solamente las películas, colecciones, y los capítulos con colección aprobada
				.then((n) => n.filter((m) => !m.ediciones.length)); // Deja solamente los registros sin edición

			// IN: En staus 'inactivar'
			campos = {entidades, status_id: inactivar_id, campoRevID: "statusSugeridoPor_id", revID};
			let IN = tablRevision.obtieneRegs(campos).then((regs) => {
				for (let i = regs.length - 1; i >= 0; i--)
					if (regs[i].coleccion_id && regs.find((n) => n.id == regs[i].coleccion_id)) regs.splice(i, 1);
				return regs;
			});

			// RC: En status 'recuperar'
			campos = {entidades, status_id: recuperar_id, campoRevID: "statusSugeridoPor_id", revID};
			let RC = tablRevision.obtieneRegs(campos).then((regs) => {
				for (let i = regs.length - 1; i >= 0; i--)
					if (regs[i].coleccion_id && regs.find((n) => n.id == regs[i].coleccion_id)) regs.splice(i, 1);
				return regs;
			});

			// Espera los resultados
			[AL_sinEdicion, SE, IN, RC] = await Promise.all([AL_sinEdicion, SE, IN, RC]);

			// Fin
			return {AL_sinEdicion, SE, IN, RC};
		},
		obtieneProds3: async () => {
			// Obtiene los datos clave de los registros
			const statusRegistro_id = activos_ids;
			let registros = await Promise.all([
				baseDeDatos.obtieneTodosPorCondicion("peliculas", {statusRegistro_id}),
				baseDeDatos.obtieneTodosPorCondicion("capitulos", {statusRegistro_id}),
			])
				.then((n) => [
					...n[0].map((m) => ({entidad: "peliculas", ...m, fechaRefTexto: comp.fechaHora.diaMes(m.statusSugeridoEn)})),
					...n[1].map((m) => ({entidad: "capitulos", ...m, fechaRefTexto: comp.fechaHora.diaMes(m.statusSugeridoEn)})),
				])
				.then((n) => n.filter((m) => m.TMDB_id || m.IMDB_id || m.FA_id));

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
		obtieneSigProd_Links: async (revID) => FN_links.obtieneSigProd({revID}),
		obtieneRCLVs1: async (revID) => {
			// Variables
			const entidades = variables.entidades.rclvs;
			const include = [...variables.entidades.prods, "prodsEdiciones"];
			let campos;

			// AL: Altas
			campos = {entidades, status_id: creado_id, campoFecha: "creadoEn", campoRevID: "creadoPor_id", revID, include};
			let AL = tablRevision.obtieneRegs(campos);

			// IN: En staus 'inactivar'
			campos = {entidades, status_id: inactivar_id, campoRevID: "statusSugeridoPor_id", revID};
			let IN = tablRevision.obtieneRegs(campos);

			// RC: En staus 'recuperar'
			campos = {entidades, status_id: recuperar_id, campoRevID: "statusSugeridoPor_id", revID};
			let RC = tablRevision.obtieneRegs(campos);

			// SL: Con solapamiento
			campos = {entidades, status_id: aprobado_id, revID, include: "ediciones"};
			let SL = tablRevision.obtieneRegs(campos).then((n) => n.filter((m) => m.solapamiento && !m.ediciones.length));

			// FM: Con fecha móvil
			campos = {entidades, status_id: aprobado_id, revID, include: "ediciones"};
			let FM = tablRevision
				.obtieneRegs(campos)
				.then((originales) => originales.filter((original) => original.fechaMovil)) // con fecha móvil
				.then((originales) =>
					originales.map((original) => {
						// Obtiene la edición del usuario
						let edicion = original.ediciones.find((n) => n.editadoPor_id == revID);
						delete original.ediciones;

						// Actualiza el original con la edición
						if (edicion) {
							edicion = purgaEdicionRclv(edicion, original.entidad);
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
			[AL, SL, IN, RC, FM] = await Promise.all([AL, SL, IN, RC, FM]);

			// Fin
			return {AL, SL, IN, RC, FM};
		},
		obtieneRCLVs2: async function (revID) {
			// 1. Variables
			let include = variables.entidades.asocRclvs;
			let rclvs = [];

			// 2. Obtiene todas las ediciones ajenas
			let ediciones = await baseDeDatos.obtieneTodos("rclvsEdicion", include);

			// 3. Obtiene los rclvs originales y deja solamente los rclvs aprobados
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

			// 4. Elimina los repetidos
			if (rclvs.length) {
				rclvs.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
				rclvs = comp.eliminaRepetidos(rclvs);
			}

			// 5. Deja solamente los sin problemas de captura
			if (rclvs.length) rclvs = comp.sinProblemasDeCaptura(rclvs, revID);

			// Fin
			return {ED: rclvs};
		},
	},
	tablManten: {
		obtieneProds: async (userID) => {
			// Variables
			const petitFamilias = "prods";
			let condicion = {petitFamilias, userID};

			// Productos Inactivos
			condicion = {...condicion, campoFecha: "statusSugeridoEn", status_id: inactivo_id};
			let inactivos = tablManten.obtienePorEntidad(condicion);

			// Productos Aprobados
			condicion = {...condicion, campoFecha: "statusSugeridoEn", status_id: aprobado_id};
			let prodsAprob = tablManten.obtienePorEntidad(condicion);

			// Productos Sin Edición (en status creadoAprob)
			let SE_pel = tablManten.obtieneSinEdicion("peliculas");
			let SE_col = tablManten.obtieneSinEdicion("colecciones");
			let SE_cap = tablManten.obtieneSinEdicion("capitulos");

			// Calificaciones de productos y Preferencia por productos
			let cal = baseDeDatos.obtieneTodosPorCondicion("calRegistros", {usuario_id: userID});
			let ppp = baseDeDatos.obtieneTodosPorCondicion("pppRegistros", {usuario_id: userID, ppp_id: pppOpcsObj.yaLaVi.id});

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
		obtieneRCLVs: async (userID) => {
			// Variables
			const objetoFijo = {petitFamilias: "rclvs", userID};
			const include = [...variables.entidades.prods, "prodsEdiciones", "fechaDelAno"];
			let condicion;

			// Inactivos
			condicion = {...objetoFijo, campoFecha: "statusSugeridoEn", status_id: inactivo_id};
			let IN = tablManten.obtienePorEntidad(condicion);

			// Aprobados
			condicion = {...objetoFijo, campoFecha: "statusSugeridoEn", status_id: aprobado_id};
			let rclvsAprob = tablManten.obtienePorEntidad({...condicion, include});

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
		obtieneLinksInactivos: async (userID) => {
			// Variables
			let include = variables.entidades.asocProds;
			let condicion = {statusRegistro_id: inactivo_id};

			// Obtiene los links 'a revisar'
			let linksInactivos = await baseDeDatos.obtieneTodosPorCondicion("links", condicion, include);

			// Obtiene los productos
			let productos = linksInactivos.length ? tablManten.obtieneProdsDeLinks(linksInactivos, userID) : {LI: []};

			// Fin
			return productos;
		},
	},

	// Alta
	rclv: {
		// Alta Guardar
		edicAprobRech: async function (entidad, original, revID) {
			// Variables
			const userID = original.creadoPor_id;
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
				revisadoPor_id: revID,
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
			if (campoEdic) baseDeDatos.aumentaElValorDeUnCampo("usuarios", userID, campoEdic, 1);

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
			const {entidad, id, origen, desaprueba} = req.query;
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const {ruta} = comp.reqBasePathUrl(req);
			const codigo = procsFM({ruta, familia}); // 'revisarInactivar', 'revisarRecuperar', 'rechazar'
			const aprobado = !desaprueba || codigo == "alta";
			const producto = familia == "producto";
			const rclv = familia == "rclv";

			// Obtiene el registro original
			let include = comp.obtieneTodosLosCamposInclude(entidad);
			if (producto) include.push("links");
			const original = await baseDeDatos.obtienePorId(entidad, id, include);
			const statusOriginal_id = original.statusRegistro_id;

			// Obtiene el status final
			const adicionales = {publico: true, epocaOcurrencia: true};
			const statusFinal_id =
				codigo == "alta" || (codigo == "revisarInactivar" && desaprueba) || (codigo == "revisarRecuperar" && aprobado) // condiciones para aprobado
					? rclv // si es un RCLV, se aprueba
						? aprobado_id
						: (await validacsFM.validacs
								.consolidado({datos: {entidad, ...original, ...adicionales}})
								.then((n) => n.impideAprobado)) // si es un producto, se revisa si tiene errores
						? creadoAprob_id // si tiene errores que impiden el aprobado
						: entidad == "capitulos"
						? original.statusColeccion_id // si es un capítulo y fue aprobado, toma el status de su colección
						: aprobado_id // si no tiene errores
					: inactivo_id;

			// Obtiene el motivo_id
			const motivo_id =
				statusFinal_id == inactivo_id
					? codigo == "rechazar"
						? req.body.motivo_id
						: await baseDeDatos.obtieneElUltimo("histStatus", {entidad, entidad_id: id}, "statusFinalEn")
					: null;

			// Obtiene el comentario
			let comentario = req.body.comentario ? req.body.comentario : "";
			if (comentario.endsWith(".")) comentario = comentario.slice(0, -1);

			// Datos para la controladora
			const cola = "/?entidad=" + entidad + "&id=" + id + (origen ? "&origen=" + origen : "");
			const revID = req.session.usuario.id;
			const ahora = comp.fechaHora.ahora();
			const revisorPERL = req.session.usuario && req.session.usuario.rolUsuario.revisorPERL;
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
			const {baseUrl} = comp.reqBasePathUrl(req);
			const userID = original.statusSugeridoPor_id;
			const campoDecision = petitFamilias + (aprobado ? "Aprob" : "Rech");

			// Fin
			return {
				...{entidad, id, origen, original, statusOriginal_id, statusFinal_id},
				...{codigo, producto, rclv, motivo_id, comentario, aprobado},
				...{cola, revID, ahora, revisorPERL, petitFamilias, baseUrl, userID, campoDecision},
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
				actualizaLosProdsVinculadosNoAprobados({entidad: entidadProd, campo_id, id});

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
						baseDeDatos.actualizaTodosPorCondicion("capitulos", condicion, statusCreadoAprob);
					}
				}
			}
		},
		prodAprobEnLink: async (coleccion_id, statusCol) => {
			// Variables
			const prodAprob = aprobados_ids.includes(statusCol);
			const capsID = await baseDeDatos
				.obtieneTodosPorCondicion("capitulos", {coleccion_id})
				.then((n) => n.map((m) => m.id));

			// Actualiza el campo 'prodAprob' a los links de la colección
			await baseDeDatos.actualizaTodosPorCondicion("links", {capitulo_id: capsID}, {prodAprob});

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
			await actualizaArchivoAvatar({entidad, original, edicion, aprob});

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
				campoRevisar.mostrarOrig = await valoresParaMostrar(original, relacInclude, campoRevisar);
				campoRevisar.mostrarEdic = await valoresParaMostrar(edicion, relacInclude, campoRevisar, esEdicion);
				if (!campoRevisar.mostrarEdic) campoRevisar.mostrarEdic = "(vacío)";

				// Consolida los resultados
				resultado.push(campoRevisar);
			}

			// Paises
			let indicePais = resultado.findIndex((n) => n.nombre == "paises_id");
			if (indicePais >= 0) {
				let mostrarOrig, mostrarEdic, paises_id;
				// Países original
				paises_id = resultado[indicePais].mostrarOrig;
				mostrarOrig = paises_id ? await comp.paises_idToNombre(paises_id) : "";
				// Países edición
				paises_id = resultado[indicePais].mostrarEdic;
				mostrarEdic = await comp.paises_idToNombre(paises_id);
				// Fin
				resultado[indicePais] = {...resultado[indicePais], mostrarOrig, mostrarEdic};
			}

			// Separa los resultados entre ingresos y reemplazos
			let ingresos = resultado.filter((n) => !n.mostrarOrig); // Datos de edición, sin valor en la versión original
			let reemplazos = resultado.filter((n) => n.mostrarOrig);

			// Fin
			return [ingresos, reemplazos];
		},
		// API-edicAprobRech / VISTA-avatarGuardar - Cada vez que se aprueba/rechaza un valor editado
		edicAprobRech: async function ({entidad, original, edicion, originalGuardado, revID, campo, aprob, motivo_id}) {
			// Variables
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
				edicRevisadaPor_id: revID,
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
				if (entidad == "colecciones") await procsFM.transfiereDatos(original, edicion, campo);
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
					revisadoPor_id: revID,
					revisadoEn: ahora,
				};
				// Agrega el motivo del rechazo
				if (!aprob) {
					motivo = motivosEdics.find((n) => (motivo_id ? n.id == motivo_id : n.info_erronea));
					datosEdic.penalizac = motivo.penalizac;
					datosEdic.motivo_id = motivo.id;
				}
				// Asigna los valores 'aprob' y 'rech'
				let mostrarOrig = await valoresParaMostrar(original, relacInclude, campoRevisar);
				let mostrarEdic = await valoresParaMostrar(edicion, relacInclude, campoRevisar);
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
			iconos: [
				{
					nombre: "fa-spell-check",
					link: "/revision/tablero-de-entidades",
					titulo: "Ir al 'Tablero de Control' de Revisiones",
				},
			],
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
			const revID = req.session.usuario.id;
			const decisAprob = aprob == "SI";
			const campoDecision = "links" + (decisAprob ? "Aprob" : "Rech");
			const asocProd = comp.obtieneDesdeCampo_id.asocProd(link);
			const anoEstreno = link[asocProd].anoEstreno;
			const ahora = comp.fechaHora.ahora();
			const categoria_id = comp.linksVencPorSem.categoria_id(link); // cuando está recién creado es 'linksPrimRev_id', cuando es "creadoAprob" es 'linksEstrRec_id/linksEstandar_id'
			const fechaVencim = FN_links.fechaVencim({link, categoria_id, IN, ahora});
			const statusRegistro_id = IN == "SI" ? aprobado_id : inactivo_id;
			const statusCreado = link.statusRegistro_id == creado_id;

			// Arma los datos
			let datos = {
				categoria_id,
				fechaVencim,
				anoEstreno,
				yaTuvoPrimRev: !statusCreado, // sólo el status 'creado_id' es sin primera revisión
				statusSugeridoPor_id: revID,
				statusSugeridoEn: ahora,
				statusRegistro_id,
				motivo_id: statusRegistro_id == inactivo_id ? (motivo_id ? motivo_id : link.motivo_id) : null,
			};
			if (statusCreado) {
				datos.altaRevisadaPor_id = revID;
				datos.altaRevisadaEn = ahora;
				datos.leadTimeCreacion = comp.obtieneLeadTime(link.creadoEn, ahora);
			}

			// Fin
			return {id, statusRegistro_id, statusCreado, decisAprob, datos, campoDecision, motivo_id, revID};
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
		prods: (productos) => {
			// Variables
			const anchoMax = 32;

			// Reconvierte los elementos
			for (let rubro in productos)
				productos[rubro] = productos[rubro].map((n) => {
					// Variables
					let nombre =
						(n.nombreCastellano.length > anchoMax
							? n.nombreCastellano.slice(0, anchoMax - 1) + "…"
							: n.nombreCastellano) + (n.anoEstreno ? " (" + n.anoEstreno + ")" : "");

					// Comienza el armado de los datos
					let datos = {
						id: n.id,
						entidad: n.entidad,
						nombre,
						abrev: n.entidad.slice(0, 3).toUpperCase(),
						fechaRef: n.fechaRef,
						fechaRefTexto: n.fechaRefTexto,
						links: n.linksGral || n.linksTrailer,
					};

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
			// Variables
			const anchoMax = 35; // ancho máximo a mostrar de cada producto

			// Reconvierte los elementos
			for (let rubro in rclvs)
				rclvs[rubro] = rclvs[rubro].map((n) => {
					let nombre = n.nombre.length > anchoMax ? n.nombre.slice(0, anchoMax - 1) + "…" : n.nombre;
					let datos = {
						id: n.id,
						entidad: n.entidad,
						nombre,
						abrev: n.entidad.slice(0, 3).toUpperCase(),
						fechaRefTexto: n.fechaRefTexto,
					};
					if (rubro == "ED") datos.edicID = n.edicID;
					return datos;
				});

			// Fin
			return rclvs;
		},
	},
};

// Funciones
let purgaEdicionRclv = (edicion, entidad) => {
	// Quita de edición los campos 'null'
	for (let prop in edicion) if (edicion[prop] === null) delete edicion[prop];

	// Quita de edición los campos que no se comparan
	const familias = comp.obtieneDesdeEntidad.familias(entidad);
	const campos = variables.camposRevisar[familias].map((n) => n.nombre);
	for (let prop in edicion) if (!campos.includes(prop)) delete edicion[prop];

	// Fin
	return edicion;
};
let FN_links = {
	obtieneSigProd: async function (datos) {
		// Variables
		const pelisColesParaProc = cantLinksVencPorSem.paraProc.pelisColes;
		const capsParaProc = cantLinksVencPorSem.paraProc.capitulos;
		let respuesta, registros;

		// Obtiene los links a revisar
		const {originales, ediciones} = await this.obtieneLinks(); // obtiene los links 'a revisar'
		const creadoAprobs = originales.filter((n) => n.statusRegistro_id == creadoAprob_id);
		const inacRecups = originales.filter((n) => inacRecup_ids.includes(n.statusRegistro_id));

		// Si no hay links, interrumpe la función
		if (!ediciones.length && !originales.length) return;

		// Sin restricción - Ediciones
		respuesta = this.obtieneProdLink({links: ediciones, datos});
		if (respuesta) return respuesta;

		// Categoría "no estándar"
		registros = originales.filter((n) => n.statusRegistro_id == creado_id); // Altas
		respuesta = this.obtieneProdLink({links: registros, datos});
		if (respuesta) return respuesta;

		registros = inacRecups.filter((n) => n.categoria_id != linksEstandar_id); // Inactivar/Recuperar
		respuesta = this.obtieneProdLink({links: registros, datos});
		if (respuesta) return respuesta;

		registros = creadoAprobs.filter((n) => n.categoria_id != linksEstandar_id); // creadoAprob
		respuesta = this.obtieneProdLink({links: registros, datos});
		if (respuesta) return respuesta;

		// Categoría "estándar" - Capítulos
		if (capsParaProc) {
			registros = inacRecups.filter((n) => n.categoria_id == linksEstandar_id && n.capitulo_id); // Inactivar/Recuperar
			respuesta = this.obtieneProdLink({links: registros, datos});
			if (respuesta) return respuesta;

			registros = creadoAprobs.filter((n) => n.categoria_id == linksEstandar_id && n.capitulo_id); // creadoAprob
			respuesta = this.obtieneProdLink({links: registros, datos});
			if (respuesta) return respuesta;
		}

		// Categoría "estándar" - Películas y Colecciones
		if (pelisColesParaProc) {
			registros = inacRecups.filter((n) => n.categoria_id == linksEstandar_id && !n.capitulo_id); // Inactivar/Recuperar
			respuesta = this.obtieneProdLink({links: registros, datos});
			if (respuesta) return respuesta;

			registros = creadoAprobs.filter((n) => n.categoria_id == linksEstandar_id && !n.capitulo_id); // creadoAprob
			respuesta = this.obtieneProdLink({links: registros, datos});
			if (respuesta) return respuesta;
		}

		// Fin
		return null;
	},
	obtieneLinks: async () => {
		// Variables
		const include = variables.entidades.asocProds;

		// Obtiene los links en status 'a revisar'
		const condicion = {
			prodAprob: true,
			statusRegistro_id: {[Op.and]: [{[Op.ne]: aprobado_id}, {[Op.ne]: inactivo_id}]},
		};
		const originales = baseDeDatos
			.obtieneTodosPorCondicion("links", condicion, include)
			.then((n) => n.sort((a, b) => (a.capitulo_id && !b.capitulo_id ? -1 : !a.capitulo_id && b.capitulo_id ? 1 : 0))) // lotes por capítulos y no capítulos
			.then((n) => n.sort((a, b) => (a.capitulo_id && b.capitulo_id ? a.grupoCol_id - b.grupoCol_id : 0))) // capítulos por colección
			.then((n) => n.sort((a, b) => (a.statusSugeridoEn < b.statusSugeridoEn ? -1 : 1))); // lotes por 'statusSugeridoEn'

		// Obtiene todas las ediciones
		const ediciones = baseDeDatos.obtieneTodos("linksEdicion", include);

		// Los consolida
		const links = await Promise.all([originales, ediciones]).then(([originales, ediciones]) => ({originales, ediciones}));

		// Fin
		return links;
	},
	obtieneProdLink: function ({links, datos}) {
		if (!links.length) return;

		// Variables
		const {entidad, id, revID} = datos;
		let productos;

		// Obtiene los productos
		productos = this.obtieneProds(links);
		productos = this.puleLosResultados({productos, revID});

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
	puleLosResultados: ({productos, revID}) => {
		// Deja solamente los registros sin problemas de captura
		if (productos.length) productos = comp.sinProblemasDeCaptura(productos, revID);

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
	fechaVencim: ({link, ahora, IN, categoria_id}) => {
		// Variables
		const ahoraTiempo = ahora.getTime();

		let resultado =
			IN != "SI"
				? null
				: categoria_id == linksPrimRev_id
				? new Date(ahoraTiempo + linksVU_primRev)
				: categoria_id == linksEstrRec_id
				? new Date(ahoraTiempo + linksVU_estrRec)
				: null;

		if (!resultado) {
			// Si es una categoría estándar, averigua su semana
			let semana;

			// Semana para capítulo
			if (link.capitulo_id) semana = linksSemsEstandar;
			// Semana para los demás
			else {
				// Variables
				const corte = linksSemsPrimRev + 1; // 'semsPrimRev'--> nuevos, '+1'--> estreno reciente
				const piso = corte + 1;

				// Obtiene la semana a la cual agregarle una fecha de vencimiento (método 'flat')
				const cantLinksVencPorSemMayorCorte = Object.values(cantLinksVencPorSem)
					.slice(piso) // descarta los registros de la semanas anteriores al piso
					.slice(0, -3) // descarta los registros finales
					.map((n) => n.prods);
				const cantMin = Math.min(...cantLinksVencPorSemMayorCorte);
				semana = cantLinksVencPorSemMayorCorte.lastIndexOf(cantMin) + piso;
			}

			resultado = new Date(ahoraTiempo + semana * unaSemana);
		}

		// Fin
		return resultado;
	},
};
let tablRevision = {
	obtieneRegs: async function (campos) {
		// Variables
		let lecturas = [];
		let resultados = [];

		// Obtiene el resultado por entidad
		for (let entidad of campos.entidades) lecturas.push(this.lecturaBD({entidad, ...campos}));
		await Promise.all(lecturas).then((n) => n.map((m) => resultados.push(...m)));

		if (resultados.length) {
			resultados = resultados.map((n) => {
				const fechaRef = campos.campoFecha ? n[campos.campoFecha] : n.statusSugeridoEn;
				const fechaRefTexto = comp.fechaHora.diaMes(fechaRef);
				return {...n, fechaRef, fechaRefTexto};
			});

			// Ordena los resultados
			resultados.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef));
		}

		// Fin
		return resultados;
	},
	lecturaBD: async ({entidad, status_id, campoFecha, campoRevID, include, revID}) => {
		// Variables
		const haceUnaHora = comp.fechaHora.nuevoHorario(-1);
		const haceDosHoras = comp.fechaHora.nuevoHorario(-2);

		// Condiciones de captura
		const condicsCaptura = [
			{capturadoEn: null}, // Que no esté capturado
			{capturadoEn: {[Op.lt]: haceDosHoras}}, // Que esté capturado hace más de dos horas
			{capturadoPor_id: {[Op.ne]: revID}, capturadoEn: {[Op.lt]: haceUnaHora}}, // Que la captura haya sido por otro usuario y hace más de una hora
			{capturadoPor_id: {[Op.ne]: revID}, capturaActiva: {[Op.ne]: 1}}, // Que la captura haya sido por otro usuario y esté inactiva
			{capturadoPor_id: revID, capturadoEn: {[Op.gt]: haceUnaHora}}, // Que esté capturado por este usuario hace menos de una hora
		];

		// Condiciones
		let condicion = {
			statusRegistro_id: status_id, // Con status según parámetro
			[Op.and]: [{[Op.or]: condicsCaptura}], // Es necesario el [Op.and], porque luego se le agregan condicion
		};
		if (campoFecha) {
			if (campoRevID) {
				// Que esté propuesto por el usuario
				const condicsUsuario = [{[campoRevID]: [revID, usAutom_id]}, {[campoFecha]: {[Op.lt]: haceUnaHora}}];
				condicion[Op.and].push({[Op.or]: condicsUsuario});
			}
			// Que esté propuesto hace más de una hora
			else condicion[campoFecha] = {[Op.lt]: haceUnaHora};
		}

		// Excluye los registros RCLV cuyo ID es <= 10
		if (variables.entidades.rclvs.includes(entidad)) condicion.id = {[Op.gt]: 10};

		// Resultado
		const resultados = baseDeDatos
			.obtieneTodosPorCondicion(entidad, condicion, include)
			.then((n) => n.map((m) => ({...m, entidad})));

		// Fin
		return resultados;
	},
};
let valoresParaMostrar = async (registro, relacInclude, campoRevisar, esEdicion) => {
	// Variables
	const campo = campoRevisar.nombre;
	const casosEspeciales = [
		...["cfc", "bhr", "musical", "color", "deporte"], // productos
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
	else if (campo == "prioridad_id") resultado = variables.prioridadesRCLV.find((n) => n.id == resultado).nombre;
	// Reemplaza 'Ninguno' por 'null'
	else if (!esEdicion && variables.entidades.rclvs_id.includes(campo) && registro[campo] == 1) resultado = null;

	// Últimas correcciones
	if (resultado === "") resultado = null;

	// Fin
	return resultado;
};
let actualizaArchivoAvatar = async ({entidad, original, edicion, aprob}) => {
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
};
let actualizaLosProdsVinculadosNoAprobados = async ({entidad, campo_id, id}) => {
	// Variables
	const condicion = {[campo_id]: id, statusRegistro_id: {[Op.ne]: aprobado_id}};
	const datos = {[campo_id]: 1};

	// Actualiza
	await baseDeDatos.actualizaTodosPorCondicion(entidad, condicion, datos);

	// Fin
	return;
};
let tablManten = {
	obtieneProdsDeLinks: (links, userID) => {
		// Variables
		let LI = [];

		// Obtiene los prods
		for (let link of links) {
			// Variables
			let entidad = comp.obtieneDesdeCampo_id.entidadProd(link);
			let asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
			let fechaRef = link.statusSugeridoEn;
			let fechaRefTexto = comp.fechaHora.diaMes(link.statusSugeridoEn);

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
		if (LI.length) LI = comp.sinProblemasDeCaptura(LI, userID);

		// Fin
		return {LI};
	},
	obtienePorEntidad: async function ({...condicion}) {
		// Variables
		const {petitFamilias} = condicion;
		const entidades = variables.entidades[petitFamilias];
		condicion.include ? condicion.include.push("ediciones") : (condicion.include = ["ediciones"]);
		let resultados1 = [];
		let resultados2 = [];

		// Rutina
		for (let entidad of entidades) resultados1.push(this.obtieneRegs({entidad, ...condicion}));

		// Espera hasta tener todos los resultados
		await Promise.all(resultados1).then((n) => n.map((m) => resultados2.push(...m)));

		// Ordena
		resultados2.sort((a, b) => b.fechaRef - a.fechaRef);

		// Fin
		return resultados2;
	},
	obtieneRegs: async ({petitFamilias, userID, campoFecha, status_id, include, entidad}) => {
		// Variables
		const haceUnaHora = comp.fechaHora.nuevoHorario(-1);
		const haceDosHoras = comp.fechaHora.nuevoHorario(-2);
		const idMin = petitFamilias == "rclvs" ? 10 : 0;
		let includeBD = [...include];
		if (entidad == "colecciones") includeBD.push("csl");

		// Condiciones
		const condicion = {
			// Con status según parámetro
			statusRegistro_id: status_id,
			// Que cumpla alguno de los siguientes sobre la 'captura':
			[Op.or]: [
				// Que no esté capturado
				{capturadoEn: null},
				// Que esté capturado hace más de dos horas
				{capturadoEn: {[Op.lt]: haceDosHoras}},
				// Que la captura haya sido por otro usuario y hace más de una hora
				{capturadoPor_id: {[Op.ne]: userID}, capturadoEn: {[Op.lt]: haceUnaHora}},
				// Que la captura haya sido por otro usuario y esté inactiva
				{capturadoPor_id: {[Op.ne]: userID}, capturaActiva: {[Op.ne]: 1}},
				// Que esté capturado por este usuario hace menos de una hora
				{capturadoPor_id: userID, capturadoEn: {[Op.gt]: haceUnaHora}},
			],
			// Si es un rclv, que su id > 10
			id: {[Op.gt]: idMin},
		};

		const registros = await baseDeDatos
			.obtieneTodosPorCondicion(entidad, condicion, includeBD)
			// Agrega la fechaRef y actualiza el original con la edición
			.then((n) =>
				n.map((m) => {
					// Variables
					const fechaRef = m[campoFecha];
					const fechaRefTexto = comp.fechaHora.diaMes(fechaRef);

					// Obtiene la edición del usuario
					let edicion = m.ediciones.find((m) => m.editadoPor_id == condicion.userID);
					delete m.ediciones;

					// Actualiza el original con la edición
					if (edicion) {
						edicion = purgaEdicion(edicion, entidad);
						m = {...m, ...edicion};
					}

					// Fin
					return {...m, entidad, fechaRef, fechaRefTexto};
				})
			);

		// Fin
		return registros;
	},
	obtieneSinEdicion: (entidad) => {
		// Variables
		const condicion = {statusRegistro_id: creadoAprob_id};
		if (entidad == "capitulos") condicion.statusColeccion_id = aprobado_id;

		// Obtiene la información
		return baseDeDatos
			.obtieneTodosPorCondicion(entidad, condicion, "ediciones")
			.then((n) => n.filter((m) => !m.ediciones.length))
			.then((n) =>
				n.map((m) => {
					// Variables
					const datos = {
						...m,
						entidad,
						fechaRef: m.statusSugeridoEn,
						fechaRefTexto: comp.fechaHora.diaMes(m.statusSugeridoEn),
					};

					// Fin
					return datos;
				})
			);
	},
};
