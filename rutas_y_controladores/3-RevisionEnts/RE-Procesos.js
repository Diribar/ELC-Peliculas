"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const validaProd = require("../2.1-Prod-RUD/PR-FN-Validar");

module.exports = {
	// Tablero
	TC: {
		obtieneProds: async (ahora, userID) => {
			// Obtiene productos en situaciones particulares
			// Variables
			const entidades = ["peliculas", "colecciones"];
			let campos;
			// SE: Sin Edición (en status creado_aprob)
			campos = [entidades, creado_aprob_id, userID, "creado_en", "creado_por_id", "ediciones"];
			let SE = await TC_obtieneRegs(...campos, true);
			SE = SE.filter((n) => !n.ediciones.length);
			// IN: En staus 'inactivar'
			campos = [entidades, inactivar_id, userID, "sugerido_en", "sugerido_por_id", ""];
			const IN = await TC_obtieneRegs(...campos, true);
			// RC: En status 'recuperar'
			campos = [entidades, recuperar_id, userID, "sugerido_en", "sugerido_por_id", ""];
			const RC = await TC_obtieneRegs(...campos, true);

			// Fin
			return {SE, IR: [...IN, ...RC]};
		},
		obtieneProdsConEdicAjena: async (ahora, userID) => {
			// 1. Variables
			const campoFecha = "editado_en";
			let include = ["pelicula", "coleccion", "capitulo", "personaje", "hecho", "valor"];
			let productos = [];

			// 2. Obtiene todas las ediciones ajenas
			let ediciones = await BD_especificas.TC_obtieneEdicsAptas("prods_edicion", include);

			// 3.Elimina las edicionesProd con RCLV no aprobado
			if (ediciones.length)
				for (let i = ediciones.length - 1; i >= 0; i--)
					if (
						(ediciones[i].personaje && ediciones[i].personaje.status_registro_id != aprobado_id) ||
						(ediciones[i].hecho && ediciones[i].hecho.status_registro_id != aprobado_id) ||
						(ediciones[i].valor && ediciones[i].valor.status_registro_id != aprobado_id)
					)
						ediciones.splice(i, 1);

			// 4. Obtiene los productos originales
			if (ediciones.length)
				ediciones.map((n) => {
					let entidad = comp.obtieneProdDesdeProducto_id(n);
					let asociacion = comp.obtieneAsociacion(entidad);
					// Carga los productos excepto los aprobados y editados por el revisor
					if (n[asociacion].status_registro_id != aprobado_id || n.editado_por_id != userID)
						productos.push({
							...n[asociacion],
							entidad,
							edicion_id: n.id,
							fechaRef: n[campoFecha],
							fechaRefTexto: comp.fechaDiaMes(n[campoFecha]),
						});
				});

			// 5. Elimina los repetidos
			productos.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef));
			productos = comp.eliminaRepetidos(productos);

			// 6. Deja solamente los sin problemas de captura
			if (productos.length) productos = sinProblemasDeCaptura(productos, userID, ahora);

			// 7. Ordena según tengan links
			productos.sort((a, b) => b.links_general - a.links_general);

			// Fin
			return productos;
		},
		obtieneProdsConLink: async (ahora, userID) => {
			// Obtiene todos los productos aprobados, con algún link ajeno en status provisorio
			// Obtiene los links 'a revisar'
			let links = await BD_especificas.TC_obtieneLinksAjenos(userID);
			// Obtiene los productos
			let productos = links.length ? obtieneProdsDeLinks(links, ahora, userID) : [];

			// Fin
			return productos;
		},
		obtieneRCLVs: async (ahora, userID) => {
			// Obtiene rclvs en situaciones particulares
			// Variables
			const entidades = variables.entidadesRCLV;
			const include = ["peliculas", "colecciones", "capitulos", "prods_edicion"];
			let [AL, SP] = [[], []];
			let campos;

			// AL y SP: Altas y Sin Producto
			campos = [entidades, creado_id, userID, "creado_en", "creado_por_id", include];
			const CR = await TC_obtieneRegs(...campos);
			// Distribuir entre AL y SP
			for (let reg of CR) {
				// AL: Altas Pendientes de Aprobar (c/producto o c/edicProd)
				if (reg.peliculas.length || reg.colecciones.length || reg.capitulos.length || reg.prods_edicion.length)
					AL.push(reg);
				// SP: con una antiguedad mayor a una hora
				else if (reg.creado_en < ahora - unaHora) SP.push(reg);
			}
			// IN: En staus 'inactivar'
			campos = [entidades, inactivar_id, userID, "sugerido_en", "sugerido_por_id", ""];
			const IN = await TC_obtieneRegs(...campos, true);
			// RC: En status 'recuperar'
			campos = [entidades, recuperar_id, userID, "sugerido_en", "sugerido_por_id", ""];
			const RC = await TC_obtieneRegs(...campos, true);

			// Fin
			return {AL, SP, IR: [...IN, ...RC]};
		},
		obtieneRCLVsConEdicAjena: async function (ahora, userID) {
			// 1. Variables
			const campoFecha = "editado_en";
			let include = ["personaje", "hecho", "valor"];
			let rclvs = [];
			// 2. Obtiene todas las ediciones ajenas
			let ediciones = await BD_especificas.TC_obtieneEdicsAptas("rclvs_edicion", include);
			ediciones.filter((n) => n.editado_por_id != userID);
			// 3. Obtiene los rclvs originales y deja solamente los rclvs aprobados
			if (ediciones.length) {
				// Obtiene los rclvs originales
				ediciones.map((n) => {
					let entidad = comp.obtieneRCLVdesdeRCLV_id(n);
					let asociacion = comp.obtieneAsociacion(entidad);
					rclvs.push({
						...n[asociacion],
						entidad,
						editado_en: n.editado_en,
						edicion_id: n.id,
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
			if (rclvs.length) rclvs = sinProblemasDeCaptura(rclvs, userID, ahora);
			// Fin
			return rclvs;
		},
		prod_ProcesaCampos: (productos) => {
			// Procesar los registros
			// Variables
			const anchoMax = 40;
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
					if (rubro == "ED") datos.edicion_id = n.edicion_id;
					return datos;
				});

			// Fin
			return productos;
		},
		RCLV_ProcesaCampos: (rclvs) => {
			// Procesar los registros
			let anchoMax = 30;
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
					if (rubro == "ED") datos.edicion_id = n.edicion_id;
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
			let familia = comp.obtieneFamilias(entidad);
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
				if (["solo_cfc", "ant", "jss", "cnt", "pst", "ama"].includes(campo)) {
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
		// Productos Alta
		prodRech: async (entidad, id, editado_por_id) => {
			// Obtiene la edicion
			let campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
			let objeto = {[campo_id]: id, editado_por_id};
			let edicion = await BD_genericas.obtienePorCampos("prods_edicion", objeto);

			// 1. Elimina el archivo de avatar de la edicion
			if (edicion && edicion.avatar) comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar", edicion.avatar);

			// 2. Elimina las ediciones de producto que tenga
			await BD_genericas.eliminaTodosPorCampos("prods_edicion", {[campo_id]: id});

			//Fin
			return;
		},
	},

	guardar: async function ({req}) {
		// Códigos posibles: 'rechazo', 'inactivar-o-recuperar'
		let codigo = req.path.slice(1, -1);
		codigo = codigo.slice(codigo.indexOf("/") + 1);
		const inactivarRecuperar = codigo == "inactivar-o-recuperar";

		// Variables
		const {entidad, id, desaprueba} = req.query;
		//return res.send({...req.query, ...req.body})
		const familia = comp.obtieneFamilia(entidad);
		const rclv = familia == "rclv";

		// Obtiene el registro original y el subcodigo
		let include = comp.obtieneTodosLosCamposInclude(entidad);
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
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
				(await validaProd.consolidado(original).then((n) => n.hay))
				? // Si tiene errores, pasa a creadoAprob
				  creado_aprob_id
				: // Si no tiene errores, se aprueba
				  aprobado_id;

		// Obtiene el motivo_id
		const motivo_id = inactivarRecuperar ? original.motivo_id : subcodigo == "rechazo" ? req.body.motivo_id : null;

		// Fin
		return {entidad, id, original, status_final_id, inactivarRecuperar, subcodigo, rclv, motivo_id};
	},

	// Edición
	edicion: {
		// Cada vez que se revisa un avatar
		procsParticsAvatar: async ({entidad, original, edicion, aprob}) => {
			// TAREAS:
			// - Si se cumplen ciertas condiciones, descarga el avatar del original
			// - Borra el campo 'avatar_url' en el registro de edicion
			// - Impacto en los archivos de avatar (original y edicion)

			// 1. Si se cumplen ciertas condiciones, descarga el avatar del original
			if (!aprob) {
				// Si el avatar original es un url y el registro es una pelicula o coleccion, descarga el avatar
				let url = original.avatar;
				if (url.startsWith("http") && entidad != "capitulos") {
					// Asigna un nombre al archivo a descargar
					original.avatar = Date.now() + path.extname(url);
					// Descarga el url
					let rutaYnombre = "./publico/imagenes/2-Avatar-Prods-Final/" + original.avatar;
					await comp.descarga(url, rutaYnombre);
				}
			}

			// 2. Borra el campo 'avatar_url' en el registro de edicion
			await BD_genericas.actualizaPorId("prods_edicion", edicion.id, {avatar_url: null});

			// 3. Impacto en los archivos de avatar (original y edicion)
			await actualizaArchivoAvatar(original, edicion, aprob);

			// Fin
			return;
		},
		// Prod-Edición Form
		prodEdicForm_ingrReempl: async (original, edicion) => {
			// Obtiene todos los campos a revisar
			let camposRevisar = [...variables.camposRevisar.productos]; // Escrito así para desligarlos
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
			const familia = comp.obtieneFamilias(entidad);
			const nombreEdic = comp.obtieneNombreEdicionDesdeEntidad(entidad);
			const decision = "edics_" + (aprob ? "aprob" : "rech");
			const ahora = comp.ahora();
			const camposRevisar = variables.camposRevisar[familia].filter((n) => n[entidad] || n[familia]);
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

			// 2. Actualiza la tabla de edics_aprob o edics_rech
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

			// 3. Aumenta el campo edics_aprob o edics_rech en el registro del usuario
			BD_genericas.aumentaElValorDeUnCampo("usuarios", edicion.editado_por_id, decision, 1);

			// 4. Si corresponde, penaliza al usuario
			if (datos.duracion && !motivo) console.log(536, datos);
			if (datos.duracion) comp.usuarioPenalizAcum(edicion.editado_por_id, motivo, familia);

			// 5. Actualiza el registro de 'edición'
			await BD_genericas.actualizaPorId(nombreEdic, edicion.id, {[campo]: null});

			// 6. Pule la variable edición y si no quedan campos, elimina el registro de la tabla de ediciones
			// Actualiza la información del original guardado
			let originalGuardado = aprob ? {...original, [campo]: edicion[campo]} : {...original};
			// Actualiza la información de la edición
			edicion[campo] = null;
			if (relacInclude) delete edicion[relacInclude];
			// Completa el proceso
			[edicion] = await procsCRUD.puleEdicion(entidad, originalGuardado, edicion);

			// 7. PROCESOS DE CIERRE
			// - Si corresponde: cambia el status del registro, y eventualmente de las colecciones
			// - Actualiza 'prodsEnRCLV'
			let prodStatusAprob;
			if (familia == "productos") prodStatusAprob = await procsCRUD.prodsPosibleAprobado(entidad, originalGuardado);

			// Fin
			return [edicion, prodStatusAprob];
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
};

// Funciones
let TC_obtieneRegs = async (entidades, status_id, userID, campoFecha, autor_id, include, omitirUnaHora) => {
	// Variables
	let campos = {status_id, userID, include, campoFecha, autor_id, omitirUnaHora};
	let resultados = [];
	// Obtiene el resultado por entidad
	for (let entidad of entidades) resultados.push(...(await BD_especificas.TC_obtieneRegs({entidad, ...campos})));
	// Agrega el campo 'fecha-ref'
	resultados = resultados.map((n) => {
		return {
			...n,
			fechaRef: n[campoFecha],
			fechaRefTexto: comp.fechaDiaMes(n[campoFecha]),
		};
	});
	// Ordena los resultados
	if (resultados.length) resultados.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
	// Fin
	return resultados;
};
// VISTA-prod_edicForm/prod_AvatarGuardar - Cada vez que se aprueba/rechaza un avatar sugerido
let actualizaArchivoAvatar = async (original, edicion, aprob) => {
	// Variables
	const avatarOrig = original.avatar;
	const avatarEdic = edicion.avatar;

	// Reemplazo
	if (aprob) {
		// ARCHIVO ORIGINAL: si el 'avatar original' es un archivo, lo elimina
		let rutaFinal = "./publico/imagenes/2-Avatar-Prods-Final/";
		if (avatarOrig && comp.averiguaSiExisteUnArchivo(rutaFinal + avatarOrig)) comp.borraUnArchivo(rutaFinal, avatarOrig);

		// ARCHIVO NUEVO: mueve el archivo de edición a la carpeta definitiva
		comp.mueveUnArchivoImagen(avatarEdic, "2-Avatar-Prods-Revisar", "2-Avatar-Prods-Final");
	}

	// Elimina el archivo de edicion
	else if (!aprob) comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/", avatarEdic);

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
	if (["cfc", "ocurrio", "musical", "color"].includes(campoRevisar.nombre))
		resultado = resultado == 1 ? "SI" : resultado == 0 ? "NO" : "";
	else if (["personaje_id", "hecho_id", "valor_id"].includes(campoRevisar.nombre) && registro[campoRevisar.nombre] == 1)
		resultado = null;

	// Fin
	return resultado;
};
let obtieneProdsDeLinks = function (links, ahora, userID) {
	// 1. Variables
	let prods = {VN: [], OT: []}; // Vencidos y otros

	// 2. Obtiene los prods
	links.map((link) => {
		// Variables
		let entidad = comp.obtieneProdDesdeProducto_id(link);
		let asociacion = comp.obtieneAsociacion(entidad);
		let campoFecha = !link.status_registro_id ? "editado_en" : "sugerido_en";
		let fechaRef = link[campoFecha];
		let fechaRefTexto = comp.fechaDiaMes(link[campoFecha]);
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
	if (prods.VN.length) prods.VN = sinProblemasDeCaptura(prods.VN, userID, ahora);
	if (prods.OT.length) prods.OT = sinProblemasDeCaptura(prods.OT, userID, ahora);

	// Fin
	return prods;
};
let sinProblemasDeCaptura = (familia, userID, ahora) => {
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
			(n.capturado_por_id != userID && n.capturado_en < haceUnaHora) ||
			// Que la captura haya sido por otro usuario y esté inactiva
			(n.capturado_por_id != userID && !n.captura_activa) ||
			// Que esté capturado por este usuario hace menos de una hora
			(n.capturado_por_id == userID && n.capturado_en > haceUnaHora)
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
