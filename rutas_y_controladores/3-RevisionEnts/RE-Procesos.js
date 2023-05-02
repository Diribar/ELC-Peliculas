"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const validaPR = require("../2.1-Prod-RUD/PR-FN-Validar");

module.exports = {
	// Tablero
	TC: {
		obtieneProds_AL_ED: async (ahora, revID) => {
			// 1. Variables
			const campoFecha = "editado_en";
			let include = ["pelicula", "coleccion", "capitulo", "personaje", "hecho", "tema"];
			let productos = [];

			// 2. Obtiene todas las ediciones ajenas
			let ediciones = await BD_especificas.TC_obtieneEdicsAptas("prods_edicion", include);

			// 3.Elimina las edicionesProd con RCLV no aprobado
			if (ediciones.length)
				for (let i = ediciones.length - 1; i >= 0; i--)
					if (
						(ediciones[i].personaje && ediciones[i].personaje.status_registro_id != aprobado_id) ||
						(ediciones[i].hecho && ediciones[i].hecho.status_registro_id != aprobado_id) ||
						(ediciones[i].tema && ediciones[i].tema.status_registro_id != aprobado_id)
					)
						ediciones.splice(i, 1);

			// 4. Obtiene los productos
			if (ediciones.length)
				ediciones.map((n) => {
					let entidad = comp.obtieneProdEntidadDesdeProd_id(n);
					let asociacion = comp.obtieneAsociacion(entidad);
					// Carga los productos excepto los aprobados y editados por el revisor
					if (n[asociacion].status_registro_id != aprobado_id || n.editado_por_id != revID)
						productos.push({
							...n[asociacion],
							entidad,
							edicID: n.id,
							fechaRef: n[campoFecha],
							fechaRefTexto: comp.fechaDiaMes(n[campoFecha]),
						});
				});

			// 5. Les agrega los productos en status 'creado' y sin edicion
			const SE = await creadosSinEdicion();
			if (SE.length) productos = [...productos, ...SE];

			// 6. Distribuye entre Altas y Ediciones
			let AL = {};
			let ED = {};
			if (productos.length) {
				// 6.A. Elimina los repetidos
				productos = comp.eliminaRepetidos(productos);
				// 6.B. Ordena por fecha descendente
				productos.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef));
				// 6.c. Deja solamente los sin problemas de captura
				productos = sinProblemasDeCaptura(productos, revID, ahora);
				// 6.D. Altas
				AL = productos.filter((n) => n.status_registro_id == creado_id && n.entidad != "capitulos");
				if (AL.length) AL.sort((a, b) => b.links_general - a.links_general); // Primero los que tienen links
				// 6.E. Ediciones - es la suma de:
				// - En status 'creado_aprob' y que no sean 'capítulos'
				// - En status 'aprobado'
				ED = productos.filter((n) => n.status_registro_id == creado_aprob_id && n.entidad != "capitulos");
				ED.push(...productos.filter((n) => n.status_registro_id == aprobado_id));
				// 6.F. Primero los productos con menor status
				if (ED.length) ED.sort((a, b) => b.fechaRef - a.fechaRef);
			}

			// Fin
			return {AL, ED};
		},
		obtieneProds_SE_IR: async (revID) => {
			// Obtiene productos en situaciones particulares
			// Variables
			const entidades = ["peliculas", "colecciones"];
			let campos;
			// SE: Sin Edición (en status creado_aprob)
			campos = {entidades, status_id: creado_aprob_id, revID, include: "ediciones"};
			let SE = await TC_obtieneRegs(campos);
			SE = SE.filter((n) => !n.ediciones.length);
			// IN: En staus 'inactivar'
			campos = {entidades, status_id: inactivar_id, campoRevID: "sugerido_por_id", revID};
			const IN = await TC_obtieneRegs(campos);
			// RC: En status 'recuperar'
			campos = {entidades, status_id: recuperar_id, campoRevID: "sugerido_por_id", revID};
			const RC = await TC_obtieneRegs(campos);

			// Fin
			return {SE, IR: [...IN, ...RC]};
		},
		obtieneProds_Links: async (ahora, revID) => {
			// Obtiene todos los productos aprobados, con algún link ajeno en status provisorio

			// Obtiene los links 'a revisar'
			let links = await BD_especificas.TC_obtieneLinksAjenos(revID);
			// Obtiene los productos
			let productos = links.length ? obtieneProdsDeLinks(links, ahora, revID) : [];

			// Fin
			return productos;
		},
		obtieneRCLVs: async (ahora, revID) => {
			// Obtiene rclvs en situaciones particulares
			// Variables
			const entidades = variables.entidadesRCLV;
			const include = ["peliculas", "colecciones", "capitulos", "prods_edicion"];
			let campos;

			// AL: Altas
			campos = {entidades, status_id: creado_id, campoFecha: "creado_en", campoRevID: "creado_por_id", revID, include};
			const AL = TC_obtieneRegs(campos)
			// .then((n) =>
			// 	n.filter(
			// 		(m) =>
			// 			m.entidad == "eventos" ||
			// 			m.entidad == "epocas_del_ano" ||
			// 			m.peliculas.length ||
			// 			m.colecciones.length ||
			// 			m.capitulos.length ||
			// 			m.prods_edicion.length
			// 	)
			// );

			// SL: Con solapamiento
			campos = {entidades, status_id: aprobado_id, revID, include: "ediciones"};
			const SL = TC_obtieneRegs(campos).then((n) => n.filter((m) => m.solapamiento && !m.ediciones.length));

			// IR: En staus 'inactivar' o 'recuperar'
			campos = {entidades, status_id: [inactivar_id, recuperar_id], campoRevID: "sugerido_por_id", revID};
			const IR = TC_obtieneRegs(campos);

			// IN: Inactivo con producto
			campos = {entidades, status_id: inactivo_id, revID, include};
			const IN = TC_obtieneRegs(campos).then((n) =>
				n.filter((m) => m.peliculas.length || m.colecciones.length || m.capitulos.length || m.prods_edicion.length)
			);

			// Aguarda las lecturas
			const resultado = await Promise.all([AL, SL, IR, IN]).then(([AL, SL, IR, IN]) => ({AL, SL, IR, IN}));

			// Fin
			return resultado;
		},
		obtieneRCLVsConEdicAjena: async function (ahora, revID) {
			// 1. Variables
			const campoFecha = "editado_en";
			let include = ["personaje", "hecho", "tema", "evento", "epoca_del_ano"];
			let rclvs = [];

			// 2. Obtiene todas las ediciones ajenas
			let ediciones = await BD_especificas.TC_obtieneEdicsAptas("rclvs_edicion", include);
			ediciones.filter((n) => n.editado_por_id != revID);

			// 3. Obtiene los rclvs originales y deja solamente los rclvs aprobados
			if (ediciones.length) {
				// Obtiene los rclvs originales
				ediciones.map((n) => {
					let entidad = comp.obtieneRclvEntidadDesdeRclv_id(n);
					let asociacion = comp.obtieneAsociacion(entidad);
					rclvs.push({
						...n[asociacion],
						entidad,
						editado_en: n.editado_en,
						edicID: n.id,
						fechaRef: n[campoFecha],
						fechaRefTexto: comp.fechaDiaMes(n[campoFecha]),
					});
				});
				// Deja solamente los rclvs aprobados
				rclvs = rclvs.filter((n) => n.status_registro_id == aprobado_id);
			}

			// 4. Elimina los repetidos
			if (rclvs.length) {
				rclvs.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
				rclvs = comp.eliminaRepetidos(rclvs);
			}

			// 5. Deja solamente los sin problemas de captura
			if (rclvs.length) rclvs = sinProblemasDeCaptura(rclvs, revID, ahora);

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
						(n.nombre_castellano.length > anchoMax
							? n.nombre_castellano.slice(0, anchoMax - 1) + "…"
							: n.nombre_castellano) +
						" (" +
						n.ano_estreno +
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
			const ahora = comp.ahora();
			let ediciones = {edics_aprob: 0, edics_rech: 0};
			let familia = comp.obtieneFamiliasDesdeEntidad(entidad);
			let camposRevisar = variables.camposRevisar[familia].filter((n) => n[entidad] || n[familia]);

			// Prepara la información
			let datos = {
				entidad,
				entidad_id: original.id,
				editado_por_id: original.creado_por_id,
				editado_en: original.creado_en,
				edic_revisada_por_id: revID,
				edic_revisada_en: ahora,
				lead_time_edicion: comp.obtieneLeadTime(original.creado_en, ahora),
			};

			// RCLV actual
			let include = comp.obtieneTodosLosCamposInclude(entidad);
			let RCLV_actual = await BD_genericas.obtienePorIdConInclude(entidad, original.id, include);

			// Motivos posibles
			let motivoVersionActual = motivos_rech_edic.find((n) => n.version_actual);
			let motivoInfoErronea = motivos_rech_edic.find((n) => n.info_erronea);

			// Rutina para comparar los campos
			for (let campoRevisar of camposRevisar) {
				// Variables
				let campo = campoRevisar.nombre;
				let relacInclude = campoRevisar.relacInclude;

				// Valor aprobado
				let valorAprob = relacInclude ? RCLV_actual[relacInclude].nombre : RCLV_actual[campo];
				let valorRech = relacInclude ? original[relacInclude].nombre : original[campo];

				// Casos especiales
				if (["solo_cfc", "ama"].includes(campo)) {
					valorAprob = RCLV_actual[campo] == 1 ? "SI" : "NO";
					valorRech = original[campo] == 1 ? "SI" : "NO";
				}
				if (campo == "epoca_id") {
					valorAprob = RCLV_actual[relacInclude].nombre_pers;
					valorRech = original[relacInclude].nombre_pers;
				}

				// Si ninguna de las variables tiene un valor, saltea la rutina
				if (!valorAprob && !valorRech) continue;

				// Genera la información
				datos = {...datos, campo, titulo: campoRevisar.titulo, valorAprob};

				// Obtiene la entidad y completa los datos
				let edicsAprobRech;
				if (valorAprob != valorRech) {
					// Obtiene la entidad
					edicsAprobRech = "edics_rech";
					// Completa los datos
					datos.valorRech = valorRech;
					let motivo = campo == "nombre" || campo == "apodo" ? motivoVersionActual : motivoInfoErronea;
					datos.motivo_id = motivo.id;
					datos.duracion = motivo.duracion;
				}
				// Obtiene la entidad
				else edicsAprobRech = "edics_aprob";

				// Guarda los registros en edics_aprob / edics_rech - se usa el 'await' para que conserve el orden
				await BD_genericas.agregaRegistro(edicsAprobRech, datos);
				// Aumenta la cantidad de edics_aprob / edics_rech para actualizar en el usuario
				ediciones[edicsAprobRech]++;
			}

			// Actualiza en el usuario los campos edics_aprob / edics_rech
			let creaID = original.creado_por_id;
			let campoEdic =
				ediciones.edics_aprob > ediciones.edics_rech
					? "edics_aprob"
					: ediciones.edics_aprob < ediciones.edics_rech
					? "edics_rech"
					: "";
			if (campoEdic) BD_genericas.aumentaElValorDeUnCampo("usuarios", creaID, campoEdic, 1);

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
			const familia = comp.obtieneFamiliaDesdeEntidad(entidad);
			const rclv = familia == "rclv";

			// Obtiene el registro original y el subcodigo
			const include = comp.obtieneTodosLosCamposInclude(entidad);
			const original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
			const status_original_id = original.status_registro_id;

			// Obtiene el 'subcodigo'
			const subcodigo = inactivarRecuperar
				? status_original_id == inactivar_id
					? "inactivar"
					: "recuperar"
				: req.path.endsWith("/alta/")
				? "alta"
				: "rechazo";

			// Averigua si la sugerencia fue aprobada
			const aprob = subcodigo != "rechazo" && !desaprueba;

			// Obtiene el status final
			const status_final_id =
				// Si es un rechazo, un recuperar desaprobado, o un inactivar aprobado
				(!aprob && subcodigo != "inactivar") || (aprob && subcodigo == "inactivar")
					? inactivo_id
					: // Los demás casos: un alta, un recuperar aprobado, o un inactivar desaprobado
					// Si es un RCLV, se aprueba
					rclv
					? aprobado_id
					: // Si es un producto, se revisa si tiene errores
					(await validaPR.consolidado({datos: {...original, entidad}}).then((n) => n.hay))
					? creado_aprob_id
					: aprobado_id;

			// Obtiene el motivo_id y el comentario
			const motivo_id = inactivarRecuperar ? original.motivo_id : subcodigo == "rechazo" ? req.body.motivo_id : null;
			let comentario = status_registros.find((n) => n.id == status_final_id).nombre;
			if (req.body.comentario) comentario += " - " + req.body.comentario;
			if (comentario.endsWith(".")) comentario = comentario.slice(0, -1);

			// Fin
			return {
				...{entidad, id, original, status_original_id, status_final_id},
				...{inactivarRecuperar, codigo, subcodigo, rclv, motivo_id, comentario, aprob},
			};
		},
		actualizaDiasDelAno: async ({desde, duracion, id}) => {
			// Obtiene el/los rangos
			const condicion = BD_especificas.condicsDDA({desde, duracion});

			// Se fija si en ese rango hay alguna epoca distinta a '1' y el ID actual
			const IDs_solapam = await BD_genericas.obtieneTodosPorCondicion("dias_del_ano", condicion)
				.then((n) => n.filter((m) => m.epoca_del_ano_id != 1 && m.epoca_del_ano_id != id))
				.then((n) => n.map((n) => n.epoca_del_ano_id))
				.then((n) => [...new Set(n)]);

			// En caso afirmativo, activa 'solapamiento' para esas epocas
			if (IDs_solapam.length) await BD_especificas.activaSolapam(IDs_solapam);

			// Limpia la tabla 'dias_del_ano' del registro 'epoca_del_ano_id'
			await BD_genericas.actualizaTodosPorCondicion("dias_del_ano", {epoca_del_ano_id: id}, {epoca_del_ano_id: 1});

			// Actualiza la tabla 'dias_del_ano' con la 'epoca_del_ano_id'
			const datos = {epoca_del_ano_id: id};
			await BD_genericas.actualizaTodosPorCondicion("dias_del_ano", condicion, datos);

			// Actualiza la variable 'dias_del_ano'
			dias_del_ano = await BD_genericas.obtieneTodosConInclude("dias_del_ano", "epoca_del_ano");

			// Fin
			return;
		},
		prodsAsocs: async (entidad, id) => {
			// Variables
			const entidadesProd = variables.entidadesProd;
			const campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);

			// Rutina por entidadProd
			for (let entidadProd of entidadesProd) {
				// Actualiza los productos no aprobados, quitándole el valor al 'campo_id'
				BD_especificas.actualizaLosProdsVinculadosNoAprobados({entidad: entidadProd, campo_id, id});

				// Similar rutina para los productos aprobados
				// Obtiene los productos aprobados con ese 'campo_id'
				const condicion = {[campo_id]: id, status_registro_id: aprobado_id};
				let prodsVinculados = await BD_genericas.obtieneTodosPorCondicion(entidadProd, condicion);
				// Los actualiza, fijándose si tiene errores
				for (let prodVinculado of prodsVinculados) {
					// Averigua si el producto tiene errores cuando se le actualiza el 'campo_id'
					let objeto = {[campo_id]: 1};
					prodVinculado = {...prodVinculado, ...objeto, publico: true};
					const errores = await validaPR.consolidado({datos: prodVinculado});

					// Si tiene errores, se le cambia el status a 'creado_aprob'
					if (errores.hay) objeto.status_registro_id = creado_aprob_id;

					// Actualiza el registro del producto
					BD_genericas.actualizaPorId(entidadProd, prodVinculado.id, objeto);
				}
			}
			// Sus productos asociados:
			// Dejan de estar vinculados
			// Si no pasan el control de error y estaban aprobados, pasan al status creado_aprob
		},
		// Productos Alta
		prodRclvRech: async (entidad, id) => {
			// Obtiene la edicion
			const nombreEdicion = comp.obtieneNombreEdicionDesdeEntidad(entidad);
			const campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
			const condicion = {[campo_id]: id};
			const ediciones = await BD_genericas.obtieneTodosPorCondicion(nombreEdicion, condicion);
			const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);

			// 1. Elimina el archivo avatar de las ediciones
			for (let edicion of ediciones)
				if (edicion.avatar)
					comp.borraUnArchivo("./publico/imagenes/2-Avatar-" + petitFamilia + "-Revisar", edicion.avatar);

			// 2. Elimina las ediciones
			BD_genericas.eliminaTodosPorCondicion(nombreEdicion, {[campo_id]: id});

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
			// - Borra el campo 'avatar_url' en el registro de edicion
			// - Impacto en los archivos de avatar (original y edicion)

			// Variables
			const familias = comp.obtieneFamiliasDesdeEntidad(entidad);

			if (familias == "productos") {
				// 1. Si se cumplen ciertas condiciones, descarga el avatar del original
				if (!aprob) {
					// Si el avatar original es un url y el registro es una pelicula o coleccion, descarga el avatar
					let url = original.avatar;
					if (url.includes("/") && entidad != "capitulos") {
						// Asigna un nombre al archivo a descargar
						original.avatar = Date.now() + path.extname(url);
						// Descarga el url
						let rutaYnombre = "./publico/imagenes/2-Productos/Final/" + original.avatar;
						await comp.descarga(url, rutaYnombre);
					}
				}

				// 2. Borra el campo 'avatar_url' en el registro de edicion
				await BD_genericas.actualizaPorId("prods_edicion", edicion.id, {avatar_url: null});
			}

			// 3. Impacto en los archivos de avatar (original y edicion)
			await actualizaArchivoAvatar({entidad, original, edicion, aprob});

			// Fin
			return;
		},
		// Prod-Edición Form
		ingrReempl: async (original, edicion) => {
			// Obtiene la familia
			const familias = original.fuente ? "productos" : original.dia_del_ano_id ? "rclvs" : "";

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
			// - Actualiza la tabla de edics_aprob/rech
			// - Aumenta el campo aprob/rech en el registro del usuario
			// - Si corresponde, penaliza al usuario
			// - Actualiza el registro de 'edición'
			// - Pule la variable edición y si no quedan campos, elimina el registro de la tabla de ediciones

			// Variables
			const familias = comp.obtieneFamiliasDesdeEntidad(entidad);
			const nombreEdic = comp.obtieneNombreEdicionDesdeEntidad(entidad);
			const decision = "edics_" + (aprob ? "aprob" : "rech");
			const ahora = comp.ahora();
			const camposRevisar = variables.camposRevisar[familias].filter((n) => n[entidad] || n[familias]);
			const campoRevisar = camposRevisar.find((n) => n.nombre == campo);
			const relacInclude = campoRevisar.relacInclude;
			const titulo = campoRevisar.titulo;
			let motivo;

			// Genera la información a actualizar
			let datos = {
				editado_por_id: edicion.editado_por_id,
				editado_en: edicion.editado_en,
				edic_revisada_por_id: revID,
				edic_revisada_en: ahora,
				lead_time_edicion: comp.obtieneLeadTime(edicion.editado_en, ahora),
			};

			// CONSECUENCIAS
			// 1. Si se aprobó, actualiza el registro 'original'
			if (aprob) {
				datos[campo] = edicion[campo];
				await BD_genericas.actualizaPorId(entidad, original.id, datos);
			}

			// 2. Actualiza la tabla de 'edics_aprob' o 'edics_rech'
			datos = {...datos, entidad, entidad_id: original.id, titulo, campo};
			// Agrega el motivo del rechazo
			if (!aprob) {
				motivo = motivos_rech_edic.find((n) => (motivo_id ? n.id == motivo_id : n.info_erronea));
				datos = {...datos, duracion: motivo.duracion, motivo_id: motivo.id};
			}
			// Asigna los valores 'aprob' y 'rech'
			let mostrarOrig = await valoresParaMostrar(original, relacInclude, campoRevisar);
			let mostrarEdic = await valoresParaMostrar(edicion, relacInclude, campoRevisar);
			datos.valorAprob = aprob ? mostrarEdic : mostrarOrig;
			datos.valorRech = aprob ? mostrarOrig : mostrarEdic;
			// Agrega el registro
			BD_genericas.agregaRegistro(decision, datos);

			// 3. Aumenta el campo 'edics_aprob' o 'edics_rech' en el registro del usuario
			BD_genericas.aumentaElValorDeUnCampo("usuarios", edicion.editado_por_id, decision, 1);

			// 4. Si corresponde, penaliza al usuario
			if (motivo) comp.usuarioPenalizAcum(edicion.editado_por_id, motivo, familias);

			// 5. Actualiza el registro de 'edición'
			await BD_genericas.actualizaPorId(nombreEdic, edicion.id, {[campo]: null});

			// 6. Pule la variable edición y si no quedan campos, elimina el registro de la tabla de ediciones
			let originalGuardado = aprob ? {...original, [campo]: edicion[campo]} : {...original};
			edicion[campo] = null;
			if (relacInclude) delete edicion[relacInclude];
			[edicion] = await procsCRUD.puleEdicion(entidad, originalGuardado, edicion);

			// 7. PROCESOS DE CIERRE
			// - Si corresponde: cambia el status del registro, y eventualmente de las colecciones
			// - Actualiza 'prodsEnRCLV'
			const statusAprob =
				familias == "rclvs"
					? true
					: familias == "productos" && !edicion
					? await procsCRUD.prodsPosibleAprobado(entidad, originalGuardado)
					: false;

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
	fichaDelUsuario: async (userID, petitFamilia) => {
		// Variables
		const ahora = comp.ahora();
		const include = "rol_iglesia";
		const usuario = await BD_genericas.obtienePorIdConInclude("usuarios", userID, include);
		let bloque = [];

		// Datos del usuario
		// Nombre
		bloque.push({titulo: "Nombre", valor: usuario.nombre + " " + usuario.apellido});
		// Edad
		if (usuario.fecha_nacim) {
			let edad = parseInt((ahora - new Date(usuario.fecha_nacim).getTime()) / unAno);
			bloque.push({titulo: "Edad", valor: edad + " años"});
		}
		// Rol en la iglesia
		if (usuario.rol_iglesia) bloque.push({titulo: "Rol en la Iglesia", valor: usuario.rol_iglesia.nombre});
		// Tiempo en ELC
		const antiguedad = ((ahora - new Date(usuario.creado_en).getTime()) / unAno).toFixed(1).replace(".", ",");
		bloque.push({titulo: "Tiempo en ELC", valor: antiguedad + " años"});
		// Calidad de las altas
		bloque.push(...usuarioCalidad(usuario, petitFamilia));

		// Fin
		return bloque;
	},
	descargaAvatar: async (original, entidad) => {
		// Descarga el archivo avatar
		const avatar = Date.now() + path.extname(original.avatar);
		const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);
		const ruta = "./publico/imagenes/2-Avatar-" + petitFamilia + "-Final/";
		comp.descarga(original.avatar, ruta + avatar);

		// Actualiza el registro 'original'
		await BD_genericas.actualizaPorId(entidad, original.id, {avatar});

		// Fin
		return;
	},
};

