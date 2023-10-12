"use strict";
// Variables
const procsRutinas = require("../../funciones/3-Rutinas/RT-Control");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const validaPR = require("../2.1-Prod-RUD/PR-FN-Validar");

module.exports = {
	// Tablero
	TC: {
		obtieneProdsConEdic: async (revID) => {
			// Variables
			let include = [...variables.asocs.prods, ...variables.asocs.rclvs];
			let productos = [];

			// Obtiene todas las ediciones
			let ediciones = await BD_genericas.obtieneTodosConInclude("prodsEdicion", include);

			// Elimina las ediciones con RCLV no aprobado
			ediciones = ediciones.filter(
				(edicion) =>
					!variables.asocs.rclvs.some((rclv) => edicion[rclv] && edicion[rclv].statusRegistro_id != aprobado_id)
			);

			// Obtiene los productos
			ediciones.map((n) => {
				let entidad = comp.obtieneDesdeEdicion.entidadProd(n);
				let asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
				productos.push({
					...n[asociacion],
					entidad,
					fechaRefTexto: comp.fechaHora.fechaDiaMes(n.editadoEn),
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
			const AL_conEdicion = productos.filter((n) => n.statusRegistro_id == creado_id);
			const ED = productos.filter((n) => aprobados_ids.includes(n.statusRegistro_id));

			// Fin
			return {AL_conEdicion, ED};
		},
		obtieneProds_SE_IR: async (revID) => {
			// Variables
			const entidades = ["peliculas", "colecciones", "capitulos"];
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
			let AL_sinEdicion = obtieneRegs(campos)
				.then((n) => n.filter((m) => m.entidad != "capitulos")) // Deja solamente las películas y colecciones
				.then((n) => n.filter((m) => !m.ediciones.length)); // Deja solamente los sin edición

			// SE: Sin Edición (en status creadoAprob)
			campos = {entidades, status_id: creadoAprob_id, revID, include: "ediciones"};
			let SE = obtieneRegs(campos)
				.then((n) => n.filter((m) => m.entidad != "capitulos" || m.statusColeccion_id == aprobado_id)) // Deja solamente las películas, colecciones, y los capítulos con colección aprobada
				.then((n) => n.filter((m) => !m.ediciones.length)); // Deja solamente los registros sin edición

			// IN: En staus 'inactivar'
			campos = {entidades, status_id: inactivar_id, campoRevID: "statusSugeridoPor_id", revID};
			let IN = obtieneRegs(campos).then((regs) => {
				for (let i = regs.length - 1; i >= 0; i--)
					if (regs[i].coleccion_id && regs.find((n) => n.id == regs[i].coleccion_id)) regs.splice(i, 1);
				return regs;
			});

			// RC: En status 'recuperar'
			campos = {entidades, status_id: recuperar_id, campoRevID: "statusSugeridoPor_id", revID};
			let RC = obtieneRegs(campos).then((regs) => {
				for (let i = regs.length - 1; i >= 0; i--)
					if (regs[i].coleccion_id && regs.find((n) => n.id == regs[i].coleccion_id)) regs.splice(i, 1);
				return regs;
			});

			// Espera los resultados
			[AL_sinEdicion, SE, IN, RC] = await Promise.all([AL_sinEdicion, SE, IN, RC]);

			// Fin
			return {AL_sinEdicion, SE, IR: [...IN, ...RC]};
		},
		obtieneProds_Links: async (revID) => {
			// Variables
			if (!fechaPrimerLunesDelAno) procsRutinas.FechaPrimerLunesDelAno(); // En caso de que no exista la variable global, la obtiene con la FN

			// Obtiene los links 'a revisar'
			let linksRevisar = BD_especificas.TC.obtieneLinks(revID);

			// Averigua la cantidad de links de esta semana y totales
			let linksAprobsEstaSem = BD_genericas.obtieneTodosPorCondicion("links", {
				prodAprob: true,
				yaTuvoPrimRev: true,
				statusSugeridoEn: {[Op.gt]: lunesDeEstaSemana},
				statusRegistro_id: aprobado_id,
			}).then((n) => n.length);
			let linksAprobsTotal = BD_genericas.obtieneTodosPorCondicion("links", {
				prodAprob: true,
				statusRegistro_id: aprobados_ids,
			}).then((n) => n.length);

			// Espera a que se actualicen los valores
			[linksRevisar, linksAprobsEstaSem, linksAprobsTotal] = await Promise.all([
				linksRevisar,
				linksAprobsEstaSem,
				linksAprobsTotal,
			]);

			// Averigua el porcentaje de links aprobados en la semana
			const porcentaje = parseInt((linksAprobsEstaSem / linksAprobsTotal) * 100);

			// Obtiene los productos
			const aprobsPerms = porcentaje < 4 || linksAprobsEstaSem < 30;
			const productos = linksRevisar.length ? obtieneProdsDeLinks(linksRevisar, revID, aprobsPerms) : [];

			// Fin
			return {productos, linksAprobsEstaSem, linksAprobsTotal};
		},
		obtieneRCLVs: async (revID) => {
			// Variables
			const entidades = variables.entidades.rclvs;
			const include = [...variables.entidades.prods, "prodsEdiciones"];
			let campos;

			// AL: Altas
			campos = {entidades, status_id: creado_id, campoFecha: "creadoEn", campoRevID: "creadoPor_id", revID, include};
			let AL = obtieneRegs(campos);

			// SL: Con solapamiento
			campos = {entidades, status_id: aprobado_id, revID, include: "ediciones"};
			let SL = obtieneRegs(campos).then((n) => n.filter((m) => m.solapamiento && !m.ediciones.length));

			// IR: En staus 'inactivar' o 'recuperar'
			campos = {entidades, status_id: [inactivar_id, recuperar_id], campoRevID: "statusSugeridoPor_id", revID};
			let IR = obtieneRegs(campos);

			// Espera los resultados
			[AL, SL, IR] = await Promise.all([AL, SL, IR]);

			// Fin
			return {AL, SL, IR};
		},
		obtieneRCLVsConEdic: async function (revID) {
			// 1. Variables
			const campoFecha = "editadoEn";
			let include = variables.asocs.rclvs;
			let rclvs = [];

			// 2. Obtiene todas las ediciones ajenas
			let ediciones = await BD_genericas.obtieneTodosConInclude("rclvsEdicion", include);

			// 3. Obtiene los rclvs originales y deja solamente los rclvs aprobados
			if (ediciones.length) {
				// Obtiene los rclvs originales
				ediciones.map((n) => {
					let entidad = comp.obtieneDesdeEdicion.entidadRCLV(n);
					let asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
					rclvs.push({
						...n[asociacion],
						entidad,
						editadoEn: n.editadoEn,
						edicID: n.id,
						fechaRef: n[campoFecha],
						fechaRefTexto: comp.fechaHora.fechaDiaMes(n[campoFecha]),
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
		procesaCampos: {
			prods: (productos) => {
				// Variables
				const anchoMax = 35;

				// Reconvierte los elementos
				for (let rubro in productos)
					productos[rubro] = productos[rubro].map((n) => {
						let nombre =
							(n.nombreCastellano.length > anchoMax
								? n.nombreCastellano.slice(0, anchoMax - 1) + "…"
								: n.nombreCastellano) +
							" (" +
							n.anoEstreno +
							")";
						let datos = {
							id: n.id,
							entidad: n.entidad,
							nombre,
							abrev: n.entidad.slice(0, 3).toUpperCase(),
							fechaRefTexto: n.fechaRefTexto,
							links: n.linksGeneral || n.linksTrailer,
						};
						if (rubro == "ED") datos.edicID = n.edicID;
						return datos;
					});

				// Fin
				return productos;
			},
			rclvs: (rclvs) => {
				// Procesar los registros
				let anchoMax = 35;

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
	},

	// Alta
	alta: {
		// Alta Guardar
		rclvEdicAprobRech: async (entidad, original, revID) => {
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
			const RCLV_actual = await BD_genericas.obtienePorIdConInclude(entidad, original.id, include);

			// Rutina para comparar los campos
			for (let campoRevisar of camposRevisar) {
				// Variables
				const campo = campoRevisar.nombre;
				const relacInclude = campoRevisar.relacInclude;

				// Si el campo no fue sugerido por el usuario, saltea la ruta
				if (campo == "prioridad_id") continue;

				// Valores a comparar
				const {valorAprob, valorDesc} = valoresComparar(original, RCLV_actual, relacInclude, campo);

				// Si ninguna de las variables tiene un valor, saltea la rutina
				if (!valorAprob && !valorDesc) continue;

				// Genera la información
				datosCompleto = {...datosCabecera, campo, titulo: campoRevisar.titulo, valorAprob};

				// Si hubo una edición del revisor, actualiza/completa los datos
				if (valorAprob != valorDesc) {
					datosCompleto.valorDesc = valorDesc;
					let motivo = ["nombre", "apodo"].includes(campo) ? motivoVersionActual : motivoInfoErronea;
					datosCompleto.motivo_id = motivo.id; // con este campo se sabe si fue rechazado
					datosCompleto.penalizac = motivo.penalizac;
				}

				// Guarda los registros en "histEdics"
				BD_genericas.agregaRegistro("histEdics", datosCompleto);

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
			if (campoEdic) BD_genericas.aumentaElValorDeUnCampo("usuarios", userID, campoEdic, 1);

			// Fin
			return;
		},
	},

	guardar: {
		obtieneDatos: async function (req) {
			// Códigos posibles: 'rechazo', 'inactivar-o-recuperar'
			const {ruta} = comp.reqBasePathUrl(req);
			let codigo = ruta.slice(1, -1);
			codigo = codigo.slice(codigo.indexOf("/") + 1);
			const inactivarRecuperar = codigo == "inactivar-o-recuperar";

			// Variables
			const {entidad, id, desaprueba} = req.query;
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const rclv = familia == "rclv";

			// Obtiene el registro original y el subcodigo
			let include = comp.obtieneTodosLosCamposInclude(entidad);
			if (familia == "producto") include.push("links");
			const original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
			const statusOriginal_id = original.statusRegistro_id;

			// Obtiene el 'subcodigo'
			const subcodigo = inactivarRecuperar
				? statusOriginal_id == inactivar_id
					? "inactivar"
					: "recuperar"
				: ruta.endsWith("/alta/")
				? "alta"
				: "rechazo";

			// Averigua si la sugerencia fue aprobada
			const aprob = subcodigo != "rechazo" && !desaprueba;

			// Obtiene el status final
			const adicionales = {publico: true, epocaOcurrencia: true};
			const statusFinal_id =
				// Si es un rechazo, un recuperar desaprobado, o un inactivar aprobado
				(!aprob && subcodigo != "inactivar") || (aprob && subcodigo == "inactivar")
					? inactivo_id
					: // Los demás casos: un alta, un recuperar aprobado, o un inactivar desaprobado
					// Si es un RCLV, se aprueba
					rclv
					? aprobado_id
					: // Si es un producto, se revisa si tiene errores
					(await validaPR.consolidado({datos: {...original, entidad, ...adicionales}}).then((n) => n.hay))
					? creadoAprob_id
					: aprobado_id;

			// Obtiene el motivo_id
			const motivo_id =
				subcodigo == "rechazo" ? req.body.motivo_id : statusFinal_id == inactivo_id ? original.motivo_id : null;

			// Obtiene el comentario
			let comentario = statusRegistros.find((n) => n.id == statusFinal_id).nombre;
			if (req.body.comentario) comentario += " - " + req.body.comentario;
			if (comentario.endsWith(".")) comentario = comentario.slice(0, -1);

			// Fin
			return {
				...{entidad, id, original, statusOriginal_id, statusFinal_id},
				...{codigo, subcodigo, rclv, motivo_id, comentario, aprob},
			};
		},
		actualizaDiasDelAno: async ({desde, duracion, id}) => {
			// Obtiene el/los rangos
			const condicion = BD_especificas.condicsDDA({desde, duracion});

			// Se fija si en ese rango hay alguna epocaOcurrencia distinta a '1' y el ID actual
			const IDs_solapam = await BD_genericas.obtieneTodosPorCondicion("fechasDelAno", condicion)
				.then((n) => n.filter((m) => m.epocaDelAno_id != 1 && m.epocaDelAno_id != id))
				.then((n) => n.map((n) => n.epocaDelAno_id))
				.then((n) => [...new Set(n)]);

			// En caso afirmativo, activa 'solapamiento' para esas epocasDelAno
			if (IDs_solapam.length) await BD_especificas.activaSolapam(IDs_solapam);

			// Limpia la tabla 'fechasDelAno' del registro 'epocaDelAno_id'
			await BD_genericas.actualizaTodosPorCondicion("fechasDelAno", {epocaDelAno_id: id}, {epocaDelAno_id: 1});

			// Actualiza la tabla 'fechasDelAno' con la 'epocaDelAno_id'
			const datos = {epocaDelAno_id: id};
			await BD_genericas.actualizaTodosPorCondicion("fechasDelAno", condicion, datos);

			// Actualiza la variable 'fechasDelAno'
			fechasDelAno = await BD_genericas.obtieneTodosConInclude("fechasDelAno", "epocaDelAno");

			// Fin
			return;
		},
		prodsAsocs: async (entidad, id) => {
			// Variables
			const entidadesProd = variables.entidades.prods;
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const statusSugeridoPor_id = usAutom_id;
			const statusSugeridoEn = comp.fechaHora.ahora();
			const cambioStatus = {statusSugeridoPor_id, statusSugeridoEn, statusRegistro_id: creadoAprob_id};

			// Rutina por entidadProd
			for (let entidadProd of entidadesProd) {
				// Actualiza los productos no aprobados, quitándole el valor al 'campo_id'
				BD_especificas.actualizaLosProdsVinculadosNoAprobados({entidad: entidadProd, campo_id, id});

				// Obtiene los productos aprobados vinculados
				const condicion = {[campo_id]: id, statusRegistro_id: aprobado_id};
				let prodsVinculados = await BD_genericas.obtieneTodosPorCondicion(entidadProd, condicion);

				// Actualiza los productos aprobados, quitándole el valor al 'campo_id' y fijándose si tiene errores
				for (let prodVinculado of prodsVinculados) {
					// Averigua si el producto tiene errores cuando se le actualiza el 'campo_id'
					let objeto = {[campo_id]: 1};
					prodVinculado = {...prodVinculado, ...objeto, publico: true, epocaOcurrencia: true};
					const errores = await validaPR.consolidado({datos: prodVinculado});

					// Si tiene errores, se le cambia el status a 'creadoAprob'
					if (errores.hay) objeto = {...objeto, ...cambioStatus};

					// Actualiza el registro del producto
					BD_genericas.actualizaPorId(entidadProd, prodVinculado.id, objeto);

					// Si es una colección en status creadoAprob_id, actualiza sus capítulos que tengan status aprobado
					if (entidadProd == "colecciones" && errores.hay) {
						const condiciones = {coleccion_id: prodVinculado.id, statusRegistro_id: aprobado_id};
						BD_genericas.actualizaTodosPorCondicion("capitulos", condiciones, cambioStatus);
					}
				}
			}
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
				await BD_genericas.actualizaPorId("prodsEdicion", edicion.id, {avatarUrl: null});
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
			let camposRevisar = [...variables.camposRevisar[familias]]; // Escrito así para desligarlos
			let resultado = [];

			// Deja solamente la intersección entre: los campos presentes en edición y los que se comparan
			for (let campoEdicion in edicion) {
				// Obtiene el campo con varios datos
				let campoRevisar = camposRevisar.find((n) => n.nombre == campoEdicion);

				// Si el campoRevisar no existe en los campos a revisar, saltea la rutina
				if (!campoRevisar) continue;

				// Obtiene las variables de include
				let relacInclude = campoRevisar.relacInclude;

				// Criterio para determinar qué valores originales mostrar
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
				// 1. Actualiza el registro 'original'
				datos[campo] = edicion[campo];
				if (campo == "anoEstreno") datos.epocaEstreno_id = comp.obtieneLaEpocaDeEstreno(edicion.anoEstreno);
				await BD_genericas.actualizaPorId(entidad, original.id, datos);

				// 2. Si es una colección, revisa si corresponde actualizar ese campo en sus capítulos
				if (entidad == "colecciones") await procsCRUD.revisiones.transfiereDatos(original, edicion, campo);
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
				BD_genericas.agregaRegistro("histEdics", datosEdic);

				// 4. Aumenta el campo 'edicsAprob/edicsRech' en el registro del usuario
				BD_genericas.aumentaElValorDeUnCampo("usuarios", edicion.editadoPor_id, decision, 1);

				// 5. Si corresponde, penaliza al usuario
				if (motivo) comp.usuarioPenalizAcum(edicion.editadoPor_id, motivo, familias);
			}

			// Elimina el valor del campo en el registro de 'edición' y en la variable
			await BD_genericas.actualizaPorId(nombreEdic, edicion.id, {[campo]: null});
			delete edicion[campo];
			if (relacInclude) delete edicion[relacInclude]; // Es necesario eliminarla para que no la compare

			// 7. Disminuye la edición a su mínima expresión, y si corresponde la elimina
			edicion = await procsCRUD.puleEdicion(entidad, originalGuardado, edicion);

			// Fin
			return edicion;
		},
		// API-edicAprobRech / VISTA-avatarGuardar - Cada vez que se aprueba/rechaza un valor editado
		cartelNoQuedanCampos: {
			mensajes: ["Se terminó de procesar esta edición.", "Podés volver al tablero de control"],
			iconos: [
				{
					nombre: "fa-spell-check",
					link: "/revision/tablero-de-control",
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

	// Links - Vista
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
	siguienteProducto: async function ({producto, entidad, revID}) {
		// Variables
		const productos = await this.TC.obtieneProds_Links(revID)
			.then((n) => n.productos) // Obtiene solamente la parte de productos
			.then((n) => this.TC.procesaCampos.prods(n)); // Los ordena según corresponda

		// Obtiene el siguiente producto
		let siguienteProducto;
		for (let opcion in productos) {
			const prodsOpcion = productos[opcion];
			siguienteProducto = prodsOpcion.length ? prodsOpcion.find((n) => n.entidad != entidad || n.id != producto.id) : "";
			if (siguienteProducto) break;
		}

		// Genera el link
		const link = siguienteProducto
			? "/inactivar-captura/?entidad=" +
			  entidad +
			  "&id=" +
			  producto.id +
			  "&prodEntidad=" +
			  siguienteProducto.entidad +
			  "&prodID=" +
			  siguienteProducto.id +
			  "&origen=RLK"
			: "/revision/tablero-de-control";

		// Fin
		return link;
	},

	// Varios
	descargaAvatarOriginal: async (original, entidad) => {
		// Descarga el archivo avatar
		const familias = comp.obtieneDesdeEntidad.familias(entidad);
		const carpeta = (familias == "productos" ? "2-" : "3-") + comp.convierteLetras.inicialMayus(familias);
		const ruta = carpetaExterna + carpeta + "/Final/";
		const avatar = Date.now() + path.extname(original.avatar);
		comp.gestionArchivos.descarga(original.avatar, ruta + avatar);

		// Actualiza el registro 'original'
		await BD_genericas.actualizaPorId(entidad, original.id, {avatar});

		// Fin
		return;
	},
};

// Funciones
let obtieneRegs = async (campos) => {
	// Variables
	let lecturas = [];
	let resultados = [];
	// Obtiene el resultado por entidad
	for (let entidad of campos.entidades) lecturas.push(BD_especificas.TC.obtieneRegs({entidad, ...campos}));
	await Promise.all(lecturas).then((n) => n.map((m) => resultados.push(...m)));

	if (resultados.length) {
		resultados = resultados.map((n) => {
			const fechaRef = campos.campoFecha ? n[campos.campoFecha] : n.statusSugeridoEn;
			const fechaRefTexto = comp.fechaHora.fechaDiaMes(fechaRef);
			return {...n, fechaRef, fechaRefTexto};
		});

		// Ordena los resultados
		resultados.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef));
	}

	// Fin
	return resultados;
};
// VISTA-prod_edicForm/avatarGuardar - Cada vez que se aprueba/rechaza un avatar sugerido
let actualizaArchivoAvatar = async ({entidad, original, edicion, aprob}) => {
	// Variables
	const avatarOrig = original.avatar;
	const url = avatarOrig && avatarOrig.includes("/");
	const avatarEdic = edicion.avatar;
	const familias = comp.obtieneDesdeEntidad.familias(entidad);

	// Reemplazo
	if (aprob) {
		// ARCHIVO ORIGINAL: si el 'avatar original' es un archivo, lo elimina
		const carpeta = (familias == "productos" ? "2-" : "3-") + comp.convierteLetras.inicialMayus(familias);
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
// Otras
let valoresComparar = (original, RCLV_actual, relacInclude, campo) => {
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
};
let valoresParaMostrar = async (registro, relacInclude, campoRevisar, esEdicion) => {
	// Variables
	const campo = campoRevisar.nombre;
	const casosEspeciales = [
		...["cfc", "bhr", "musical", "color"], // productos
		...["fechaMovil", "soloCfc", "ama"], // rclvs
		...["castellano", "subtitulos", "gratuito"], // links
	];

	// Obtiene una primera respuesta
	let resultado = relacInclude
		? registro[relacInclude] // El registro tiene un valor 'include'
			? registro[relacInclude].nombre // Muestra el valor 'include'
			: await BD_genericas.obtienePorId(campoRevisar.tabla, registro[campo]).then((n) => n.nombre) // Busca el valor include
		: registro[campo]; // Muestra el valor 'simple'

	// Casos especiales
	if (casosEspeciales.includes(campo)) resultado = resultado == 1 ? "SI" : resultado == 0 ? "NO" : "";
	// Reemplaza 'Ninguno' por 'null'
	else if (!esEdicion && variables.entidades.rclvs_id.includes(campo) && registro[campo] == 1) resultado = null;

	// Últimas correcciones
	if (resultado === "") resultado = null;

	// Fin
	return resultado;
};
let obtieneProdsDeLinks = function (links, revID, aprobsPerms) {
	// Variables
	let prods = {PR: [], VN: [], OT: []}; // Primera Revisión, Vencidos y otros

	// Separa entre PR, VN y OT
	for (let link of links) {
		// Variables
		const entidad = comp.obtieneDesdeEdicion.entidadProd(link);
		const asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
		const campoFecha = link.statusRegistro_id ? "statusSugeridoEn" : "editadoEn";
		const fechaRef = link[campoFecha];
		const fechaRefTexto = comp.fechaHora.fechaDiaMes(link[campoFecha]);

		// Separa en PR y VN
		if (link.statusRegistro && link.statusRegistro_id == creadoAprob_id) {
			if (aprobsPerms)
				link.yaTuvoPrimRev
					? prods.VN.push({...link[asociacion], entidad, fechaRef, fechaRefTexto})
					: prods.PR.push({...link[asociacion], entidad, fechaRef, fechaRefTexto});
		}
		// Grupo OT
		else prods.OT.push({...link[asociacion], entidad, fechaRef, fechaRefTexto});
	}

	// Pule los resultados
	const metodos = Object.keys(prods);
	metodos.forEach((metodo, i) => {
		// Deja solamente los sin problemas de captura
		if (prods[metodo].length) prods[metodo] = comp.sinProblemasDeCaptura(prods[metodo], revID);

		// Elimina los repetidos dentro del grupo
		prods[metodo] = comp.eliminaRepetidos(prods[metodo]);

		// Elimina los repetidos entre grupos - si está en el método actual, elimina de los siguientes
		for (let j = i + 1; j < metodos.length; j++) {
			const metodoEliminar = metodos[j];
			prods[metodoEliminar] = prods[metodoEliminar].filter(
				(n) => !prods[metodo].some((m) => n.id == m.id && n.entidad == m.entidad)
			);
		}

		// Ordena los productos
		if (prods[metodo].length > 1)
			prods[metodo]
				.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef)) // Ordena por la fecha más antigua
				.sort((a, b) => (a.capitulo && b.capitulo ? a.capitulo - b.capitulo : a.capitulo ? -1 : 0))
				.sort((a, b) => (a.coleccion_id && b.coleccion_id ? a.coleccion_id - b.coleccion_id : a.coleccion_id ? -1 : 0))
				.sort((a, b) => (a.entidad < b.entidad ? -1 : a.entidad > b.entidad ? 1 : 0));
	});

	// Fin
	return prods;
};
