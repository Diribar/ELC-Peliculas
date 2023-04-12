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
		let camposRevisar = [];
		for (let campo of variables.camposRevisar[familia]) {
			camposRevisar.push(campo.nombre);
			if (campo.relacInclude) camposRevisar.push(campo.relacInclude);
		}
		for (let campo in edicion) if (!camposRevisar.includes(campo)) delete edicion[campo];

		// 2. Quita de edición las coincidencias con el original y los campos 'null'
		for (let campo in edicion) {
			// Corrige errores de data-entry
			if (typeof edicion[campo] == "string") edicion[campo] = edicion[campo].trim();

			// CONDICION 1: La edición es 'null'
			let condicion1 = edicion[campo] === null;

			// CONDICION 2: El original y la edición no son 'undefined' y son 'iguales'
			// El original no puede ser 'null', porque ya habría sido eliminado
			// El original no puede ser 'undefined', porque ya lo estamos preguntando
			// La edición no puede ser 'null', porque ya habría sido eliminada
			// La edición no puede ser 'undefined', porque existe el método
			let condicion2 = original[campo] !== undefined && edicion[campo] !== undefined && edicion[campo] == original[campo];

			// CONDICION 3: El objeto vinculado tiene el mismo ID
			let condicion3 = edicion[campo] && edicion[campo].id && original[campo] && edicion[campo].id == original[campo].id;

			// Si se cumple alguna de las condiciones, se elimina ese método
			if (condicion1 || condicion2 || condicion3) delete edicion[campo];
			if (condicion2) camposNull[campo] = null;
		}

		// 3. Acciones en función de si quedan campos
		let quedanCampos = !!Object.keys(edicion).length;
		if (!quedanCampos) {
			// Convierte en 'null' la variable de 'edicion'
			edicion = null;
			// Si además había una edición guardada en la BD, la elimina
			if (edicion_id) await BD_genericas.eliminaPorId(nombreEdicion, edicion_id);
		} else edicion.id = edicion_id;

		// Fin
		return [edicion, camposNull];
	},
	// Lectura de edicion
	obtieneOriginalEdicion: async function (entidad, entID, userID) {
		// Obtiene los campos include
		let includesEstandar = comp.obtieneTodosLosCamposInclude(entidad);
		let includesOrig = [
			"ediciones",
			...includesEstandar,
			"creado_por",
			"alta_revisada_por",
			"sugerido_por",
			"status_registro",
			"motivo",
		];
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
	obtieneAvatar: (original, edicion) => {
		// Obtiene la petitEntidad
		const ents = original.fuente ? "prods" : original.dia_del_ano_id ? "rclvs" : "";

		// Si no detectó la petitFamilia, devuelve el genérico
		if (!ents) return {orig: "/imagenes/0-Base/Avatar/Sin-Avatar.jpg", edic: "/imagenes/0-Base/Avatar/Sin-Avatar.jpg"};

		// Obtiene el avatar original
		let orig = !original.avatar
			? localhost + "/imagenes/0-Base/Avatar/Sin-Avatar.jpg"
			: original.avatar.includes("/")
			? original.avatar
			: localhost +
			  "/imagenes/" +
			  (comp.averiguaSiExisteUnArchivo("./publico/imagenes/2-Avatar-" + ents + "-Final/" + original.avatar)
					? "2-Avatar-Prods-Final/" + original.avatar
					: // Si el avatar está 'a revisar'
					comp.averiguaSiExisteUnArchivo("./publico/imagenes/2-Avatar-" + ents + "-Revisar/" + original.avatar)
					? "2-Avatar-Prods-Revisar/" + original.avatar
					: "0-Base/Avatar/Sin-Avatar.jpg");

		// avatarEdic
		let edic = edicion && edicion.avatar ? localhost + "/imagenes/2-Avatar-" + ents + "-Revisar/" + edicion.avatar : orig;

		// Fin
		return {orig, edic};
	},

	// Listados de RCLV
	gruposPers: (camposDA, userID) => {
		// Variables
		let personajes = camposDA.find((n) => n.nombre == "personaje_id").valores;

		// Deja solamente los aprobados o creados por el usuario
		personajes = personajes.filter(
			(n) => n.status_registro.aprobado || (n.status_registro.creado && n.creado_por_id == userID)
		);

		// Deja los datos necesarios
		personajes = personajes.map((n) => {
			return {
				id: n.id,
				nombre: n.nombre,
				categoria_id: n.categoria_id,
				epoca_id: n.epoca_id,
				rol_iglesia_id: n.rol_iglesia_id,
				ap_mar_id: n.ap_mar_id,
			};
		});
		let casosPuntuales = [];

		// Grupos Estándar
		let grupos = [
			{orden: 2, codigo: "ant", campo: "epoca_id", label: "Antiguo Testamento", clase: "CFC VPC"},
			{orden: 3, codigo: "SF", campo: "rol_iglesia_id", label: "Sagrada Familia", clase: "CFC"},
			{orden: 4, codigo: "AL", campo: "rol_iglesia_id", label: "Apóstoles", clase: "CFC"},
			{orden: 5, codigo: "cnt", campo: "epoca_id", label: "Nuevo Testamento", clase: "CFC VPC"},
			{orden: 6, codigo: "PP", campo: "rol_iglesia_id", label: "Papas", clase: "CFC"},
			{orden: 7, codigo: "pst", campo: "epoca_id", label: "Posterior a los Apóstoles", clase: "CFC VPC"},
		];
		for (let grupo of grupos) grupo.valores = [];

		// Valores para los grupos
		for (let personaje of personajes) {
			// Clase
			personaje.clase = personaje.categoria_id ? personaje.categoria_id : "CFC VPC";
			if (personaje.ap_mar_id != 10) personaje.clase += " AMA AM" + personaje.ap_mar_id;

			// Si tiene 'rol_iglesia_id'
			if (personaje.rol_iglesia_id) {
				let OK = false;
				// Si es alguno de los 'grupos'
				for (let grupo of grupos)
					if (personaje[grupo.campo].startsWith(grupo.codigo)) {
						grupo.valores.push(personaje);
						OK = true;
						break;
					}
			}
			// Si no tiene 'rol_iglesia_id' --> lo agrega a los casos puntuales
			else casosPuntuales.push(personaje);
		}
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

		// Deja los datos necesarios
		hechos = hechos.map((n) => {
			let {id, nombre, solo_cfc, epoca_id, ama} = n;
			return {id, nombre, solo_cfc, epoca_id, ama};
		});
		let apMar = [];
		let casosPuntuales = [];

		// Grupos estándar
		let grupos = [
			// 1 - Casos especiales
			{codigo: "ant", orden: 2, label: "Antiguo Testamento"},
			{codigo: "cnt", orden: 3, label: "Nuevo Testamento"},
			{codigo: "pst", orden: 4, label: "Posterior a los Apóstoles"},
			// 5 - Apariciones Marianas
		];
		for (let grupo of grupos) {
			grupo.valores = [];
			grupo.clase = "CFC VPC";
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
					if (hecho.epoca_id == grupo.codigo) {
						hecho.clase += grupo.codigo;
						grupo.valores.push(hecho);
						OK = true;
						break;
					}
			// Si no es ninguno de los 'grupos' --> lo agrega a los casos puntuales
			if (!OK) casosPuntuales.push(hecho);
		}
		// Grupo 'Casos Puntuales'
		grupos.push({codigo: "CP", orden: 1, label: "Casos Puntuales", clase: "CFC VPC", valores: casosPuntuales});
		// Grupo Apariciones Marianas
		grupos.push({codigo: "ama", orden: 5, label: "Apariciones Mariana", clase: "CFC", valores: apMar});
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
				const ahora = comp.ahora();
				const datos = {
					alta_term_en: ahora,
					lead_time_creacion: comp.obtieneLeadTime(original.creado_en, ahora),
					status_registro_id: aprobado_id,
				};

				// Cambia el status del registro
				BD_genericas.actualizaPorId(entidad, original.id, datos);

				// Si es una colección, le cambia el status también a los capítulos
				if (entidad == "colecciones") {
					datos.alta_revisada_por_id = 2;
					datos.alta_revisada_en = ahora;
					BD_genericas.actualizaTodosPorCampos("capitulos", {coleccion_id: original.id}, datos);
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
				prods_aprob = await BD_genericas.obtienePorCondicion(entidadProd, {...objeto, ...statusAprobado});
				if (prods_aprob) {
					prods_aprob = SI;
					break;
				}
			}

			// 2. Averigua si existe algún producto 'potencial', en status distinto a aprobado e inactivo
			if (!prods_aprob)
				for (let entidadProd of entidadesProds) {
					// Averigua si existe algún producto, con ese RCLV
					prods_aprob = await BD_genericas.obtienePorCondicion(entidadProd, {...objeto, ...statusPotencial});
					if (prods_aprob) {
						prods_aprob = talVez;
						break;
					}
				}

			// 3. Averigua si existe alguna edición
			if (!prods_aprob && (await BD_genericas.obtienePorCondicion("prods_edicion", objeto))) prods_aprob = talVez;

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
		let links_general = BD_genericas.obtienePorCondicion("links", {...objeto, ...statusAprobado}).then((n) => {
			return n
				? SI
				: BD_genericas.obtienePorCondicion("links", {...objeto, ...statusPotencial}).then((n) => {
						return n ? talVez : NO;
				  });
		});

		// 2. Averigua si existe algún link gratuito, para ese producto
		let links_gratuitos = BD_genericas.obtienePorCondicion("links", {...objeto, ...statusAprobado, gratuito: true}).then(
			(n) => {
				return n
					? SI
					: BD_genericas.obtienePorCondicion("links", {...objeto, ...statusPotencial, gratuito: true}).then((n) => {
							return n ? talVez : NO;
					  });
			}
		);

		// 3. Averigua si existe algún link en castellano, para ese producto
		let castellano = BD_genericas.obtienePorCondicion("links", {...objeto, ...statusAprobado, castellano: true}).then((n) => {
			return n
				? SI
				: BD_genericas.obtienePorCondicion("links", {...objeto, ...statusPotencial, castellano: true}).then((n) => {
						return n ? talVez : NO;
				  });
		});

		// 4. Averigua si existe algún link con subtitulos, para ese producto
		let subtitulos = BD_genericas.obtienePorCondicion("links", {...objeto, ...statusAprobado, subtitulos: true}).then((n) => {
			return n
				? SI
				: BD_genericas.obtienePorCondicion("links", {...objeto, ...statusPotencial, subtitulos: true}).then((n) => {
						return n ? talVez : NO;
				  });
		});

		// Consolida
		[links_general, links_gratuitos, castellano, subtitulos] = await Promise.all([
			links_general,
			links_gratuitos,
			castellano,
			subtitulos,
		]);

		// Actualiza el registro - con 'await', para que dé bien el cálculo para la colección
		await BD_genericas.actualizaPorId(entidad, id, {links_general, links_gratuitos, castellano, subtitulos});

		// Colecciones - la actualiza en función de la mayoría de los capítulos
		if (entidad == "capitulos") {
			// Obtiene los datos para identificar la colección
			const capitulo = await BD_genericas.obtienePorId("capitulos", id);
			const colID = capitulo.coleccion_id;
			// Rutinas
			this.linksEnColeccion(colID, "links_general");
			this.linksEnColeccion(colID, "links_gratuitos");
			this.linksEnColeccion(colID, "castellano");
			this.linksEnColeccion(colID, "subtitulos");
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
	momentoDelAno: ({entidad, producto}) => {
		// Variables
		let momento = null;

		// Obtiene los dias_del_ano_id válidos
		const entidadesRCLV = variables.entidadesRCLV;
		const asociacionesRCLV = entidadesRCLV.map((n) => comp.obtieneAsociacion(n));
		let dias_del_ano_id = [];
		for (let asociacion of asociacionesRCLV)
			if (producto[asociacion].dia_del_ano_id <= 366) dias_del_ano_id.push(producto[asociacion].dia_del_ano_id);

		// Si alguno es menor al vigente, le suma 366
		if (dias_del_ano_id.length) {
			dias_del_ano_id = dias_del_ano_id.map((n) => (n < dia_actual_id ? (n += 366) : n));

			// Resta el menor menos el vigente
			const menor = Math.min(...dias_del_ano_id);
			momento = menor - dia_actual_id;
		}

		// Le agrega la diferencia al registro del producto
		BD_genericas.actualizaPorId(entidad, producto.id, {momento});

		// Fin
		return;
	},

	// Varios
	infoIncompleta: (datos) => {
		// Variables
		let {motivo_id, comentario, codigo} = datos;
		let informacion;

		// 1. Falta el motivo
		if (codigo == "inactivar" && !motivo_id) informacion = {mensajes: ["Necesitamos que nos digas el motivo"]};

		// 2. Falta el comentario
		if (!informacion) {
			let motivo;
			// Si se inactivó, se fija si el motivo requiere explicación
			if (codigo == "inactivar") motivo = motivos_rech_altas.find((n) => n.id == motivo_id);
			// Se fija si falta el comentario
			if (!comentario && ((motivo && motivo.req_com) || !motivo_id))
				informacion = {mensajes: ["Necesitamos que nos des un comentario"]};
		}

		// Fin
		return informacion;
	},

	// Bloques a mostrar
	bloqueRegistro: function ({registro, revisor, cantProds}) {
		// Variable
		let bloque = [];

		// Datos CRUD
		if (!registro.alta_revisada_en) bloque.push({titulo: "Creado el", valor: comp.fechaDiaMesAno(registro.creado_en)});
		if (revisor) bloque.push({titulo: "Creado por", valor: comp.nombreApellido(registro.creado_por)});

		if (registro.alta_revisada_en) {
			bloque.push({titulo: "Revisado el", valor: comp.fechaDiaMesAno(registro.alta_revisada_en)});
			if (revisor) bloque.push({titulo: "Revisado por", valor: comp.nombreApellido(registro.alta_revisada_por)});
		}
		if (registro.alta_revisada_en && registro.alta_revisada_en - registro.sugerido_en) {
			bloque.push({titulo: "Actualizado el", valor: comp.fechaDiaMesAno(registro.sugerido_en)});
			if (revisor) bloque.push({titulo: "Actualizado por", valor: comp.nombreApellido(registro.sugerido_por)});
		}

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