// Funciones
let TC_obtieneRegs = async (campos) => {
	// Variables
	let lecturas = [];
	let resultados = [];
	// Obtiene el resultado por entidad
	for (let entidad of campos.entidades) lecturas.push(BD_especificas.TC_obtieneRegs({entidad, ...campos}));
	await Promise.all(lecturas).then((n) => n.map((m) => resultados.push(...m)));

	if (resultados.length) {
		resultados = resultados.map((n) => {
			const fechaRef = campos.campoFecha ? n[campos.campoFecha] : n.sugerido_en;
			const fechaRefTexto = comp.fechaDiaMes(fechaRef);
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
	const familias = comp.obtieneFamiliasDesdeEntidad(entidad);

	// Reemplazo
	if (aprob) {
		// ARCHIVO ORIGINAL: si el 'avatar original' es un archivo, lo elimina
		const rutaFinal = "./publico/imagenes/2-" + familias + "/Final/";
		if (avatarOrig && comp.averiguaSiExisteUnArchivo(rutaFinal + avatarOrig)) comp.borraUnArchivo(rutaFinal, avatarOrig);

		// ARCHIVO NUEVO: mueve el archivo de edición a la carpeta definitiva
		comp.mueveUnArchivoImagen(avatarEdic, "2-" + familias + "/Revisar", "2-" + familias + "/Final");
	}

	// Rechazo - Elimina el archivo de edicion
	else if (!aprob) comp.borraUnArchivo("./publico/imagenes/2-" + familias + "/Revisar/", avatarEdic);

	// Fin
	return;
};
let valoresParaMostrar = async (registro, relacInclude, campoRevisar) => {
	// Obtiene una primera respuesta
	let resultado = relacInclude
		? registro[relacInclude] // El registro tiene un valor 'include'
			? registro[relacInclude].nombre // Muestra el valor 'include'
			: await BD_genericas.obtienePorId(campoRevisar.tabla, registro[campoRevisar.nombre]).then((n) => n.nombre) // Busca el valor include
		: registro[campoRevisar.nombre]; // Muestra el valor 'simple'

	// Casos especiales
	if (["cfc", "ocurrio", "musical", "color", "fecha_movil", "solo_cfc", "ama"].includes(campoRevisar.nombre))
		resultado = resultado == 1 ? "SI" : resultado == 0 ? "NO" : "";
	else if (["personaje_id", "hecho_id", "tema_id"].includes(campoRevisar.nombre) && registro[campoRevisar.nombre] == 1)
		resultado = null;

	// Fin
	return resultado;
};
let obtieneProdsDeLinks = function (links, ahora, revID) {
	// 1. Variables
	let prods = {VN: [], OT: []}; // Vencidos y otros

	// 2. Obtiene los prods
	links.map((link) => {
		// Variables
		let entidad = comp.obtieneProdEntidadDesdeProd_id(link);
		let asociacion = comp.obtieneAsociacion(entidad);
		let campoFecha = link.status_registro_id ? "sugerido_en" : "editado_en";
		let fechaRef = link[campoFecha];
		let fechaRefTexto = comp.fechaDiaMes(link[campoFecha]);

		// Separa en VN y OT
		if (link.status_registro && link.status_registro.creado_aprob)
			prods.VN.push(prods.VN.push({...link[asociacion], entidad, fechaRef, fechaRefTexto}));
		else prods.OT.push({...link[asociacion], entidad, fechaRef, fechaRefTexto});
	});

	// 3. Ordena por la fecha más antigua
	prods.VN.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
	prods.OT.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
	// 4. Elimina repetidos
	prods.VN = comp.eliminaRepetidos(prods.VN);
	prods.OT = comp.eliminaRepetidos(prods.OT);
	// Elimina repetidos entre grupos
	if (prods.VN.length && prods.OT)
		for (let i = prods.VN.length - 1; i >= 0; i--)
			if (prods.OT.find((n) => n.id == prods.VN[i].id && n.entidad == prods.VN[i].entidad)) prods.VN.splice(i, 1);

	// 5. Deja solamente los prods aprobados
	if (prods.VN.length) prods.VN = prods.VN.filter((n) => n.status_registro_id == aprobado_id);
	if (prods.OT.length) prods.OT = prods.OT.filter((n) => n.status_registro_id == aprobado_id);

	// 6. Deja solamente los sin problemas de captura
	if (prods.VN.length) prods.VN = sinProblemasDeCaptura(prods.VN, revID, ahora);
	if (prods.OT.length) prods.OT = sinProblemasDeCaptura(prods.OT, revID, ahora);

	// Fin
	return prods;
};
let sinProblemasDeCaptura = (familia, revID, ahora) => {
	// Variables
	const haceUnaHora = comp.nuevoHorario(-1, ahora);
	const haceDosHoras = comp.nuevoHorario(-2, ahora);
	// Fin
	return familia.filter(
		(n) =>
			// Que no esté capturado
			!n.capturado_en ||
			// Que esté capturado hace más de dos horas
			n.capturado_en < haceDosHoras ||
			// Que la captura haya sido por otro usuario y hace más de una hora
			(n.capturado_por_id != revID && n.capturado_en < haceUnaHora) ||
			// Que la captura haya sido por otro usuario y esté inactiva
			(n.capturado_por_id != revID && !n.captura_activa) ||
			// Que esté capturado por este usuario hace menos de una hora
			(n.capturado_por_id == revID && n.capturado_en > haceUnaHora)
	);
};
let usuarioCalidad = (usuario, prefijo) => {
	// Contar los casos aprobados y rechazados
	const cantAprob = usuario[prefijo + "_aprob"];
	const cantRech = usuario[prefijo + "_rech"];

	// Mediciones
	const cantidad = cantAprob + cantRech;
	const calidad = cantidad ? parseInt((cantAprob / cantidad) * 100) + "%" : "-";

	// Prepara el resultado
	const sufijo = prefijo != "edics" ? "Altas" : "Ediciones";
	const resultados = [
		{titulo: "Calidad de " + sufijo, valor: calidad},
		{titulo: "Cant. de " + sufijo, valor: cantidad},
	];

	// Fin
	return resultados;
};
let creadosSinEdicion = async () => {
	// Obtiene los productos en status 'creado' y sin edicion
	const PL = BD_genericas.obtieneTodosPorCondicionConInclude("peliculas", {status_registro_id: creado_id}, "ediciones")
		.then((n) => n.filter((m) => !m.ediciones.length))
		.then((n) =>
			n.map((m) => {
				const fechaRef = m.creado_en;
				const fechaRefTexto = comp.fechaDiaMes(fechaRef);
				return {...m, entidad: "peliculas", fechaRef, fechaRefTexto};
			})
		);
	const CL = BD_genericas.obtieneTodosPorCondicionConInclude("colecciones", {status_registro_id: creado_id}, "ediciones")
		.then((n) => n.filter((m) => !m.ediciones.length))
		.then((n) =>
			n.map((m) => {
				const fechaRef = m.creado_en;
				const fechaRefTexto = comp.fechaDiaMes(fechaRef);
				return {...m, entidad: "peliculas", fechaRef, fechaRefTexto};
			})
		);

	// Consolida el resultado
	const SE = await Promise.all([PL, CL]).then(([a, b]) => [...a, ...b]);

	// Fin
	return SE;
};
