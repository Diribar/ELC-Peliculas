"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const validaPR = require("../2.1-Prod-RUD/PR-FN-Validar");

// Exportar ------------------------------------
module.exports = {
	// Soporte para lectura y guardado de edición
	puleEdicion: async (entidad, original, edicion) => {
		// Variables
		const familia = comp.obtieneFamilias(entidad);
		const nombreEdicion = comp.obtieneNombreEdicionDesdeEntidad(entidad);
		const edicion_id = edicion.id;
		let camposNull = {};

		// 1. Quita de edición los campos que no se comparan
		(() => {
			// Obtiene los campos a comparar
			let camposRevisar = [];
			for (let campo of variables.camposRevisar[familia]) {
				camposRevisar.push(campo.nombre);
				if (campo.relacInclude) camposRevisar.push(campo.relacInclude);
			}
			// Quita de edicion los campos que no se comparan
			for (let campo in edicion) if (!camposRevisar.includes(campo)) delete edicion[campo];
		})();

		// 2. Quita de edición las coincidencias con el original y los campos 'null'
		for (let campo in edicion) {
			// Corrige errores de data-entry
			if (typeof edicion[campo] == "string") edicion[campo] = edicion[campo].trim();

			// CONDICION 1: La edición no es 'null'
			let condicion1 = edicion[campo] === null;

			// CONDICION 2: El original y la edición no son 'null' ni 'undefined' y son 'iguales'
			// El original no puede ser 'null', porque ya habría sido eliminado
			// El original no puede ser 'undefined', porque ya lo estamos preguntando
			// La edición no puede ser 'null', porque ya habría sido eliminada
			// La edición no puede ser 'undefined', porque existe el método
			let condicion2 = original[campo] !== undefined && edicion[campo] !== undefined && edicion[campo] == original[campo];

			// CONDICION 3: El objeto vinculado tiene el mismo ID
			let condicion3 = edicion[campo] && edicion[campo].id && original[campo] && edicion[campo].id == original[campo].id;

			// Si se cumple alguna de las condiciones, se elimina ese método
			if (condicion1 || condicion2 || condicion3) delete edicion[campo];
			if (condicion2 || condicion2) camposNull[campo] = null;
		}

		// 3. Acciones en función de si quedan campos
		let quedanCampos = !!Object.keys(edicion).length;
		if (!quedanCampos) {
			// Convierte en 'null' la variable de 'edicion'
			edicion = null;
			// Si además había una edición guardada en la BD, la elimina
			if (edicion_id) await BD_genericas.eliminaPorId(nombreEdicion, edicion_id);
		} else if (edicion_id) edicion.id = edicion_id;

		// Fin
		return [edicion, camposNull];
	},
	// Lectura de edicion
	obtieneOriginalEdicion: async function (entidad, entID, userID) {
		// Obtiene los campos include
		let includesEstandar = comp.obtieneTodosLosCamposInclude(entidad);
		let includesOrig = ["ediciones", ...includesEstandar, "creado_por", "status_registro"];
		let includesEdic = [...includesEstandar];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");

		// Obtiene el registro original con sus includes y le quita los campos sin contenido
		let original = await BD_genericas.obtienePorIdConInclude(entidad, entID, includesOrig);
		for (let campo in original) if (original[campo] === null) delete original[campo];

		// Obtiene la edición a partir del vínculo del original
		let edicion = original.ediciones.find((n) => n.editado_por_id == userID);
		if (edicion) {
			// Obtiene la edición con sus includes
			let nombreEdicion = comp.obtienePetitFamiliaDesdeEntidad(entidad) + "_edicion";
			edicion = await BD_genericas.obtienePorIdConInclude(nombreEdicion, edicion.id, includesEdic);
			// Quita la info que no agrega valor
			for (let campo in edicion) if (edicion[campo] === null) delete edicion[campo];
			let camposNull;
			[edicion, camposNull] = await this.puleEdicion(entidad, original, edicion);
			// Si quedan campos y hubo coincidencias con el original --> se eliminan esos valores coincidentes del registro de edicion
			if (edicion && Object.keys(camposNull).length)
				await BD_genericas.actualizaPorId(nombreEdicion, edicion.id, camposNull);
		} else edicion = {}; // Debe ser un objeto, porque más adelante se lo trata como tal

		// Fin
		return [original, edicion];
	},
	// Guardado de edición
	guardaActEdicCRUD: async function ({entidad, original, edicion, userID}) {
		// Variables
		let nombreEdicion = comp.obtieneNombreEdicionDesdeEntidad(entidad);
		let camposNull;

		// Quita la info que no agrega valor
		[edicion, camposNull] = await this.puleEdicion(entidad, original, edicion);

		// Acciones si quedan campos
		if (edicion) {
			// Si existe edicion.id --> se actualiza el registro
			if (edicion.id) await BD_genericas.actualizaPorId(nombreEdicion, edicion.id, {...camposNull, ...edicion});
			// Si no existe edicion.id --> se agrega el registro
			else
				await (async () => {
					// Se le agregan los campos necesarios: campo_id, editado_por_id, producto_id (links)
					// 1. campo_id, editado_por_id
					let campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
					edicion[campo_id] = original.id;
					edicion.editado_por_id = userID;
					// 2. producto_id (links)
					if (entidad == "links") {
						let producto_id = entidad == "links" ? comp.obtieneProducto_id(original) : "";
						edicion[producto_id] = original[producto_id];
					}
					// Se agrega el registro
					await BD_genericas.agregaRegistro(nombreEdicion, edicion);
				})();
		}

		// Fin
		return edicion;
	},
	// Avatar
	obtieneAvatarProd: (original, edicion) => {
		let orig =
			// Si no existe avatarOrig
			!original.avatar
				? localhost + "/imagenes/0-Base/Avatar/Sin-Avatar.jpg"
				: original.avatar.startsWith("http")
				? original.avatar
				: localhost +
				  "/imagenes/" +
				  // Si el avatar está 'aprobado'
				  (comp.averiguaSiExisteUnArchivo("./publico/imagenes/2-Avatar-Prods-Final/" + original.avatar)
						? "2-Avatar-Prods-Final/" + original.avatar
						: // Si el avatar está 'a revisar'
						comp.averiguaSiExisteUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/" + original.avatar)
						? "2-Avatar-Prods-Revisar/" + original.avatar
						: "0-Base/Avatar/Sin-Avatar.jpg");

		// avatarEdic
		let edic = edicion && edicion.avatar ? localhost + "/imagenes/2-Avatar-Prods-Revisar/" + edicion.avatar : orig;

		// Fin
		return {orig, edic};
	},
	obtieneAvatarRCLV: (original, edicion) => {
		let avatarOrig =
			// Si es un url
			original.avatar && original.avatar.startsWith("http")
				? original.avatar
				: // Si no existe avatarOrig
				  localhost +
				  "/imagenes/" +
				  (!original.avatar
						? "0-Base/Avatar/Sin-Avatar.jpg"
						: // Si el avatar está 'aprobado'
						comp.averiguaSiExisteUnArchivo("./publico/imagenes/4-RCLVs-Final/" + original.avatar)
						? "4-RCLVs-Final/" + original.avatar
						: // Si el avatar está 'a revisar'
						comp.averiguaSiExisteUnArchivo("./publico/imagenes/4-RCLVs-Revisar/" + original.avatar)
						? "4-RCLVs-Revisar/" + original.avatar
						: "");

		// avatarEdic
		let avatarEdic = edicion && edicion.avatar ? localhost + "/imagenes/4-RCLVs-Revisar/" + edicion.avatar : avatarOrig;

		// Fin
		return {orig: avatarOrig, edic: avatarEdic};
	},

	// Listados de RCLV
	gruposPers: (camposDA, userID) => {
		// Variables
		let personajes = camposDA.find((n) => n.nombre == "personaje_id").valores;

		// Deja solamente los aprobados o creados por el usuario
		personajes = personajes.filter(
			(n) => n.status_registro.aprobado || (n.status_registro.creado && n.creado_por_id == userID)
		);

		// Deja los valores necesarios
		personajes = personajes.map((n) => {
			return {
				id: n.id,
				nombre: n.nombre,
				categoria_id: n.categoria_id,
				rol_iglesia_id: n.rol_iglesia_id,
				ap_mar_id: n.ap_mar_id,
			};
		});
		let roles = roles_iglesia.filter((m) => m.plural);
		let listadoGral = [];
		let casosPuntuales = [];
		// Grupos Estándar
		let grupos = [
			{codigo: "SF", orden: 2},
			{codigo: "AL", orden: 3},
			{codigo: "PP", orden: 4},
			{codigo: "AP", orden: 15},
		];
		for (let grupo of grupos) {
			grupo.label = roles.find((n) => n.id.startsWith(grupo.codigo)).plural;
			grupo.valores = [];
			grupo.clase = "CFC";
		}
		// Valores para los grupos
		for (let personaje of personajes) {
			// Clase
			personaje.clase = personaje.categoria_id ? personaje.categoria_id : "CFC VPC";
			if (personaje.ap_mar_id) personaje.clase += " AMA AM" + personaje.ap_mar_id;

			// Si tiene 'rol_iglesia_id'
			if (personaje.rol_iglesia_id) {
				let OK = false;
				// Si es alguno de los 'grupos'
				for (let grupo of grupos)
					if (personaje.rol_iglesia_id.startsWith(grupo.codigo)) {
						grupo.valores.push(personaje);
						OK = true;
						break;
					}

				// Si no es ninguno de los 'grupos'
				if (!OK) listadoGral.push(personaje);
			}
			// Si no tiene 'rol_iglesia_id' --> lo agrega a los casos puntuales
			else casosPuntuales.push(personaje);
		}
		// Grupo 'Listado General'
		grupos.push({codigo: "LG", orden: 10, label: "Listado General", valores: listadoGral, clase: "CFC VPC"});
		// Grupo 'Casos Puntuales'
		grupos.push({codigo: "CP", orden: 1, label: "Casos Puntuales", valores: casosPuntuales, clase: "CFC VPC"});

		// Ordena los grupos
		grupos.sort((a, b) => a.orden - b.orden);

		// Fin
		return grupos;
	},
	gruposHechos: (camposDA, userID) => {
		// Variables
		let hechos = camposDA.find((n) => n.nombre == "hecho_id").valores;

		// Deja solamente los aprobados o creados por el usuario
		hechos = hechos.filter((n) => n.status_registro.aprobado || (n.status_registro.creado && n.creado_por_id == userID));

		// Deja los valores necesarios
		hechos = hechos.map((n) => {
			let {id, nombre, solo_cfc, ant, jss, cnt, pst, ama} = n;
			return {id, nombre, solo_cfc, ant, jss, cnt, pst, ama};
		});
		let apMar = [];
		let casosPuntuales = [];

		// Grupos estándar
		let grupos = [
			{codigo: "jss", orden: 2, label: "Durante la vida de Cristo"},
			{codigo: "cnt", orden: 3, label: "Durante los Apóstoles"},
			{codigo: "pst", orden: 5, label: "Posterior a Cristo"},
			{codigo: "ant", orden: 6, label: "Anterior a Cristo"},
		];
		for (let grupo of grupos) {
			grupo.clase = "CFC VPC";
			grupo.valores = [];
		}
		// Valores para los grupos
		for (let hecho of hechos) {
			// Si es un caso que no se debe mostrar, lo saltea
			if (hecho.id == 10) continue;
			// Variables
			let OK = false;
			hecho.clase = "CFC ";
			if (!hecho.solo_cfc) hecho.clase += "VPC ";

			// Apariciones Marianas
			if (hecho.ama) {
				hecho.clase += "ama";
				apMar.push(hecho);
				OK = true;
			}

			// Si es alguno de los 'grupos'
			if (!OK)
				for (let grupo of grupos)
					if (hecho[grupo.codigo]) {
						hecho.clase += grupo.codigo;
						grupo.valores.push(hecho);
						OK = true;
						break;
					}
			// Si no es ninguno de los 'grupos' --> lo agrega a los casos puntuales
			if (!OK) casosPuntuales.push(hecho);
		}
		// Grupo Apariciones Marianas
		grupos.push({codigo: "ama", orden: 4, label: "Apariciones Mariana", clase: "CFC", valores: apMar});
		// Grupo 'Casos Puntuales'
		grupos.push({codigo: "CP", orden: 1, label: "Casos Puntuales", clase: "CFC VPC", valores: casosPuntuales});
		// Ordena los grupos
		grupos.sort((a, b) => a.orden - b.orden);

		// Fin
		return grupos;
	},

	// CAMBIOS DE STATUS
	// Revisión: API-edicAprobRech / VISTA-prod_AvatarGuardar - Cada vez que se aprueba un valor editado
	// Prod-RUD: Edición - Cuando la realiza un revisor
	prodsPosibleAprobado: async function (entidad, original) {
		let statusAprob = original.status_registro && original.status_registro.aprobado;
		// - Averigua si el registro está en un status previo a 'aprobado'
		if ([creado_id, creado_aprob_id].includes(original.status_registro_id)) {
			// Averigua si hay errores
			let errores = await validaPR.consolidado({datos: {...original, entidad, publico: true}});
			if (!errores.hay) {
				// Variables
				statusAprob = true;
				let ahora = comp.ahora();
				let datos = {
					alta_term_en: ahora,
					lead_time_creacion: comp.obtieneLeadTime(original.creado_en, ahora),
					status_registro_id: aprobado_id,
				};

				// Cambia el status del registro
				await BD_genericas.actualizaPorId(entidad, original.id, datos);

				// Si es una colección, le cambia el status también a los capítulos
				if (entidad == "colecciones") {
					datos.alta_analizada_por_id = 2;
					datos.alta_analizada_en = ahora;
					await BD_genericas.actualizaTodosPorCampos("capitulos", {coleccion_id: original.id}, datos);
				}

				// Actualiza prodEnRCLV
				this.cambioDeStatus(entidad, {...original, ...datos});
			}
		}

		// Fin
		return statusAprob;
	},
	// Cambia el status de un registro
	cambioDeStatus: async function (entidad, registro) {
		// Variables
		let familias = comp.obtieneFamilias(entidad);

		// prodsEnRCLV
		if (familias == "productos") {
			// 1. Variables
			const stAprob = registro.status_registro_id == aprobado_id;
			const entidadesRCLV = variables.entidadesRCLV;

			// 2. Rutina por entidad RCLV
			for (let entidad of entidadesRCLV) {
				let campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
				if (registro[campo_id])
					stAprob
						? BD_genericas.actualizaPorId(entidad, registro[campo_id], {prods_aprob: SI})
						: this.prodEnRCLV({entidad, id: registro[campo_id]});
			}
		}

		// linksEnProds
		if (familias == "links") {
			// Obtiene los datos identificatorios del producto
			const prodEntidad = comp.obtieneProdDesdeProducto_id(registro);
			const campo_id = comp.obtieneProducto_id(registro);
			const prodID = registro[campo_id];
			// Actualiza el producto
			this.linksEnProd({entidad: prodEntidad, id: prodID});
		}

		// Fin
		return;
	},
	// Actualiza los campos de 'producto' en el RCLV
	prodEnRCLV: async function ({entidad, id}) {
		// La entidad y el ID son de un RCLV

		// Variables
		const entidadesProds = variables.entidadesProd;
		const statusAprobado = {status_registro_id: aprobado_id};
		const statusPotencial = {status_registro_id: [creado_id, inactivar_id, recuperar_id]};
		const campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);

		// Acciones si el producto tiene ese 'campo_id'
		if (id && id > 10) {
			let objeto = {[campo_id]: id};
			let prods_aprob;

			// 1. Averigua si existe algún producto aprobado, con ese rclv_id
			for (let entidadProd of entidadesProds) {
				prods_aprob = await BD_genericas.obtienePorCampos(entidadProd, {...objeto, ...statusAprobado});
				if (prods_aprob) {
					prods_aprob = SI;
					break;
				}
			}

			// 2. Averigua si existe algún producto 'potencial', en status distinto a aprobado e inactivo
			if (!prods_aprob)
				for (let entidadProd of entidadesProds) {
					// Averigua si existe algún producto, con ese RCLV
					prods_aprob = await BD_genericas.obtienePorCampos(entidadProd, {...objeto, ...statusPotencial});
					if (prods_aprob) {
						prods_aprob = talVez;
						break;
					}
				}

			// 3. Averigua si existe alguna edición
			if (!prods_aprob && (await BD_genericas.obtienePorCampos("prods_edicion", objeto))) prods_aprob = talVez;

			// 4. No encontró ningún caso
			if (!prods_aprob) prods_aprob = NO;

			// Actualiza el campo en el RCLV
			BD_genericas.actualizaPorId(entidad, id, {prods_aprob});
		}

		// Fin
		return;
	},
	// Actualiza los campos de 'links' en el producto
	linksEnProd: async function ({entidad, id}) {
		// Variables
		const campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
		if (entidad == "colecciones") return;

		// Más variables
		const tipo_id = link_pelicula_id; // El tipo de link 'película'
		const statusAprobado = {status_registro_id: aprobado_id};
		const statusPotencial = {status_registro_id: [creado_id, inactivar_id, recuperar_id]};
		let objeto = {[campo_id]: id, tipo_id};

		// 1. Averigua si existe algún link, para ese producto
		let links_general = BD_genericas.obtienePorCampos("links", {...objeto, ...statusAprobado}).then((n) => {
			return n
				? SI
				: BD_genericas.obtienePorCampos("links", {...objeto, ...statusPotencial}).then((n) => {
						return n ? talVez : NO;
				  });
		});

		// 2. Averigua si existe algún link gratuito, para ese producto
		let links_gratuitos = BD_genericas.obtienePorCampos("links", {...objeto, ...statusAprobado, gratuito: true}).then((n) => {
			return n
				? SI
				: BD_genericas.obtienePorCampos("links", {...objeto, ...statusPotencial, gratuito: true}).then((n) => {
						return n ? talVez : NO;
				  });
		});

		// 3. Averigua si existe algún link en castellano, para ese producto
		let castellano = BD_genericas.obtienePorCampos("links", {...objeto, ...statusAprobado, castellano: true}).then((n) => {
			return n
				? SI
				: BD_genericas.obtienePorCampos("links", {...objeto, ...statusPotencial, castellano: true}).then((n) => {
						return n ? talVez : NO;
				  });
		});

		// Consolida
		[links_general, links_gratuitos, castellano] = await Promise.all([links_general, links_gratuitos, castellano]);

		// Actualiza el registro - con 'await', para que dé bien el cálculo para la colección
		await BD_genericas.actualizaPorId(entidad, id, {links_general, links_gratuitos, castellano});

		// Colecciones - la actualiza en función de la mayoría de los capítulos
		if (entidad == "capitulos") {
			// Obtiene los datos para identificar la colección
			const capitulo = await BD_genericas.obtienePorId("capitulos", id);
			const colID = capitulo.coleccion_id;
			// Rutinas
			this.linksEnColeccion(colID, "links_general");
			this.linksEnColeccion(colID, "links_gratuitos");
			this.linksEnColeccion(colID, "castellano");
		}

		// Fin
		return;
	},
	// Actualiza para las colecciones
	linksEnColeccion: async (colID, campo) => {
		let objeto = {coleccion_id: colID};

		// Cuenta la cantidad de casos true, false y null
		let OK = BD_genericas.contarCasos("capitulos", {...objeto, [campo]: SI});
		let potencial = BD_genericas.contarCasos("capitulos", {...objeto, [campo]: talVez});
		let no = BD_genericas.contarCasos("capitulos", {...objeto, [campo]: NO});
		[OK, potencial, no] = await Promise.all([OK, potencial, no]);

		// Averigua los porcentajes de OK y Potencial
		let total = OK + potencial + no;
		let resultadoOK = OK / total;
		let resultadoPot = (OK + potencial) / total;

		// En función de los resultados, actualiza la colección
		if (resultadoOK >= 0.5) BD_genericas.actualizaPorId("colecciones", colID, {[campo]: SI});
		else if (resultadoPot >= 0.5) BD_genericas.actualizaPorId("colecciones", colID, {[campo]: talVez});
		else BD_genericas.actualizaPorId("colecciones", colID, {[campo]: NO});
	},

	// Varios
	infoIncompleta: (datos) => {
		// Variables
		let {motivo_id, comentario, codigo} = datos;
		let informacion;

		// 1. Falta el motivo
		if (codigo == "inactivar" && !motivo_id) informacion = {mensajes: ["Necesitamos que nos digas el motivo"]};

		// 2. Falta el comentario
		const motivo = motivos_rech_altas.find((n) => n.id == motivo_id);
		if ((motivo && motivo.req_com && !comentario) || (!motivo && !comentario))
			informacion = {mensajes: ["Necesitamos que nos des un comentario"]};

		// Fin
		return informacion;
	},

	// Bloques a mostrar
	bloqueRegistro: function (registro, cantProds) {
		// Variable
		let bloque = [];

		// Datos CRUD
		// Creador
		bloque.push({
			titulo: "Creado por",
			valor: registro.creado_por.apodo ? registro.creado_por.apodo : registro.creado_por.nombre,
		});
		// Fechas
		bloque.push({titulo: "Creado el", valor: comp.fechaDiaMesAno(registro.creado_en)});
		let fechas = [registro.sugerido_en];
		if (registro.alta_analizada_en) fechas.push(registro.alta_analizada_en);
		if (registro.editado_en) fechas.push(registro.editado_en);
		if (registro.edic_analizada_en) fechas.push(registro.edic_analizada_en);
		const ultimaNovedad = comp.fechaDiaMesAno(new Date(Math.max(...fechas)));
		bloque.push({titulo: "Última novedad", valor: ultimaNovedad});
		// Prods en BD
		if (cantProds !== undefined && cantProds !== null) bloque.push({titulo: "Productos en BD", valor: cantProds});

		// Status resumido
		bloque.push({titulo: "Status", ...this.statusResumido(registro)});

		// Fin
		return bloque;
	},
	statusResumido: (registro) => {
		return registro.status_registro.gr_creado
			? {id: 1, valor: "Creado"}
			: registro.status_registro.aprobado
			? {id: 2, valor: "Aprobado"}
			: registro.status_registro.inactivo
			? {id: 3, valor: "Inactivo"}
			: {id: 1, valor: "Para Revisar"};
	},
};
