"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const validaPR = require("../2.1-Prod-RUD/PR-FN-Validar");

module.exports = {
	// Tablero
	TC: {
		obtieneProds_AL_ED: async (ahora, revID) => {
			// 1. Variables
			const campoFecha = "editadoEn";
			let include = ["pelicula", "coleccion", "capitulo", "personaje", "hecho", "tema", "evento", "epocaDelAno"];
			let productos = [];

			// 2. Obtiene todas las ediciones ajenas
			let ediciones = await BD_especificas.TC.obtieneEdicsAjenas("prods_edicion", revID, include);

			// 3.Elimina las edicionesProd con RCLV no aprobado
			if (ediciones.length)
				for (let i = ediciones.length - 1; i >= 0; i--)
					if (
						(ediciones[i].personaje && ediciones[i].personaje.statusRegistro_id != aprobado_id) ||
						(ediciones[i].hecho && ediciones[i].hecho.statusRegistro_id != aprobado_id) ||
						(ediciones[i].tema && ediciones[i].tema.statusRegistro_id != aprobado_id) ||
						(ediciones[i].evento && ediciones[i].evento.statusRegistro_id != aprobado_id) ||
						(ediciones[i].epocaDelAno && ediciones[i].epocaDelAno.statusRegistro_id != aprobado_id)
					)
						ediciones.splice(i, 1);

			// 4. Obtiene los productos
			if (ediciones.length)
				ediciones.map((n) => {
					// Variables
					let entidad = comp.obtieneDesdeEdicion.entidadProd(n);
					let asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);

					// Carga los productos en status menor o igual a aprobado
					if (n[asociacion].statusRegistro_id <= aprobado_id)
						productos.push({
							...n[asociacion],
							entidad,
							fechaRefTexto: comp.fechaHora.fechaDiaMes(n.editadoEn),
							edicID: n.id,
							fechaRef: n.editadoEn,
						});
				});

			// 5. Les agrega los productos en status 'creado' y sin edicion
			const SE = await creadosSinEdicion();
			if (SE.length) productos = [...productos, ...SE];

			// 6. Distribuye entre Altas y Ediciones
			let ED = [];
			let AL;
			if (productos.length) {
				// 6.A. Elimina los repetidos
				productos = comp.eliminaRepetidos(productos);
				// 6.B. Deja solamente los sin problemas de captura
				productos = comp.sinProblemasDeCaptura(productos, revID, ahora);
				// 6.C. Ordena por fecha descendente
				productos.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef));
				// 6.D. Altas
				AL = productos.filter((n) => n.statusRegistro_id == creado_id && n.entidad != "capitulos");
				if (AL.length) AL.sort((a, b) => b.linksGeneral - a.linksGeneral); // Primero los que tienen links
				// 6.E. Ediciones - es la suma de: en status 'creadoAprob' o 'aprobado'
				ED.push(...productos.filter((n) => [creadoAprob_id, aprobado_id].includes(n.statusRegistro_id)));
			}

			// Fin
			return {AL, ED};
		},
		obtieneProds_SE_IR: async (revID) => {
			// Variables
			const entidades = ["peliculas", "colecciones"];
			let campos;

			// SE: Sin Edición (en status creadoAprob)
			campos = {entidades, status_id: creadoAprob_id, revID, include: "ediciones"};
			let SE = obtieneRegs(campos).then((n) => n.filter((m) => !m.ediciones.length));

			// SEC: Capítulos sin edición (con colección 'aprobada' y en cualquier otro status)
			const condiciones = {statusColeccion_id: aprobado_id, statusRegistro_id: {[Op.ne]: aprobado_id}};
			let SEC = BD_genericas.obtieneTodosPorCondicionConInclude("capitulos", condiciones, "ediciones")
				.then((n) => n.filter((m) => !m.ediciones.length))
				.then((n) =>
					n.map((m) => {
						// Variables
						const datos = {
							...m,
							entidad: "capitulos",
							fechaRefTexto: comp.fechaHora.fechaDiaMes(n.creadoEn),
						};

						// Fin
						return datos;
					})
				);

			// IN: En staus 'inactivar'
			campos = {entidades, status_id: inactivar_id, campoRevID: "sugeridoPor_id", revID};
			let IN = obtieneRegs(campos);

			// RC: En status 'recuperar'
			campos = {entidades, status_id: recuperar_id, campoRevID: "sugeridoPor_id", revID};
			let RC = obtieneRegs(campos);

			// Espera los resultados
			[SE, SEC, IN, RC] = await Promise.all([SE, SEC, IN, RC]);

			// Fin
			return {SE: [...SE, ...SEC], IR: [...IN, ...RC]};
		},
		obtieneProds_Links: async (ahora, revID) => {
			// Obtiene todos los productos aprobados, con algún link ajeno en status provisorio

			// Obtiene los links 'a revisar'
			let links = await BD_especificas.TC.obtieneLinksAjenos(revID);
			// Obtiene los productos
			let productos = links.length ? obtieneProdsDeLinks(links, ahora, revID) : [];

			// Fin
			return productos;
		},
		obtieneRCLVs: async (ahora, revID) => {
			// Obtiene rclvs en situaciones particulares
			// Variables
			const entidades = variables.entidades.rclvs;
			const include = ["peliculas", "colecciones", "capitulos", "prods_ediciones"];
			let campos;

			// AL: Altas
			campos = {entidades, status_id: creado_id, campoFecha: "creadoEn", campoRevID: "creadoPor_id", revID, include};
			let AL = obtieneRegs(campos);

			// SL: Con solapamiento
			campos = {entidades, status_id: aprobado_id, revID, include: "ediciones"};
			let SL = obtieneRegs(campos).then((n) => n.filter((m) => m.solapamiento && !m.ediciones.length));

			// IR: En staus 'inactivar' o 'recuperar'
			campos = {entidades, status_id: [inactivar_id, recuperar_id], campoRevID: "sugeridoPor_id", revID};
			let IR = obtieneRegs(campos);

			// IN: Inactivo con producto
			campos = {entidades, status_id: inactivo_id, revID, include};
			let IN = obtieneRegs(campos).then((n) =>
				n.filter((m) => m.peliculas.length || m.colecciones.length || m.capitulos.length || m.prods_ediciones.length)
			);

			// Aguarda las lecturas
			[AL, SL, IR, IN] = await Promise.all([AL, SL, IR, IN]);

			// Fin
			return {AL, SL, IR, IN};
		},
		obtieneRCLVsConEdicAjena: async function (ahora, revID) {
			// 1. Variables
			const campoFecha = "editadoEn";
			let include = ["personaje", "hecho", "tema", "evento", "epocaDelAno"];
			let rclvs = [];

			// 2. Obtiene todas las ediciones ajenas
			let ediciones = await BD_especificas.TC.obtieneEdicsAjenas("rclvs_edicion", revID, include);

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
			if (rclvs.length) rclvs = comp.sinProblemasDeCaptura(rclvs, revID, ahora);

			// Fin
			return rclvs;
		},
		prod_ProcesaCampos: (productos) => {
			// Procesar los registros
			// Variables
			const anchoMax = 35;
			const rubros = Object.keys(productos);

			// Reconvierte los elementos
			for (let rubro of rubros)
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
					};
					if (rubro == "ED") datos.edicID = n.edicID;
					return datos;
				});

			// Fin
			return productos;
		},
		RCLV_ProcesaCampos: (rclvs) => {
			// Procesar los registros
			let anchoMax = 35;
			const rubros = Object.keys(rclvs);

			// Reconvierte los elementos
			for (let rubro of rubros)
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

	// Alta
	alta: {
		// Alta Guardar
		rclvEdicAprobRech: async (entidad, original, revID) => {
			// Variables
			const userID = original.creadoPor_id;
			const familia = comp.obtieneDesdeEntidad.familias(entidad);
			const camposRevisar = variables.camposRevisar[familia].filter((n) => n[entidad] || n[familia]);
			const motivoVersionActual = motivosEdics.find((n) => n.version_actual);
			const motivoInfoErronea = motivosEdics.find((n) => n.info_erronea);
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
					datosCompleto.duracion = motivo.duracion;
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
			let codigo = req.path.slice(1, -1);
			codigo = codigo.slice(codigo.indexOf("/") + 1);
			const inactivarRecuperar = codigo == "inactivar-o-recuperar";

			// Variables
			const {entidad, id, desaprueba} = req.query;
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const rclv = familia == "rclv";

			// Obtiene el registro original y el subcodigo
			const include = comp.obtieneTodosLosCamposInclude(entidad);
			const original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
			const statusOriginal_id = original.statusRegistro_id;

			// Obtiene el 'subcodigo'
			const subcodigo = inactivarRecuperar
				? statusOriginal_id == inactivar_id
					? "inactivar"
					: "recuperar"
				: req.path.endsWith("/alta/")
				? "alta"
				: "rechazo";

			// Averigua si la sugerencia fue aprobada
			const aprob = subcodigo != "rechazo" && !desaprueba;

			// Obtiene el status final
			const adicionales = {publico: true, epoca: true};
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

			// Obtiene el motivo_id y el comentario
			const motivo_id = inactivarRecuperar ? original.motivo_id : subcodigo == "rechazo" ? req.body.motivo_id : null;
			let comentario = status_registros.find((n) => n.id == statusFinal_id).nombre;
			if (req.body.comentario) comentario += " - " + req.body.comentario;
			if (comentario.endsWith(".")) comentario = comentario.slice(0, -1);

			// Fin
			return {
				...{entidad, id, original, statusOriginal_id, statusFinal_id},
				...{inactivarRecuperar, codigo, subcodigo, rclv, motivo_id, comentario, aprob},
			};
		},
		actualizaDiasDelAno: async ({desde, duracion, id}) => {
			// Obtiene el/los rangos
			const condicion = BD_especificas.condicsDDA({desde, duracion});

			// Se fija si en ese rango hay alguna epoca distinta a '1' y el ID actual
			const IDs_solapam = await BD_genericas.obtieneTodosPorCondicion("diasDelAno", condicion)
				.then((n) => n.filter((m) => m.epocaDelAno_id != 1 && m.epocaDelAno_id != id))
				.then((n) => n.map((n) => n.epocaDelAno_id))
				.then((n) => [...new Set(n)]);

			// En caso afirmativo, activa 'solapamiento' para esas epocas
			if (IDs_solapam.length) await BD_especificas.activaSolapam(IDs_solapam);

			// Limpia la tabla 'diasDelAno' del registro 'epocaDelAno_id'
			await BD_genericas.actualizaTodosPorCondicion("diasDelAno", {epocaDelAno_id: id}, {epocaDelAno_id: 1});

			// Actualiza la tabla 'diasDelAno' con la 'epocaDelAno_id'
			const datos = {epocaDelAno_id: id};
			await BD_genericas.actualizaTodosPorCondicion("diasDelAno", condicion, datos);

			// Actualiza la variable 'diasDelAno'
			diasDelAno = await BD_genericas.obtieneTodosConInclude("diasDelAno", "epocaDelAno");

			// Fin
			return;
		},
		prodsAsocs: async (entidad, id) => {
			// Variables
			const entidadesProd = variables.entidades.prods;
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);

			// Rutina por entidadProd
			for (let entidadProd of entidadesProd) {
				// Actualiza los productos no aprobados, quitándole el valor al 'campo_id'
				BD_especificas.actualizaLosProdsVinculadosNoAprobados({entidad: entidadProd, campo_id, id});

				// Similar rutina para los productos aprobados
				// Obtiene los productos aprobados con ese 'campo_id'
				const condicion = {[campo_id]: id, statusRegistro_id: aprobado_id};
				let prodsVinculados = await BD_genericas.obtieneTodosPorCondicion(entidadProd, condicion);
				// Los actualiza, fijándose si tiene errores
				for (let prodVinculado of prodsVinculados) {
					// Averigua si el producto tiene errores cuando se le actualiza el 'campo_id'
					let objeto = {[campo_id]: 1};
					prodVinculado = {...prodVinculado, ...objeto, publico: true, epoca: true};
					const errores = await validaPR.consolidado({datos: prodVinculado});

					// Si tiene errores, se le cambia el status a 'creadoAprob'
					if (errores.hay) objeto.statusRegistro_id = creadoAprob_id;

					// Actualiza el registro del producto
					BD_genericas.actualizaPorId(entidadProd, prodVinculado.id, objeto);
				}
			}
			// Sus productos asociados:
			// Dejan de estar vinculados
			// Si no pasan el control de error y estaban aprobados, pasan al status creadoAprob
		},
		// Productos Alta
		prodRclvRech: async (entidad, id) => {
			// Obtiene la edicion
			const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const condicion = {[campo_id]: id};
			const ediciones = await BD_genericas.obtieneTodosPorCondicion(entidadEdic, condicion);
			const familias = comp.obtieneDesdeEntidad.familias(entidad);

			// 1. Elimina el archivo avatar de las ediciones
			for (let edicion of ediciones)
				if (edicion.avatar) comp.gestionArchivos.elimina("./publico/imagenes/2-" + familias + "/Revisar", edicion.avatar);

			// 2. Elimina las ediciones
			BD_genericas.eliminaTodosPorCondicion(entidadEdic, {[campo_id]: id});

			//Fin
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

			if (familias == "productos") {
				// Variables
				const url = original.avatar;

				// Condiciones para descargar el avatar
				// 1. Si la sugerencia fue rechazada
				// 2. Si el avatar original es un url
				// 3. Si el registro es una pelicula o coleccion,
				if (!aprob && url && url.includes("/") && entidad != "capitulos") {
					// Asigna un nombre al archivo a descargar
					original.avatar = Date.now() + path.extname(url);

					// Descarga el url
					let rutaYnombre = "./publico/imagenes/2-Productos/Final/" + original.avatar;
					await comp.gestionArchivos.descarga(url, rutaYnombre);
				}

				// 2. Borra el campo 'avatarUrl' en el registro de edicion
				await BD_genericas.actualizaPorId("prods_edicion", edicion.id, {avatarUrl: null});
			}

			// Impacto en los archivos de avatar (original y edicion)
			await actualizaArchivoAvatar({entidad, original, edicion, aprob});

			// Si es un registro de 'epocasDelAno', guarda el avatar en la carpeta tematica
			if (entidad == "epocasDelAno" && aprob) {
				let carpeta_avatar = edicion.carpetaAvatars ? edicion.carpetaAvatars : original.carpetaAvatars;
				carpeta_avatar = "3-EpocasDelAno/" + carpeta_avatar + "/";
				comp.gestionArchivos.copiaImagen("2-RCLVs/Final/" + edicion.avatar, carpeta_avatar + edicion.avatar);
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
				campoRevisar.mostrarOrig = await valoresParaMostrar(original, relacInclude, campoRevisar);
				campoRevisar.mostrarEdic = await valoresParaMostrar(edicion, relacInclude, campoRevisar);
				// Consolidar los resultados
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
		// API-edicAprobRech / VISTA-prod_AvatarGuardar - Cada vez que se aprueba/rechaza un valor editado
		edicAprobRech: async function ({entidad, original, edicion, revID, campo, aprob, motivo_id}) {
			// TAREAS:
			// - Si se aprobó, actualiza el registro de 'original'
			// - Si es una colección, actualiza el registro 'original' de los capítulos
			// - Actualiza la tabla de 'histEdics'
			// - Aumenta el campo aprob/rech en el registro del usuario
			// - Si corresponde, penaliza al usuario
			// - Actualiza el registro de 'edición'
			// - Pule la variable edición y si no quedan campos, elimina el registro de la tabla de ediciones
			// - Para productos, actualiza el status del registro original si corresponde
			// - No alimenta el historial de cambio de status

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
				sugeridoPor_id: edicion.editadoPor_id,
				sugeridoEn: edicion.editadoEn,
				revisadoPor_id: revID,
				revisadoEn: ahora,
				leadTimeEdicion: comp.obtieneLeadTime(edicion.editadoEn, ahora),
			};

			// Acciones si se aprobó el registro
			if (aprob) {
				// 1. Si se aprobó, actualiza el registro 'original'
				datos[campo] = edicion[campo];
				await BD_genericas.actualizaPorId(entidad, original.id, datos);

				// 2. Si es una colección y se cumplen ciertas condiciones, actualiza ese campo en sus capítulos
				if (entidad == "colecciones") await procsCRUD.heredaDatos({...original, ...datos}, campo);
			}

			// Tareas si el campo fue sugerido por el usuario
			if (!["epoca_id", "publico_id", "prioridad_id"].includes(campo)) {
				// 2. Actualiza la tabla de 'histEdics'
				datos = {...datos, entidad, entidad_id: original.id, titulo, campo};
				// Agrega el motivo del rechazo
				if (!aprob) {
					motivo = motivosEdics.find((n) => (motivo_id ? n.id == motivo_id : n.info_erronea));
					datos = {...datos, duracion: motivo.duracion, motivo_id: motivo.id};
				}
				// Asigna los valores 'aprob' y 'rech'
				let mostrarOrig = await valoresParaMostrar(original, relacInclude, campoRevisar);
				let mostrarEdic = await valoresParaMostrar(edicion, relacInclude, campoRevisar);
				datos.valorAprob = aprob ? mostrarEdic : mostrarOrig;
				datos.valorDesc = aprob ? mostrarOrig : mostrarEdic;
				// Agrega el registro
				BD_genericas.agregaRegistro("histEdics", datos);

				// 3. Aumenta el campo 'edicsAprob/edicsRech' en el registro del usuario
				BD_genericas.aumentaElValorDeUnCampo("usuarios", edicion.editadoPor_id, decision, 1);

				// 4. Si corresponde, penaliza al usuario
				if (motivo) comp.usuarioPenalizAcum(edicion.editadoPor_id, motivo, familias);
			}

			// 5. Actualiza el registro de 'edición'
			await BD_genericas.actualizaPorId(nombreEdic, edicion.id, {[campo]: null});

			// 6. Pule la variable edición y si no quedan campos, elimina el registro de la tabla de ediciones
			let originalGuardado = aprob ? {...original, [campo]: edicion[campo]} : {...original};
			edicion[campo] = null;
			if (relacInclude) delete edicion[relacInclude];
			[edicion] = await procsCRUD.puleEdicion(entidad, originalGuardado, edicion);

			// 7. Si se cumplen ciertas condiciones, realiza varias tareas:
			// - Si está en un status anterior a 'aprobado' y aprueba el test de errores, lo pasa a 'aprobado'
			// - Si es una colección, realiza lo mismo para los capítulos
			// - Actualiza 'prodsEnRCLV'
			// - Informa si el status actual es 'aprobado'
			const statusAprob =
				familias == "rclvs" || edicion // Condición 1: que la edición haya sido toda procesada
					? true
					: // Condición 2: que la entidad sea un producto y esté en status 'creadoAprob_id'
					familias == "productos"
					? original.statusRegistro_id == creadoAprob_id
						? await procsCRUD.prodsPosibleAprobado(entidad, originalGuardado)
						: true
					: null;

			// Fin
			return [edicion, statusAprob];
		},
		// API-edicAprobRech / VISTA-prod_AvatarGuardar - Cada vez que se aprueba/rechaza un valor editado
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

	// Varios
	orignalAvatar: async (original, entidad) => {
		// Descarga el archivo avatar
		const avatar = Date.now() + path.extname(original.avatar);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const ruta = "./publico/imagenes/2-Avatar-" + petitFamilias + "-Final/";
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
			const fechaRef = campos.campoFecha ? n[campos.campoFecha] : n.sugeridoEn;
			const fechaRefTexto = comp.fechaHora.fechaDiaMes(fechaRef);
			return {...n, fechaRef, fechaRefTexto};
		});

		// Ordena los resultados
		resultados.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
	}

	// Fin
	return resultados;
};
// VISTA-prod_edicForm/prod_AvatarGuardar - Cada vez que se aprueba/rechaza un avatar sugerido
let actualizaArchivoAvatar = async ({entidad, original, edicion, aprob}) => {
	// Variables
	const avatarOrig = original.avatar;
	const avatarEdic = edicion.avatar;
	const familias = comp.obtieneDesdeEntidad.familias(entidad);

	// Reemplazo
	if (aprob) {
		// ARCHIVO ORIGINAL: si el 'avatar original' es un archivo, lo elimina
		const rutaFinal = "./publico/imagenes/2-" + familias + "/Final/";
		if (avatarOrig && comp.gestionArchivos.existe(rutaFinal + avatarOrig))
			comp.gestionArchivos.elimina(rutaFinal, avatarOrig);

		// ARCHIVO NUEVO: mueve el archivo de edición a la carpeta definitiva
		comp.gestionArchivos.mueveImagen(avatarEdic, "2-" + familias + "/Revisar", "2-" + familias + "/Final");
	}

	// Rechazo - Elimina el archivo de edicion
	else if (!aprob) comp.gestionArchivos.elimina("./publico/imagenes/2-" + familias + "/Revisar/", avatarEdic);

	// Fin
	return;
};
// Otras
let valoresComparar = (original, RCLV_actual, relacInclude, campo) => {
	// Valores a comparar
	let valorAprob = relacInclude ? RCLV_actual[relacInclude].nombre : RCLV_actual[campo];
	let valorDesc = relacInclude ? original[relacInclude].nombre : original[campo];

	// Casos especiales
	if (["solo_cfc", "ama"].includes(campo)) {
		valorAprob = RCLV_actual[campo] == 1 ? "SI" : "NO";
		valorDesc = original[campo] == 1 ? "SI" : "NO";
	}
	if (campo == "epoca_id") {
		valorAprob = RCLV_actual[relacInclude].nombre_pers;
		valorDesc = original[relacInclude].nombre_pers;
	}

	// Fin
	return {valorAprob, valorDesc};
};
let valoresParaMostrar = async (registro, relacInclude, campoRevisar) => {
	// Variables
	const campo = campoRevisar.nombre;

	// Obtiene una primera respuesta
	let resultado = relacInclude
		? registro[relacInclude] // El registro tiene un valor 'include'
			? registro[relacInclude].nombre // Muestra el valor 'include'
			: await BD_genericas.obtienePorId(campoRevisar.tabla, registro[campo]).then((n) => n.nombre) // Busca el valor include
		: registro[campo]; // Muestra el valor 'simple'

	// Casos especiales
	if (["cfc", "ocurrio", "musical", "color", "fechaMovil", "solo_cfc", "ama"].includes(campo))
		resultado = resultado == 1 ? "SI" : resultado == 0 ? "NO" : "";
	else if (variables.entidades.rclvs_id.includes(campo) && registro[campo] == 1) resultado = null;

	// Fin
	return resultado;
};
let obtieneProdsDeLinks = function (links, ahora, revID) {
	// 1. Variables
	let prods = {VN: [], OT: []}; // Vencidos y otros

	// 2. Separa entre VN y OT
	links.map((link) => {
		// Variables
		let entidad = comp.obtieneDesdeEdicion.entidadProd(link);
		let asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
		let campoFecha = link.statusRegistro_id ? "sugeridoEn" : "editadoEn";
		let fechaRef = link[campoFecha];
		let fechaRefTexto = comp.fechaHora.fechaDiaMes(link[campoFecha]);

		// Separa en VN y OT
		if (link.statusRegistro && link.statusRegistro.creadoAprob)
			prods.VN.push({...link[asociacion], entidad, fechaRef, fechaRefTexto});
		else prods.OT.push({...link[asociacion], entidad, fechaRef, fechaRefTexto});
	});

	// 3. Ordena por la fecha más antigua
	prods.VN.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef));
	prods.OT.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef));

	// 4. Elimina repetidos
	prods.VN = comp.eliminaRepetidos(prods.VN);
	prods.OT = comp.eliminaRepetidos(prods.OT);
	// Elimina repetidos entre grupos
	if (prods.VN.length && prods.OT)
		for (let i = prods.VN.length - 1; i >= 0; i--)
			if (prods.OT.find((n) => n.id == prods.VN[i].id && n.entidad == prods.VN[i].entidad)) prods.VN.splice(i, 1);

	// 5. Deja solamente los prods aprobados
	if (prods.VN.length) prods.VN = prods.VN.filter((n) => n.statusRegistro_id == aprobado_id);
	if (prods.OT.length) prods.OT = prods.OT.filter((n) => n.statusRegistro_id == aprobado_id);

	// 6. Deja solamente los sin problemas de captura
	if (prods.VN.length) prods.VN = comp.sinProblemasDeCaptura(prods.VN, revID, ahora);
	if (prods.OT.length) prods.OT = comp.sinProblemasDeCaptura(prods.OT, revID, ahora);

	// Fin
	return prods;
};
let creadosSinEdicion = async () => {
	// Obtiene los productos en status 'creado' y sin edicion
	const PL = BD_genericas.obtieneTodosPorCondicionConInclude("peliculas", {statusRegistro_id: creado_id}, "ediciones")
		.then((n) => n.filter((m) => !m.ediciones.length))
		.then((n) =>
			n.map((m) => {
				const fechaRef = m.creadoEn;
				const fechaRefTexto = comp.fechaHora.fechaDiaMes(fechaRef);
				return {...m, entidad: "peliculas", fechaRef, fechaRefTexto};
			})
		);
	const CL = BD_genericas.obtieneTodosPorCondicionConInclude("colecciones", {statusRegistro_id: creado_id}, "ediciones")
		.then((n) => n.filter((m) => !m.ediciones.length))
		.then((n) =>
			n.map((m) => {
				const fechaRef = m.creadoEn;
				const fechaRefTexto = comp.fechaHora.fechaDiaMes(fechaRef);
				return {...m, entidad: "peliculas", fechaRef, fechaRefTexto};
			})
		);

	// Consolida el resultado
	const SE = await Promise.all([PL, CL]).then(([a, b]) => [...a, ...b]);

	// Fin
	return SE;
};
