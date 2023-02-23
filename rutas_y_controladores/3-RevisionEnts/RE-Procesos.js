"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const validaProds = require("../2.1-Prod-RUD/PR-FN-Validar");

module.exports = {
	// Tablero
	TC: {
		obtieneProds: async (ahora, userID) => {
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
		obtieneProdsConEdicAjena: async (ahora, userID) => {
			// 1. Variables
			const campoFechaRef = "editado_en";
			let includes = ["pelicula", "coleccion", "capitulo", "personaje", "hecho", "valor"];
			let productos = [];

			// 2. Obtiene todas las ediciones ajenas
			let ediciones = await BD_especificas.TC_obtieneEdicsAptas("prods_edicion", includes);

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
							fechaRef: n[campoFechaRef],
							fechaRefTexto: comp.fechaTextoCorta(n[campoFechaRef]),
						});
				});

			// 5. Elimina los repetidos más recientes
			productos.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
			productos = comp.eliminaRepetidos(productos);

			// 6. Deja solamente los sin problemas de captura
			if (productos.length) productos = procsCRUD.sinProblemasDeCaptura(productos, userID, ahora);

			// Fin
			return productos;
		},
		obtieneProdsConLink: async function (ahora, userID) {
			// Obtiene todos los productos aprobados, con algún link ajeno en status provisorio
			// Obtiene los links 'a revisar'
			let links = await BD_especificas.TC_obtieneLinks_y_EdicsAjenas(userID);
			// Obtiene los productos
			let productos = links.length ? procsCRUD.obtieneProdsDeLinks(links, ahora, userID) : [];

			// Fin
			return productos;
		},
		obtieneRCLVs: async (ahora, userID) => {
			// Obtiene rclvs en situaciones particulares
			// Variables
			let entidades = variables.entidadesRCLV;
			let includes = ["peliculas", "colecciones", "capitulos", "prods_edicion"];
			let campos = [entidades, ahora, creado_id, userID, "creado_en", "creado_por_id", includes];
			let registros = await TC_obtieneRegs(...campos);

			// Distribuir entre AL y SP
			let respuesta = {AL: [], SP: []};
			for (let reg of registros) {
				// AL: Altas Pendientes de Aprobar (c/producto o c/edicProd)
				if (reg.peliculas.length || reg.colecciones.length || reg.capitulos.length || reg.prods_edicion.length)
					respuesta.AL.push(reg);
				// SP: con una antiguedad mayor a una hora
				else if (reg.creado_en < ahora - unaHora) respuesta.SP.push(reg);
			}

			// Fin
			return respuesta;
		},
		obtieneRCLVsConEdicAjena: async function (ahora, userID) {
			// 1. Variables
			const campoFechaRef = "editado_en";
			let includes = ["personaje", "hecho", "valor"];
			let rclvs = [];
			// 2. Obtiene todas las ediciones ajenas
			let ediciones = await BD_especificas.TC_obtieneEdicsAptas("rclvs_edicion", includes);
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
			if (rclvs.length) rclvs = procsCRUD.sinProblemasDeCaptura(rclvs, userID, ahora);
			// Fin
			return rclvs;
		},
		prod_ProcesarCampos: (productos) => {
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
		RCLV_ProcesarCampos: (rclvs) => {
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
			let familia = comp.obtieneFamiliaEnPlural(entidad);
			let camposRevisar = variables.camposRevisar[familia].filter((n) => n[entidad] || n[familia]);

			// Prepara la información
			let datos = {
				entidad,
				entidad_id: original.id,
				editado_por_id: original.creado_por_id,
				editado_en: original.creado_en,
				edic_analizada_por_id: revID,
				edic_analizada_en: ahora,
				lead_time_edicion: comp.obtieneLeadTime(edicion.editado_en, ahora),
			};

			// RCLV actual
			let includes = comp.obtieneTodosLosCamposInclude(entidad);
			let RCLV_actual = await BD_genericas.obtienePorIdConInclude(entidad, original.id, includes);

			// Motivos posibles
			let motivoVersionActual = edic_motivos_rech.find((n) => n.version_actual);
			let motivoInfoErronea = edic_motivos_rech.find((n) => n.info_erronea);

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
		prodRech: async (entidad, id, editado_por_id) => {
			// Obtiene la edicion
			let campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
			let objeto = {[campo_id]: id, editado_por_id};
			console.log(343, objeto);
			let edicion = await BD_genericas.obtienePorCampos("prods_edicion", objeto);
			// 8.A. Elimina las ediciones que tenga
			await BD_genericas.eliminaTodosPorCampos("prods_edicion", {[campo_id]: id});

			// 8.B. Actualiza los RCLV, en el campo 'prods_aprob'
			procsCRUD.cambioDeStatus(entidad, edicion);
		},
	},

	// Edición
	edicion: {
		// Cada vez que se aprueba/rechaza un valor editado
		edicAprobRech: async function ({entidad, original, edicion, revID, campo, aprob, motivo_id}) {
			// Variables
			const familia = comp.obtieneFamiliaEnPlural(entidad);
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
				entidad,
				entidad_id: original.id,
				editado_por_id: edicion.editado_por_id,
				editado_en: edicion.editado_en,
				edic_analizada_por_id: revID,
				edic_analizada_en: ahora,
				lead_time_edicion: comp.obtieneLeadTime(edicion.editado_en, ahora),
				titulo,
				campo,
			};
			if (!aprob) {
				motivo = edic_motivos_rech.find((n) => (motivo_id ? n.id == motivo_id : n.info_erronea));
				datos = {...datos, duracion: motivo.duracion, motivo_id: motivo.id};
			}
			let valorOrig = relacInclude ? original[relacInclude].nombre : original[campo];
			let valorEdic = relacInclude ? edicion[relacInclude].nombre : edicion[campo];
			datos.valorAprob = aprob ? valorEdic : valorOrig;
			datos.valorRech = aprob ? valorOrig : valorEdic;

			// CONSECUENCIAS
			// 1. Si se aprobó, actualiza el registro de 'original'
			if (aprob) {
				datos[campo] = edicion[campo];
				await BD_genericas.actualizaPorId(entidad, original.id, datos);
			}

			// 2. Actualiza la tabla de edics_aprob/rech
			BD_genericas.agregaRegistro(decision, datos);

			// 3. Aumenta el campo aprob/rech en el registro del usuario
			BD_genericas.aumentaElValorDeUnCampo("usuarios", edicion.editado_por_id, decision, 1);

			// 4. Si corresponde, penaliza al usuario
			if (datos.duracion) comp.usuarioPenalizAcum(edicion.editado_por_id, motivo, familia);

			// 5. Actualiza el registro de 'edición'
			await BD_genericas.actualizaPorId(nombreEdic, edicion.id, {[campo]: null});

			// Fin
			return
		},
		fichaDelRegistro: async (entidadOrig, entidadEdic) => {
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
		prodsAprobEnRCLV: function (prodOrig, campo_id, edicAprob, statusAprobOrig, statusAprob) {
			// Actualiza 'prods_aprob' en rclvs, si ocurre 1 y (2 ó 3)
			// 1. Se aprobó un cambio y el producto está aprobado
			// 2. El cambio es un campo_id  con id distinto de 1
			// 3. El registro no estaba aprobado
			const campos_id = ["personaje_id", "hecho_id", "valor_id"];
			if (
				edicAprob && // Se aprobó un cambio
				statusAprob && // El producto está aprobado
				((campos_id.includes(campo_id) && prodOrig[campo_id] != 1) || // El cambio es un campo RCLV con valor distinto de 1
					!statusAprobOrig) // El registro no estaba aprobado
			)
				campos_id.forEach((campo_id) => {
					let RCLV_id = prodOrig[campo_id]; // Obtiene el RCLV_id
					if (RCLV_id) {
						let entidad = comp.obtieneRCLVdesdeRCLV_id({[campo_id]: true});
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
				let relacInclude = campo.relacInclude;
				// Criterio para determinar qué valores originales mostrar
				campo.mostrarOrig =
					relacInclude && prodOrig[relacInclude] // El producto original tiene un valor 'include'
						? prodOrig[relacInclude].nombre // Muestra el valor 'include'
						: prodOrig[nombre]; // Muestra el valor 'simple'
				// Criterio para determinar qué valores editados mostrar
				campo.mostrarEdic =
					relacInclude && edicion[relacInclude] // El producto editado tiene un valor 'include'
						? edicion[relacInclude].nombre // Muestra el valor 'include'
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
		prodEdic_actualizaAvatar: async (prodOrig, prodEdic, reemplazar) => {
			// Variables
			const avatarOrig = prodOrig.avatar;
			const avatarEdic = prodEdic.avatar;

			// Gestión de archivos
			if (reemplazar) {
				// ARCHIVO ORIGINAL: si el 'avatar original' es un archivo, lo elimina
				let rutaFinal = "./publico/imagenes/2-Avatar-Prods-Final/" + avatarOrig;
				if (avatarOrig && comp.averiguaSiExisteUnArchivo(rutaFinal)) comp.borraUnArchivo(rutaFinal);

				// ARCHIVO NUEVO: mueve el archivo de edición a la carpeta definitiva
				comp.mueveUnArchivoImagen(avatarEdic, "2-Avatar-Prods-Revisar", "2-Avatar-Prods-Final");
			}

			// ARCHIVO NUEVO: elimina el archivo de edicion
			else if (!reemplazar) comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/", avatarEdic);

			// Fin
			return;
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
