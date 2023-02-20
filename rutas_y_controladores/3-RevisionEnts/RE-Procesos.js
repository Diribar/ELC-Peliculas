"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const validaProds = require("../2.1-Prod-RUD/PR-FN-Validar");
const validaRCLVs = require("../2.2-RCLV-CRUD/RCLV-Validar");

module.exports = {
	// Tablero
	TC_obtieneProds: async (ahora, userID) => {
		// Obtiene productos en situaciones particulares
		// Variables
		let entidades = ["peliculas", "colecciones"];
		let campos;
		// SE: Sin Edición (en status creado_aprob)
		campos = [entidades, ahora, creado_aprob_id, userID, "creado_en", "creado_por_id", "ediciones"];
		let SE = await TC_obtieneRegs(...campos);
		SE = SE.filter((n) => !n.ediciones.length);
		// IN: En staus 'inactivar'
		campos = [entidades, ahora, inactivar_id, userID, "sugerido_en", "sugerido_por_id", ""];
		let IN = await TC_obtieneRegs(...campos);
		// RC: En status 'recuperar'
		campos = [entidades, ahora, recuperar_id, userID, "sugerido_en", "sugerido_por_id", ""];
		let RC = await TC_obtieneRegs(...campos);

		// Fin
		return {IN, RC, SE};
	},
	TC_obtieneProdsConEdicAjena: async (ahora, userID) => {
		// 1. Variables
		const campoFechaRef = "editado_en";
		let includes = ["pelicula", "coleccion", "capitulo", "personaje", "hecho", "valor"];
		let productos = [];

		// 2. Obtiene todas las ediciones ajenas
		let ediciones = await BD_especificas.TC_obtieneEdicsAjenas("prods_edicion", userID, includes);

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
				productos.push({
					...n[asociacion],
					entidad,
					edicion_id: n.id,
					fechaRef: n[campoFechaRef],
					fechaRefTexto: comp.fechaTextoCorta(n[campoFechaRef]),
				});
			});

		// 5. Elimina los repetidos más recientes
		productos.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
		productos = comp.eliminaRepetidos(productos);

		// 6. Deja solamente los sin problemas de captura
		if (productos.length) productos = sinProblemasDeCaptura(productos, userID, ahora);

		// Fin
		return productos;
	},
	TC_obtieneProdsConLink: async function (ahora, userID) {
		// Obtiene todos los productos aprobados, con algún link ajeno en status provisorio
		// Obtiene los links 'a revisar'
		let links = await BD_especificas.TC_obtieneLinks_y_EdicsAjenas(userID);
		// Obtiene los productos
		let productos = links.length ? this.TC_obtieneProdsDeLinks(links, ahora, userID) : [];

		// Fin
		return productos;
	},
	TC_obtieneProdsDeLinks: function (links, ahora, userID) {
		// 1. Variables
		let productos = [];
		// 2. Obtiene los productos
		links.map((n) => {
			let entidad = comp.obtieneProdDesdeProducto_id(n);
			let asociacion = comp.obtieneAsociacion(entidad);
			let campoFechaRef = !n.status_registro_id ? "editado_en" : n.status_registro.creado ? "creado_en" : "sugerido_en";
			productos.push({
				...n[asociacion],
				entidad,
				fechaRef: n[campoFechaRef],
				fechaRefTexto: comp.fechaTextoCorta(n[campoFechaRef]),
			});
		});
		// 3. Ordena por la fecha más antigua
		productos.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
		// 4. Elimina repetidos
		productos = comp.eliminaRepetidos(productos);
		// 5. Deja solamente los productos aprobados
		if (productos.length) productos = productos.filter((n) => n.status_registro_id == aprobado_id);
		// 6. Deja solamente los sin problemas de captura
		if (productos.length) productos = sinProblemasDeCaptura(productos, userID, ahora);

		// Fin
		return productos;
	},
	TC_obtieneRCLVs: async (ahora, userID) => {
		// Obtiene rclvs en situaciones particulares
		// Variables
		let entidades = variables.entidadesRCLV;
		let campos, includes;
		//	PA: Pendientes de Aprobar (c/producto o c/edicProd)
		includes = ["peliculas", "colecciones", "capitulos", "prods_edicion"];
		campos = [entidades, ahora, creado_id, userID, "creado_en", "creado_por_id", includes];
		let registros = await TC_obtieneRegs(...campos);
		let PA = registros.filter(
			(n) => n.peliculas.length || n.colecciones.length || n.capitulos.length || n.prods_edicion.length
		);
		let SP = registros.filter(
			(n) =>
				!n.peliculas.length &&
				!n.colecciones.length &&
				!n.capitulos.length &&
				!n.prods_edicion.length &&
				n.creado_en < ahora - unDia &&
				n.creado_en > ahora - unDia * 2
		);
		// Fin
		return {PA, SP};
	},
	TC_obtieneRCLVsConEdicAjena: async function (ahora, userID) {
		// 1. Variables
		const campoFechaRef = "editado_en";
		let includes = ["personaje", "hecho", "valor"];
		let rclvs = [];
		// 2. Obtiene todas las ediciones ajenas
		let ediciones = await BD_especificas.TC_obtieneEdicsAjenas("rclvs_edicion", userID, includes);
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
					fechaRef: n[campoFechaRef],
					fechaRefTexto: comp.fechaTextoCorta(n[campoFechaRef]),
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
	TC_prod_ProcesarCampos: (productos) => {
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
	TC_RCLV_ProcesarCampos: (rclvs) => {
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

	// Producto y RCLV
	// Edición Form
	form_obtieneEdicAjena: async (req, familia, nombreEdic) => {
		// Variables
		const {entidad, id: rclvID, edicion_id: edicID} = req.query;
		const userID = req.session.usuario.id;
		const entidad_id = comp.obtieneEntidad_idDesdeEntidad(entidad);
		// Mensajes
		let mensajeSinEdicion = {
			mensajes: ["No encontramos ninguna edición ajena para revisar"],
			iconos: [
				{
					nombre: "fa-spell-check ",
					link: "/inactivar-captura/?entidad=" + entidad + "&id=" + rclvID + "&origen=tableroEnts",
					titulo: "Regresar al Tablero de Control",
				},
			],
		};
		let mensajeSinEsaEdicion = {
			mensajes: ["No encontramos esa edición.", "Te sugerimos que regreses al tablero y lo vuelvas a intentar"],
			iconos: [
				{
					nombre: "fa-spell-check ",
					link: "/inactivar-captura/?entidad=" + entidad + "&id=" + rclvID + "&origen=tableroEnts",
					titulo: "Regresar al Tablero de Control",
				},
			],
		};
		// Genera la variable 'includes'
		let includes = comp.obtieneTodosLosCamposInclude(entidad);
		if (familia == "rclvs") includes = includes.filter((n) => n.entidad);
		// Obtiene las ediciones del producto
		let edicsAjenas = await BD_especificas.edicForm_EdicsAjenas(nombreEdic, {entidad_id, entID: rclvID, userID}, includes);
		// Si no existe ninguna edición => informa el error
		if (!edicsAjenas.length) return {informacion: mensajeSinEdicion};
		// Obtiene la prodEdic
		let edicAjena = edicID ? edicsAjenas.find((n) => n.id == edicID) : edicsAjenas[0];
		// Si no existe la edicAjena => informa el error
		if (!edicAjena) return {informacion: mensajeSinEsaEdicion};
		// Si no existe el edicID, lo asigna para el final del 'alta'
		if (!edicID) return {edicID: edicAjena.id};
		// Fin - Envía la edición
		return {edicAjena};
	},
	form_edicFicha: async (entidadOrig, entidadEdic) => {
		// Funciones
		let usuario_CalidadEdic = async (userID) => {
			// 1. Obtiene los datos del usuario
			let usuario = await BD_genericas.obtienePorId("usuarios", userID);
			// 2. Contar los casos aprobados y rechazados
			let cantAprob = usuario.edics_aprob;
			let cantRech = usuario.edics_rech;
			// 3. Precisión de ediciones
			let cantEdics = cantAprob + cantRech;
			let calidadInputs = cantEdics ? parseInt((cantAprob / cantEdics) * 100) + "%" : "-";
			// Datos a enviar
			let enviar = {
				calidadEdiciones: ["Calidad Edición", calidadInputs],
				cantEdiciones: ["Cant. Campos Proces.", cantEdics],
			};
			// Fin
			return enviar;
		};

		// Definir el 'ahora'
		let ahora = comp.ahora().getTime();
		// Bloque derecho
		let bloque1 = [];
		let fecha;
		// Bloque 1 ---------------------------------------------
		if (entidadOrig.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: entidadOrig.ano_estreno});
		if (entidadOrig.ano_fin) bloque1.push({titulo: "Año de fin", valor: entidadOrig.ano_fin});
		if (entidadOrig.duracion) bloque1.push({titulo: "Duracion", valor: entidadOrig.duracion + " min."});
		// Obtiene la fecha de alta
		fecha = comp.fechaTexto(entidadOrig.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// Obtiene la fecha de edicion
		fecha = comp.fechaTexto(entidadEdic.editado_en);
		bloque1.push({titulo: "Fecha de Edic.", valor: fecha});
		// Obtiene el status del producto
		let statusResumido = entidadOrig.status_registro.gr_creado
			? {id: 1, valor: "Pend. Aprobac."}
			: entidadOrig.status_registro.aprobado
			? {id: 2, valor: "Aprobado"}
			: {id: 3, valor: "Inactivado"};
		bloque1.push({titulo: "Status", ...statusResumido});
		// Bloque 2 ---------------------------------------------
		// Obtiene los datos del usuario
		let fichaDelUsuario = await comp.usuarioFicha(entidadEdic.editado_por_id, ahora);
		// Obtiene la calidad de las altas
		let calidadEdic = await usuario_CalidadEdic(entidadEdic.editado_por_id);
		// Bloque consolidado -----------------------------------
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadEdic}];
		// Fin
		return derecha;
	},
	// API/Vista
	guardaEdicRev: async function (req, regOrig, regEdic) {
		// Variables
		const {entidad, campo, aprob} = req.query;
		const familia = comp.obtieneFamiliaEnPlural(entidad);
		const producto = familia == "productos";
		const nombreEdic = (producto ? "prods" : "rclvs") + "_edicion";
		const edicAprob = aprob == "true";
		const decision = "edics_" + (edicAprob ? "aprob" : "rech");
		const userID = req.session.usuario.id;
		const ahora = comp.ahora();
		const statusAprobInicial = regOrig.status_registro.aprobado;
		const datosEdicion = {
			id: regEdic.id,
			editado_por_id: regEdic.editado_por_id,
			editado_en: regEdic.editado_en,
		};
		let motivo, statusAprobFinal;

		// Genera la información a actualizar
		let datos = {
			[campo]: regEdic[campo],
			editado_por_id: regEdic.editado_por_id,
			editado_en: regEdic.editado_en,
			edic_analizada_por_id: userID,
			edic_analizada_en: ahora,
			lead_time_edicion: comp.obtieneLeadTime(regEdic.editado_en, ahora),
		};

		// Agrega un registro en la tabla 'edics_aprob/edics_rech', según corresponda
		await (async () => {
			// Si fue rechazado, amplía la información
			if (!edicAprob) {
				let {motivo_id} = req.query;
				let condicion = motivo_id ? {id: motivo_id} : {info_erronea: true};
				motivo = await BD_genericas.obtienePorCampos("edic_motivos_rech", condicion);
				datos = {...datos, duracion: motivo.duracion, motivo_id: motivo.id};
			}
			// Obtiene los valores aprob/rech
			let fn_valoresAprobRech = () => {
				// Fórmulas
				let obtieneElValorDeUnCampo = (registro, campo) => {
					// Variables
					let camposConVinculo = [...variables.camposRevisar[familia]]; // Hay que desconectarse del original
					camposConVinculo = camposConVinculo.filter((n) => n.relac_include);
					let campos = camposConVinculo.map((n) => n.nombre);
					let indice = campos.indexOf(campo);
					let vinculo = indice >= 0 ? camposConVinculo[indice].relac_include : "";
					let respuesta;
					// Resultado
					if (indice >= 0)
						respuesta = registro[vinculo]
							? registro[vinculo].productos
								? registro[vinculo].productos
								: registro[vinculo].nombre
							: "-";
					else respuesta = registro[campo];

					// Fin
					if (respuesta === null) respuesta = "-";
					return respuesta;
				};
				// Amplía la información con los valores aprob/rech de edición
				let valorOrig = obtieneElValorDeUnCampo(regOrig, campo);
				let valorEdic = obtieneElValorDeUnCampo(regEdic, campo);
				// Obtiene los valores 'aprobado' y 'rechazado'
				let valor_aprob = edicAprob ? valorEdic : valorOrig;
				let valor_rech = !edicAprob ? valorEdic : valorOrig;
				// Fin
				return {valor_aprob, valor_rech};
			};
			let valoresAprobRech = fn_valoresAprobRech();
			// Obtiene datos adicionales
			const titulo = variables.camposRevisar[familia].find((n) => n.nombre == campo).titulo;
			let datosAdicionales = {entidad, entidad_id: regOrig.id, campo, titulo};
			// Agrega un registro a la tabla 'edics_aprob' / 'edics_rech'
			datos = {...datos, ...valoresAprobRech, ...datosAdicionales};
			BD_genericas.agregaRegistro(decision, datos);
		})();

		// Aumenta el campo aprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", regEdic.editado_por_id, decision, 1);

		// Si corresponde, penaliza al usuario
		if (datos.duracion) comp.usuarioPenalizAcum(regEdic.editado_por_id, motivo, familia);

		// Si se aprobó, actualiza el registro y la variable de 'original'
		if (edicAprob) {
			await BD_genericas.actualizaPorId(entidad, regOrig.id, datos);
			regOrig = {...regOrig, [campo]: regEdic[campo]};
		}

		// Actualiza el registro y la variable de 'edición'
		await BD_genericas.actualizaPorId(nombreEdic, regEdic.id, {[campo]: null});
		delete regEdic[campo];

		// Averigua si quedan campos por procesar
		let edicion = await procsCRUD.puleEdicion(regOrig, regEdic, familia);

		// Acciones para productos si no quedan campos
		if (!edicion && producto) {
			// 1. Si corresponde, actualiza el status del registro original (y eventualmente capítulos)
			// 2. Informa si el status pasó a aprobado
			statusAprobFinal = await (async () => {
				// Variables
				let statusAprob;
				// Averigua si tiene errores
				let errores = await validaProds.consolidado(null, {...regOrig, entidad});
				// Acciones si el original no tiene errores y está en status 'gr_creado'
				if (!errores.hay && regOrig.status_registro.gr_creado) {
					// Genera la información a actualizar en el registro original
					let datosCambioStatus = {
						alta_terminada_en: ahora,
						lead_time_creacion: comp.obtieneLeadTime(regOrig.creado_en, ahora),
						status_registro_id: status_registro.find((n) => n.aprobado).id,
						captura_activa: 0,
					};
					// Cambia el status del registro e inactiva la captura
					await BD_genericas.actualizaPorId(entidad, regOrig.id, datosCambioStatus);
					// Si es una colección, le cambia el status también a los capítulos
					if (entidad == "colecciones") {
						// Amplía los datos
						datosCambioStatus = {
							...datosCambioStatus,
							alta_analizada_por_id: 2,
							alta_analizada_en: ahora,
						};
						// Actualiza el status de todos los capítulos a la vez
						BD_genericas.actualizaTodosPorCampos("capitulos", {coleccion_id: regOrig.id}, datos);
					}
					// Cambia el valor de la variable que se informará
					statusAprob = true;
				}
				return statusAprob;
			})();
		} else edicion = {...datosEdicion, ...edicion};

		// Actualiza RCLV si corresponde
		if (producto && !statusAprobInicial && statusAprobFinal)
			this.prodsAprobEnRCLV(regOrig, campo, edicAprob, statusAprobInicial, statusAprobFinal);
		// Fin
		return [regOrig, edicion, quedanCampos, statusAprobFinal];
	},
	edicAprobRech: async (entidad, original, revID) => {
		// Variables
		let familia = comp.obtieneFamiliaEnPlural(entidad);
		let camposComparar = variables.camposRevisar[familia].filter((n) => n[entidad] || n[familia]);

		// Obtiene RCLV actual
		let includes = ["dia_del_ano"];
		if (entidad == "personajes") includes.push("categoria", "rol_iglesia", "proc_canon", "ap_mar");
		let RCLV_actual = await BD_genericas.obtienePorIdConInclude(entidad, original.id, includes);

		// Obtiene los motivos posibles
		let motivos = await BD_genericas.obtieneTodos("edic_motivos_rech", "orden");
		let motivoVersionActual = motivos.find((n) => n.version_actual);
		let motivoInfoErronea = motivos.find((n) => n.info_erronea);

		// Prepara la información
		let datos = {
			entidad,
			entidad_id: original.id,
			editado_por_id: original.creado_por_id,
			editado_en: original.creado_en,
			edic_analizada_por_id: revID,
			edic_analizada_en: comp.ahora(),
		};

		// Rutina para comparar los campos
		let ediciones = {edics_aprob: 0, edics_rech: 0};
		for (let campoComparar of camposComparar) {
			// Valor aprobado
			let valor_aprob = valorVinculo(RCLV_actual, campoComparar.nombre);
			let valor_rech = valorVinculo(original, campoComparar.nombre);

			if (!valor_aprob && !valor_rech) continue;
			// Genera la información
			datos = {
				...datos,
				campo: campoComparar.nombre,
				titulo: campoComparar.titulo,
				valor_aprob,
			};

			// Obtiene la entidad y completa los datos
			let edicsAprobRech;
			if (original[campoComparar.nombre] != RCLV_actual[campoComparar.nombre]) {
				// Obtiene la entidad
				edicsAprobRech = "edics_rech";
				// Completa los datos
				datos.valor_rech = valor_rech;
				let motivo =
					campoComparar.nombre == "nombre" || campoComparar.nombre == "apodo" ? motivoVersionActual : motivoInfoErronea;
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
	prodAltaForm_ficha: async (prodOrig, paises) => {
		// Funciones
		let usuario_CalidadAltas = async (userID) => {
			// 1. Obtiene los datos del usuario
			let usuario = await BD_genericas.obtienePorId("usuarios", userID);
			// 2. Contar los casos aprobados y rechazados
			let cantAprob = usuario.prods_aprob;
			let cantRech = usuario.prods_rech;
			// 3. Precisión de altas
			let cantAltas = cantAprob + cantRech;
			let calidadInputs = cantAltas ? parseInt((cantAprob / cantAltas) * 100) + "%" : "-";
			// let diasPenalizacion = usuario.dias_penalizacion
			// Datos a enviar
			let enviar = {
				calidadAltas: ["Calidad Altas", calidadInputs],
				cantAltas: ["Cant. Prod. Agregados", cantAltas],
				// diasPenalizacion: ["Días Penalizado", diasPenalizacion],
			};
			// Fin
			return enviar;
		};
		// Definir el 'ahora'
		let ahora = comp.ahora().getTime();
		// Bloque izquierdo
		let [bloque1, bloque2, bloque3] = [[], [], []];
		// Bloque 1
		if (paises) bloque1.push({titulo: "País" + (paises.includes(",") ? "es" : ""), valor: paises});
		if (prodOrig.idioma_original) bloque1.push({titulo: "Idioma original", valor: prodOrig.idioma_original.nombre});
		// Bloque 2
		if (prodOrig.direccion) bloque2.push({titulo: "Dirección", valor: prodOrig.direccion});
		if (prodOrig.guion) bloque2.push({titulo: "Guión", valor: prodOrig.guion});
		if (prodOrig.musica) bloque2.push({titulo: "Música", valor: prodOrig.musica});
		if (prodOrig.produccion) bloque2.push({titulo: "Producción", valor: prodOrig.produccion});
		// Bloque 3
		if (prodOrig.actores) bloque3.push({titulo: "Actores", valor: prodOrig.actores});
		// Bloque izquierdo consolidado
		let izquierda = [bloque1, bloque2, bloque3];
		// Bloque derecho
		[bloque1, bloque2] = [[], []];
		// Bloque 1
		if (prodOrig.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: prodOrig.ano_estreno});
		if (prodOrig.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOrig.ano_fin});
		if (prodOrig.duracion) bloque1.push({titulo: "Duracion", valor: prodOrig.duracion + " min."});
		// Obtiene la fecha de alta
		let fecha = comp.fechaTexto(prodOrig.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// 5. Obtiene los datos del usuario
		let fichaDelUsuario = await comp.usuarioFicha(prodOrig.creado_por_id, ahora);
		// 6. Obtiene la calidad de las altas
		let calidadAltas = await usuario_CalidadAltas(prodOrig.creado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadAltas}];
		return [izquierda, derecha];
	},
	prodsAprobEnRCLV: function (prodOrig, campo, edicAprob, statusAprobOrig, statusAprob) {
		// Actualiza en rclvs el campo 'prods_aprob', si ocurre 1 y (2 ó 3)
		// 1. Se aprobó un cambio y el producto está aprobado
		// 2. El cambio es un campo RCLV con valor distinto de 1
		// 3. El registro no estaba aprobado
		const entidades_id = ["personaje_id", "hecho_id", "valor_id"];
		if (
			edicAprob && // Se aprobó un cambio
			statusAprob && // El producto está aprobado
			((entidades_id.includes(campo) && prodOrig[campo] != 1) || // El cambio es un campo RCLV con valor distinto de 1
				!statusAprobOrig) // El registro no estaba aprobado
		)
			entidades_id.forEach((entidad_id) => {
				let RCLV_id = prodOrig[entidad_id]; // Obtiene el RCLV_id
				if (RCLV_id) {
					let entidad = comp.obtieneRCLVdesdeRCLV_id({[entidad_id]: true});
					BD_genericas.actualizaPorId(entidad, RCLV_id, {prods_aprob: true});
				}
			});

		// Fin
		return;
	},
	// Prod-Edición Form
	prodEdicForm_ingrReempl: async (prodOrig, edicion) => {
		// Obtiene todos los campos a revisar
		let campos = [...variables.camposRevisar.productos];
		let resultado = [];

		// Deja solamente los campos presentes en edicion
		for (let nombre in edicion) {
			// Obtiene el campo con varios datos
			let campo = campos.find((n) => n.nombre == nombre);
			// Si el campo no existe en los campos a revisar, saltea la rutina
			if (!campo) continue;
			// Obtiene las variables de include
			let relac_include = campo.relac_include;
			// Criterio para determinar qué valores originales mostrar
			campo.mostrarOrig =
				relac_include && prodOrig[relac_include] // El producto original tiene un valor 'include'
					? prodOrig[relac_include].nombre // Muestra el valor 'include'
					: prodOrig[nombre]; // Muestra el valor 'simple'
			// Criterio para determinar qué valores editados mostrar
			campo.mostrarEdic =
				relac_include && edicion[relac_include] // El producto editado tiene un valor 'include'
					? edicion[relac_include].nombre // Muestra el valor 'include'
					: edicion[nombre]; // Muestra el valor 'simple'
			// Consolidar los resultados
			resultado.push(campo);
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
	prodEdicGuardar_Avatar: async (req, prodOrig, prodEdic) => {
		// Variables
		const edicAprob = req.query.aprob == "true";
		const avatarOrig = prodOrig.avatar;
		const avatarEdic = prodEdic.avatar;

		// Gestión de archivos
		if (edicAprob) {
			// Mueve el archivo de edición a la carpeta definitiva
			comp.mueveUnArchivoImagen(avatarEdic, "2-Avatar-Prods-Revisar", "2-Avatar-Prods-Final");
			// Si el 'avatar original' es un archivo, lo elimina
			if (avatarOrig && comp.averiguaSiExisteUnArchivo("./publico/imagenes/2-Avatar-Prods-Final/" + avatarOrig))
				comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Final/", avatarOrig);
		}
		// Elimina el archivo de edicion
		else comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/", avatarEdic);

		// Borra el campo 'avatar_url' en el registro de edicion y la variable
		await BD_genericas.actualizaPorId("prods_edicion", prodEdic.id, {avatar_url: null});
		delete prodEdic.avatar_url;

		// Fin
		return prodEdic;
	},
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
			let relac_include = campo.relac_include;
			// Criterio para determinar qué valores originales mostrar
			campo.mostrarOrig =
				relac_include && rclvOrig[relac_include] // El producto original tiene un valor 'include'
					? rclvOrig[relac_include].nombre // Muestra el valor 'include'
					: rclvOrig[nombre]; // Muestra el valor 'simple'
			// Criterio para determinar qué valores editados mostrar
			campo.mostrarEdic =
				relac_include && edicion[relac_include] // El producto editado tiene un valor 'include'
					? edicion[relac_include].nombre // Muestra el valor 'include'
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

	// Links - Vista
	problemasProd: (producto, urlAnterior) => {
		// Variables
		let informacion;
		const vistaAnterior = variables.vistaAnterior(urlAnterior);
		const vistaTablero = variables.vistaTablero;

		// El producto no está en status 'aprobado'
		if (!informacion && !producto.status_registro.aprobado)
			informacion = {
				mensajes: ["El producto no está en status 'Aprobado'", "Su status es " + producto.status_registro.nombre],
			};

		// El producto no posee links
		if (!informacion && !producto.links.length)
			informacion = {mensajes: ["Este producto no tiene links en nuestra Base de Datos"]};
		// Agregar los íconos
		if (informacion) informacion.iconos = [vistaAnterior, vistaTablero];

		// Fin
		return informacion;
	},
	// Links - API
};

// Funciones
let TC_obtieneRegs = async (entidades, ahora, status, userID, campoFechaRef, autor_id, include) => {
	// Variables
	let campos = {ahora, status, userID, include, campoFechaRef, autor_id};
	let resultados = [];
	// Obtiene el resultado por entidad
	for (let entidad of entidades) resultados.push(...(await BD_especificas.TC_obtieneRegs({entidad, ...campos})));
	// Elimina los propuestos hace menos de una hora, o por el Revisor
	const haceUnaHora = comp.nuevoHorario(-1, ahora);
	if (resultados.length)
		for (let i = resultados.length - 1; i >= 0; i--)
			if (resultados[i][campoFechaRef] > haceUnaHora || resultados[i][autor_id] == userID) resultados.splice(i, 1);
	// Agrega el campo 'fecha-ref'
	resultados = resultados.map((n) => {
		return {
			...n,
			fechaRef: n[campoFechaRef],
			fechaRefTexto: comp.fechaTextoCorta(n[campoFechaRef]),
		};
	});
	// Ordena los resultados
	if (resultados.length) resultados.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
	// Fin
	return resultados;
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
// Actualiza la info de aprobados/rechazados
// Funcion
let valorVinculo = (RCLV, campo) => {
	return campo == "dia_del_ano_id"
		? // Campo para los 3 RCLVs
		  RCLV.dia_del_ano_id >= 400
			? "Sin fecha conocida"
			: RCLV.dia_del_ano.dia + "/" + mesesAbrev[RCLV.dia_del_ano.mes_id - 1]
		: // Campos de Personajes
		campo == "epoca_id"
		? RCLV.epoca
			? RCLV.epoca.nombre
			: ""
		: campo == "categoria_id"
		? RCLV.categoria
			? RCLV.categoria.nombre
			: ""
		: campo == "rol_iglesia_id"
		? RCLV.rol_iglesia
			? RCLV.rol_iglesia.nombre
			: ""
		: campo == "proceso_id"
		? RCLV.proc_canon
			? RCLV.proc_canon.nombre
			: ""
		: campo == "ap_mar_id"
		? RCLV.ap_mar
			? RCLV.ap_mar.nombre
			: ""
		: RCLV[campo];
};
