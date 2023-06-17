"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const validaPR = require("../2.1-Prod-RUD/PR-FN-Validar");

// Exportar ------------------------------------
module.exports = {
	// Soporte para lectura y guardado de edición
	puleEdicion: async (entidad, original, edicion) => {
		return await puleEdicion(entidad, original, edicion);
	},

	// Lectura de edicion
	obtieneOriginalEdicion: async (entidad, entID, userID) => {
		// Variables
		const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const condicionEdic = {[campo_id]: entID, editadoPor_id: userID};

		// Obtiene los campos include
		let includesEdic = comp.obtieneTodosLosCamposInclude(entidad);
		let includesOrig = [...includesEdic, "creado_por", "alta_revisada_por", "sugerido_por", "statusRegistro", "motivo"];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");

		// Obtiene el registro original con sus includes y le quita los campos sin contenido
		let original = BD_genericas.obtienePorIdConInclude(entidad, entID, includesOrig);
		let edicion = BD_genericas.obtienePorCondicionConInclude(entidadEdic, condicionEdic, includesEdic);
		[original, edicion] = await Promise.all([original, edicion]);
		for (let campo in original) if (original[campo] === null) delete original[campo];

		// Pule la edición
		if (edicion) edicion = await puleEdicion(entidad, original, edicion); // El output puede ser 'null'
		if (!edicion) edicion = {}; // Debe ser un objeto, porque más adelante se lo trata como tal

		// Fin
		return [original, edicion];
	},

	// Guardado de edición
	guardaActEdicCRUD: async ({entidad, original, edicion, userID}) => {
		// Variables
		let entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);

		// Quita la info que no agrega valor
		edicion = await puleEdicion(entidad, original, edicion);

		// Acciones si existe la edición
		if (edicion) {
			// Si existe la edición y su 'ID' --> actualiza el registro
			if (edicion.id) BD_genericas.actualizaPorId(entidadEdic, edicion.id, edicion);

			// Si existe la edición pero no su 'ID' --> se agrega el registro
			if (!edicion.id) {
				// Se le agregan los campos necesarios: campo_id, editadoPor_id, producto_id (links)
				// 1. campo_id, editadoPor_id
				let campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
				edicion[campo_id] = original.id;
				edicion.editadoPor_id = userID;
				// 2. producto_id (links)
				if (entidad == "links") {
					let producto_id = comp.obtieneDesdeEdicion.campo_idProd(original);
					edicion[producto_id] = original[producto_id];
				}
				// Se agrega el registro
				await BD_genericas.agregaRegistro(entidadEdic, edicion);
			}
		}

		// Fin
		return edicion;
	},
	// Avatar
	obtieneAvatar: (original, edicion) => {
		// Variables
		const familias = original.fuente ? "productos" : "RCLVs";
		const final = "2-" + familias + "/Final/";
		const revisar = "2-" + familias + "/Revisar/";
		const sinAvatar = "0-Base/Avatar/Sin-Avatar.jpg";

		// Si no detectó la familia, devuelve el genérico
		if (!familias) return {orig: "/imagenes/" + sinAvatar, edic: "/imagenes/" + sinAvatar};

		// Obtiene el avatar original
		const orig = !original.avatar
			? localhost + "/imagenes/" + sinAvatar
			: original.avatar.includes("/")
			? original.avatar
			: localhost +
			  "/imagenes/" +
			  (comp.gestionArchivos.existe("./publico/imagenes/" + final + original.avatar)
					? final + original.avatar
					: // Si el avatar está 'a revisar'
					comp.gestionArchivos.existe("./publico/imagenes/" + revisar + original.avatar)
					? revisar + original.avatar
					: sinAvatar);

		// avatarEdic
		const edic = edicion && edicion.avatar ? localhost + "/imagenes/" + revisar + edicion.avatar : orig;

		// Fin
		return {orig, edic};
	},

	// Listados de RCLV
	gruposPers: (camposDA, userID) => {
		// Variables
		const personajes = camposDA
			// Obtiene los personajes
			.find((n) => n.nombre == "personaje_id")
			.valores // Obtiene los valores
			// Deja solamente los aprobados o creados por el usuario
			.filter((n) => n.statusRegistro.aprobado || (n.statusRegistro.creado && n.creadoPor_id == userID))
			// Deja los datos necesarios
			.map((n) => {
				return {
					id: n.id,
					nombre: n.nombre,
					categoria_id: n.categoria_id,
					epoca_id: n.epoca_id,
					rolIglesia_id: n.rolIglesia_id,
					apMar_id: n.apMar_id,
				};
			});
		let casosPuntuales = [];

		// Grupos Estándar
		let grupos = [
			{orden: 2, codigo: "ant", campo: "epoca_id", label: "Antiguo Testamento", clase: "CFC VPC"},
			{orden: 3, codigo: "SF", campo: "rolIglesia_id", label: "Sagrada Familia", clase: "CFC"},
			{orden: 4, codigo: "AL", campo: "rolIglesia_id", label: "Apóstoles", clase: "CFC"},
			{orden: 5, codigo: "cnt", campo: "epoca_id", label: "Contemporáneos de Cristo", clase: "CFC VPC"},
			{orden: 6, codigo: "PP", campo: "rolIglesia_id", label: "Papas", clase: "CFC"},
			{orden: 7, codigo: "pst", campo: "epoca_id", label: "Post. a Cristo (Fe Católica)", clase: "CFC"},
			{orden: 7, codigo: "pst", campo: "epoca_id", label: "Post. a Cristo (Con valores)", clase: "VPC"},
		];
		for (let grupo of grupos) grupo.valores = [];

		// Valores para los grupos
		for (let personaje of personajes) {
			// Clase
			personaje.clase = personaje.categoria_id ? personaje.categoria_id : "CFC VPC";
			if (personaje.apMar_id != 10) personaje.clase += " AMA AM" + personaje.apMar_id;

			// Si tiene 'rolIglesia_id'
			if (personaje.rolIglesia_id) {
				let OK = false;
				// Si es alguno de los 'grupos'
				for (let grupo of grupos)
					if (personaje[grupo.campo].startsWith(grupo.codigo) && grupo.clase.includes(personaje.categoria_id)) {
						grupo.valores.push(personaje);
						OK = true;
						break;
					}
			}
			// Si no tiene 'rolIglesia_id' --> lo agrega a los casos puntuales
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
		hechos = hechos.filter((n) => n.statusRegistro.aprobado || (n.statusRegistro.creado && n.creadoPor_id == userID));

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
	// Revisión: API-edicAprobRech / VISTA-avatarGuardar - Cada vez que se aprueba un valor editado
	// Prod-RUD: Edición - Cuando la realiza un revisor
	revisiones: {
		transfiereDatos: async (original, edicion, campo) => {
			// Variables
			const camposQueNoRecibenDatos = [
				"nombreOriginal",
				"nombreCastellano",
				"anoEstreno",
				"sinopsis",
				"avatar",
				"avatar_url",
			];
			const novedad = {[campo]: edicion[campo]};

			// Condiciones
			const condicion = {coleccion_id: original.id}; // que pertenezca a la colección
			const condiciones = {...condicion, [campo]: {[Op.or]: [null, ""]}}; // que además el campo esté vacío
			if (original[campo]) condiciones[campo][Op.or].push(original[campo]); // o que coincida con el valor original

			// 1. Si el campo no recibe datos, termina
			if (camposQueNoRecibenDatos.includes(campo)) return;

			// 2. Actualización condicional por campo
			const cond1 = campo == "tipoActuacion_id";
			const cond21 = variables.entidades.rclvs_id.includes(campo);
			const cond22 = cond21 && edicion[campo] != 2; // Particularidad para rclv_id
			const cond31 = campo == "epoca_id";
			const cond32 = cond31 && edicion.epoca_id != epocasVarias.id; // Particularidad para epoca_id
			if (cond1 || cond22 || cond32) await BD_genericas.actualizaTodosPorCondicion("capitulos", condicion, novedad);

			// 3. Actualización condicional por valores
			if (!cond1 && !cond21 && !cond31) await BD_genericas.actualizaTodosPorCondicion("capitulos", condiciones, novedad);

			// Fin
			return true;
		},
		eliminaDemasEdiciones: async ({entidad, original, id}) => {
			// Revisa cada registro de edición y decide si corresponde:
			// - Eliminar el registro
			// - Elimina el valor del campo

			// Variables
			const nombreEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const condicion = {[campo_id]: id};
			const ediciones = await BD_genericas.obtieneTodosPorCondicion(nombreEdic, condicion);

			// Acciones si existen ediciones
			if (ediciones.length) {
				let esperar = [];
				for (let edic of ediciones) esperar.push(puleEdicion(entidad, original, edic));
				await Promise.all(esperar);
			}

			// Fin
			return;
		},
		statusAprob: async function ({entidad, registro}) {
			// Variables
			const familias = comp.obtieneDesdeEntidad.familias(entidad);
			let statusAprob = registro.statusRegistro_id != creadoAprob_id;

			// Acciones si es un producto que no está en status 'aprobado':
			// 1. Averigua si corresponde cambiarlo al status 'aprobado'
			// 2. Si es una colección, ídem para sus capítulos
			// 3. Actualiza 'prodsEnRCLV' en sus RCLVs
			// 4. Obtiene el nuevo status del producto
			if (!statusAprob && familias == "productos") statusAprob = await this.prodsPosibleAprob(entidad, registro);

			// Fin
			return statusAprob;
		},
		prodsPosibleAprob: async function (entidad, registro) {
			// Variables
			const publico = true;
			const epoca = true;
			let statusAprob = false;

			// Acciones si no hay errores
			const errores = await validaPR.consolidado({datos: {...registro, entidad, publico, epoca}});
			if (!errores.hay) {
				// Variables
				statusAprob = true;
				const ahora = comp.fechaHora.ahora();
				const datos = {statusRegistro_id: aprobado_id};
				if (!registro.altaTermEn)
					datos = {...datos, altaTermEn: ahora, leadTimeCreacion: comp.obtieneLeadTime(registro.creadoEn, ahora)};

				// Cambia el status del registro
				BD_genericas.actualizaPorId(entidad, registro.id, datos);

				// Si es una colección, revisa si corresponde cambiarle el status a los capítulos
				if (entidad == "colecciones")
					await this.actualizaStatusDeCapitulos({...registro, statusRegistro_id: aprobado_id});

				// Actualiza prodsEnRCLV
				this.accionesPorCambioDeStatus(entidad, {...registro, ...datos});
			}

			// Fin
			return statusAprob;
		},
		actualizaStatusDeCapitulos: async (registro) => {
			// Variables
			const statusRegistro_id = registro.statusRegistro_id;
			const ahora = comp.fechaHora.ahora();
			const publico = true;
			const epoca = true;

			// Prepara los datos
			let datos = {
				sugerido_en: ahora,
				sugeridoPor_id: 2,
				statusColeccion_id: statusRegistro_id,
				statusRegistro_id,
			};
			if (!datos.altaTermEn && statusRegistro_id == aprobado_id)
				datos = {
					...datos,
					altaTermEn: ahora,
					leadTimeCreacion: comp.obtieneLeadTime(registro.creadoEn, ahora),
				};

			// Actualiza los datos en los capítulos
			await BD_genericas.actualizaTodosPorCondicion("capitulos", {coleccion_id: registro.id}, datos);

			// Obtiene los capitulos id
			const capitulos = await BD_genericas.obtieneTodosPorCondicion("capitulos", {coleccion_id: registro.id});

			// Rutina
			let esperar = [];
			datos = {altaTermEn: null, leadTimeCreacion: null, statusRegistro_id: creadoAprob_id};
			for (let capitulo of capitulos) {
				// Revisa si cada capítulo supera el test de errores
				let validar = {entidad: "capitulos", ...capitulo, publico, epoca};
				const errores = await validaPR.consolidado({datos: validar});

				// En caso negativo, corrije el status
				if (errores.hay) esperar.push(BD_genericas.actualizaPorId("capitulos", capitulo.id, datos));
			}
			// Espera hasta que se revisen todos los capítulos
			await Promise.all(esperar);

			// Fin
			return;
		},
		accionesPorCambioDeStatus: async function (entidad, registro) {
			// Variables
			let familias = comp.obtieneDesdeEntidad.familias(entidad);

			// prodsEnRCLV
			if (familias == "productos") {
				// 1. Variables
				const stAprob = registro.statusRegistro_id == aprobado_id;
				const entidadesRCLV = variables.entidades.rclvs;

				// 2. Rutina por entidad RCLV
				for (let entidad of entidadesRCLV) {
					let campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
					if (registro[campo_id])
						stAprob
							? BD_genericas.actualizaPorId(entidad, registro[campo_id], {prodsAprob: SI})
							: this.prodsEnRCLV({entidad, id: registro[campo_id]});
				}
			}

			// linksEnProds
			if (familias == "links") {
				// Obtiene los datos identificatorios del producto
				const prodEntidad = comp.obtieneDesdeEdicion.entidadProd(registro);
				const campo_id = comp.obtieneDesdeEdicion.campo_idProd(registro);
				const prodID = registro[campo_id];
				// Actualiza el producto
				this.linksEnProd({entidad: prodEntidad, id: prodID});
			}

			// Fin
			return;
		},
		// Actualiza los campos de 'producto' en el RCLV
		prodsEnRCLV: async ({entidad, id}) => {
			// La entidad y el ID son de un RCLV

			// Variables
			const entidadesProds = variables.entidades.prods;
			const statusAprobado = {statusRegistro_id: aprobado_id};
			const statusPotencial = {statusRegistro_id: [creado_id, inactivar_id, recuperar_id]};
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);

			// Acciones si el producto tiene ese 'campo_id'
			if (id && id > 10) {
				let objeto = {[campo_id]: id};
				let prodsAprob;

				// 1. Averigua si existe algún producto aprobado, con ese rclv_id
				for (let entidadProd of entidadesProds) {
					prodsAprob = await BD_genericas.obtienePorCondicion(entidadProd, {...objeto, ...statusAprobado});
					if (prodsAprob) {
						prodsAprob = SI;
						break;
					}
				}

				// 2. Averigua si existe algún producto 'potencial', en status distinto a aprobado e inactivo
				if (!prodsAprob)
					for (let entidadProd of entidadesProds) {
						// Averigua si existe algún producto, con ese RCLV
						prodsAprob = await BD_genericas.obtienePorCondicion(entidadProd, {...objeto, ...statusPotencial});
						if (prodsAprob) {
							prodsAprob = talVez;
							break;
						}
					}

				// 3. Averigua si existe alguna edición
				if (!prodsAprob && (await BD_genericas.obtienePorCondicion("prods_edicion", objeto))) prodsAprob = talVez;

				// 4. No encontró ningún caso
				if (!prodsAprob) prodsAprob = NO;

				// Actualiza el campo en el RCLV
				BD_genericas.actualizaPorId(entidad, id, {prodsAprob});
			}

			// Fin
			return;
		},
		// Actualiza los campos de 'links' en el producto
		linksEnProd: async ({entidad, id}) => {
			// Variables
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			if (entidad == "colecciones") return;

			// Más variables
			const tipo_id = link_pelicula_id; // El tipo de link 'película'
			const statusAprobado = {statusRegistro_id: aprobado_id};
			const statusPotencial = {statusRegistro_id: [creado_id, inactivar_id, recuperar_id]};
			let objeto = {[campo_id]: id, tipo_id};

			// 1. Averigua si existe algún link, para ese producto
			let linksGeneral = BD_genericas.obtienePorCondicion("links", {...objeto, ...statusAprobado}).then((n) =>
				n ? SI : BD_genericas.obtienePorCondicion("links", {...objeto, ...statusPotencial}).then((n) => (n ? talVez : NO))
			);

			// 2. Averigua si existe algún link gratuito, para ese producto
			let linksGratuitos = BD_genericas.obtienePorCondicion("links", {...objeto, ...statusAprobado, gratuito: true}).then(
				(n) =>
					n
						? SI
						: BD_genericas.obtienePorCondicion("links", {...objeto, ...statusPotencial, gratuito: true}).then((n) =>
								n ? talVez : NO
						  )
			);

			// 3. Averigua si existe algún link en castellano, para ese producto
			let castellano = BD_genericas.obtienePorCondicion("links", {...objeto, ...statusAprobado, castellano: true}).then(
				(n) =>
					n
						? SI
						: BD_genericas.obtienePorCondicion("links", {...objeto, ...statusPotencial, castellano: true}).then((n) =>
								n ? talVez : NO
						  )
			);

			// 4. Averigua si existe algún link con subtitulos, para ese producto
			let subtitulos = BD_genericas.obtienePorCondicion("links", {...objeto, ...statusAprobado, subtitulos: true}).then(
				(n) =>
					n
						? SI
						: BD_genericas.obtienePorCondicion("links", {...objeto, ...statusPotencial, subtitulos: true}).then((n) =>
								n ? talVez : NO
						  )
			);

			// Consolida
			[linksGeneral, linksGratuitos, castellano, subtitulos] = await Promise.all([
				linksGeneral,
				linksGratuitos,
				castellano,
				subtitulos,
			]);

			// Actualiza el registro - con 'await', para que dé bien el cálculo para la colección
			await BD_genericas.actualizaPorId(entidad, id, {linksGeneral, linksGratuitos, castellano, subtitulos});

			// Colecciones - la actualiza en función de la mayoría de los capítulos
			if (entidad == "capitulos") {
				// Obtiene los datos para identificar la colección
				const capitulo = await BD_genericas.obtienePorId("capitulos", id);
				const colID = capitulo.coleccion_id;
				// Rutinas
				linksEnColeccion(colID, "linksGeneral");
				linksEnColeccion(colID, "linksGratuitos");
				linksEnColeccion(colID, "castellano");
				linksEnColeccion(colID, "subtitulos");
			}

			// Fin
			return;
		},
	},

	eliminar: {
		eliminaAvatarMasEdics: async (entidad, id) => {
			// Obtiene la edicion
			const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const condicion = {[campo_id]: id};
			const ediciones = await BD_genericas.obtieneTodosPorCondicion(entidadEdic, condicion);
			const familias = comp.obtieneDesdeEntidad.familias(entidad);

			if (ediciones.length) {
				// 1. Elimina el archivo avatar de las ediciones
				for (let edicion of ediciones)
					if (edicion.avatar)
						comp.gestionArchivos.elimina("./publico/imagenes/2-" + familias + "/Revisar", edicion.avatar);

				// 2. Elimina las ediciones
				BD_genericas.eliminaTodosPorCondicion(entidadEdic, {[campo_id]: id});
			}

			//Fin
			return true;
		},
		eliminaDependsMasEdics: async ({entidadHijo, entidadPadre, padreID}) => {
			// Variables
			const campoPadre_id = comp.obtieneDesdeEntidad.campo_id(entidadPadre);
			const campoHijo_id = comp.obtieneDesdeEntidad.campo_id(entidadHijo);
			const edicHijo = comp.obtieneDesdeEntidad.entidadEdic(entidadHijo);
			let esperar = [];

			// Obtiene los hijos
			const hijos = await BD_genericas.obtieneTodosPorCondicion(entidadHijo, {[campoPadre_id]: padreID});

			// Elimina las ediciones
			for (let hijo of hijos) esperar.push(BD_genericas.eliminaTodosPorCondicion(edicHijo, {[campoHijo_id]: hijo.id}));
			await Promise.all(esperar);

			// Elimina los hijos
			await BD_genericas.eliminaTodosPorCondicion(entidadHijo, {[campoPadre_id]: padreID});

			// Fin
			return true;
		},
		borraVinculoEdicsProds: async ({entidadRCLV, rclvID}) => {
			// Variables
			const rclv_id = comp.obtieneDesdeEntidad.campo_id(entidadRCLV);

			// Averigua si existen ediciones
			const ediciones = await BD_genericas.obtieneTodosPorCondicion("prods_edicion", {[rclv_id]: rclvID});
			if (ediciones.length) {
				// Les borra el vínculo
				await BD_genericas.actualizaTodosPorCondicion("prods_edicion", {[rclv_id]: rclvID}, {[rclv_id]: null});

				// Revisa si tiene que eliminar alguna edición - la rutina no necesita este resultado
				eliminaEdicionesVacias(ediciones, rclv_id);
			}

			// Fin
			return;
		},
		borraVinculoProds: async ({entidadRCLV, rclvID}) => {
			// Variables
			const campo_idRCLV = comp.obtieneDesdeEntidad.campo_id(entidadRCLV);
			const entidades = variables.entidades.prods;
			let prodsPorEnts = [];
			let prods = [];
			let esperar = [];

			// Obtiene los productos vinculados al RCLV, abierto por entidad
			for (let entidad of entidades)
				prodsPorEnts.push(
					BD_genericas.obtieneTodosPorCondicion(entidad, {[campo_idRCLV]: rclvID}).then((n) =>
						n.map((m) => ({...m, [campo_id]: 1}))
					)
				);
			prodsPorEnts = await Promise.all(prodsPorEnts);

			// Averigua si existían productos vinculados al RCLV
			for (let prodsPorEnt of prodsPorEnts) prods.push(...prodsPorEnt);

			if (prods.length) {
				// Les actualiza el campo_idRCLV al valor 'Ninguno'
				for (let entidad of entidades)
					esperar.push(BD_genericas.actualizaTodosPorCondicion(entidad, {[campo_id]: rclvID}, {[campo_id]: 1}));

				//Revisa si se le debe cambiar el status a algún producto - la rutina no necesita este resultado
				siHayErroresBajaElStatus(prodsPorEnts);
			}

			// Espera a que concluyan las rutinas
			await Promise.all(esperar);

			// Fin
			return;
		},
	},

	// Varios
	infoIncompleta: (datos) => {
		// Variables
		let {motivo_id, comentario, codigo} = datos;
		let informacion;

		// 1. Falta el motivo
		if (codigo == "inactivar" && !motivo_id) informacion = {mensajes: ["Necesitamos que nos digas el motivo"]};

		// 2. Falta el comentario
		if (!informacion && !comentario) informacion = {mensajes: ["Necesitamos que nos des un comentario"]};

		// Fin
		return informacion;
	},

	// Bloques a mostrar
	bloqueRegistro: function ({registro, revisor}) {
		// Variable
		let bloque = [];

		// Datos CRUD
		if (!registro.altaRevisadaEn) bloque.push({titulo: "Creado el", valor: comp.fechaHora.fechaDiaMesAno(registro.creadoEn)});
		if (revisor) bloque.push({titulo: "Creado por", valor: comp.nombreApellido(registro.creado_por)});

		if (registro.altaRevisadaEn) {
			bloque.push({titulo: "Revisado el", valor: comp.fechaHora.fechaDiaMesAno(registro.altaRevisadaEn)});
			if (revisor) bloque.push({titulo: "Revisado por", valor: comp.nombreApellido(registro.alta_revisada_por)});
		}
		if (registro.altaRevisadaEn && registro.altaRevisadaEn - registro.sugeridoEn) {
			bloque.push({titulo: "Actualizado el", valor: comp.fechaHora.fechaDiaMesAno(registro.sugeridoEn)});
			if (revisor) bloque.push({titulo: "Actualizado por", valor: comp.nombreApellido(registro.sugerido_por)});
		}

		// Status resumido
		bloque.push({titulo: "Status", ...this.statusResumido(registro)});

		// Fin
		return bloque;
	},
	statusResumido: (registro) => {
		return registro.statusRegistro.gr_creado
			? {id: 1, valor: "Creado"}
			: registro.statusRegistro.aprobado
			? {id: 2, valor: "Aprobado"}
			: registro.statusRegistro.inactivo
			? {id: 3, valor: "Inactivo"}
			: {id: 1, valor: "Para Revisar"};
	},
	fichaDelUsuario: async function (userID, petitFamilias) {
		// Variables
		const ahora = comp.fechaHora.ahora();
		const include = "rolIglesia";
		const usuario = await BD_genericas.obtienePorIdConInclude("usuarios", userID, include);
		let bloque = [];

		// Datos del usuario
		// Nombre
		bloque.push({titulo: "Nombre", valor: usuario.nombre + " " + usuario.apellido});
		// Edad
		if (usuario.fechaNacim) {
			let edad = parseInt((ahora - new Date(usuario.fechaNacim).getTime()) / unAno);
			bloque.push({titulo: "Edad", valor: edad + " años"});
		}
		// Rol en la iglesia
		if (usuario.rolIglesia) bloque.push({titulo: "Rol en la Iglesia", valor: usuario.rolIglesia.nombre});
		// Tiempo en ELC
		const antiguedad = ((ahora - new Date(usuario.creadoEn).getTime()) / unAno).toFixed(1).replace(".", ",");
		bloque.push({titulo: "Tiempo en ELC", valor: antiguedad + " años"});
		// Calidad de las altas
		bloque.push(...this.usuarioCalidad(usuario, petitFamilias));

		// Fin
		return bloque;
	},
	usuarioCalidad: (usuario, prefijo) => {
		// Contar los casos aprobados y rechazados
		const cantAprob = usuario[prefijo + "Aprob"];
		const cantRech = usuario[prefijo + "Rech"];

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
	},
};

// Funciones
let puleEdicion = async (entidad, original, edicion) => {
	// Variables
	const familias = comp.obtieneDesdeEntidad.familias(entidad);
	const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
	const edicID = edicion.id;
	let camposNull = {};
	let camposRevisar = [];

	// Obtiene los campos a revisar
	for (let campo of variables.camposRevisar[familias]) {
		// Agrega el campo simple
		camposRevisar.push(campo.nombre);
		// Agrega el campo include
		if (campo.relacInclude) camposRevisar.push(campo.relacInclude);
	}

	// Quita de edición los campos que correspondan
	for (let campo in edicion) {
		// Corrige errores de data-entry
		if (typeof edicion[campo] == "string") edicion[campo] = edicion[campo].trim();

		// CONDICION 1: El campo tiene valor 'null'
		const condic1 = edicion[campo] === null;

		// CONDICION 2: Los valores de original y edición son significativos e idénticos
		// 1. Son estrictamente iguales
		// 1. El campo de la edición tiene algún valor
		const condic2 = edicion[campo] === original[campo] && !condic1;
		if (condic2) camposNull[campo] = null;

		// CONDICION 3: El objeto vinculado tiene el mismo ID
		const condic3 = edicion[campo] && edicion[campo].id && original[campo] && edicion[campo].id == original[campo].id;

		// CONDICION 4: Quita de edición los campos que no se comparan
		const condic4 = !camposRevisar.includes(campo);

		// Si se cumple alguna de las condiciones, se elimina ese método
		if (condic1 || condic2 || condic3 || condic4) delete edicion[campo];
	}

	// 3. Acciones en función de si quedan campos
	let quedanCampos = !!Object.keys(edicion).length;
	if (quedanCampos) {
		// Devuelve el id a la variable de edicion
		edicion.id = edicID;

		// Si la edición existe en BD y hubieron campos iguales entre la edición y el original, actualiza la edición
		if (edicID && Object.keys(camposNull).length) await BD_genericas.actualizaPorId(entidadEdic, edicID, camposNull);
	} else {
		// Convierte en 'null' la variable de 'edicion'
		edicion = null;

		// Si había una edición guardada en la BD, la elimina
		if (edicID) await BD_genericas.eliminaPorId(entidadEdic, edicID);
	}

	// Fin
	return edicion;
};
// Actualiza para las colecciones
let linksEnColeccion = async (colID, campo) => {
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
};
let eliminaEdicionesVacias = async (ediciones, campo_idRCLV) => {
	// Revisa si tiene que eliminar alguna edición
	for (let edicion of ediciones) {
		// Variables
		const campo_idProd = comp.obtieneDesdeEdicion.campo_idProd(edicion);
		const prodEntidad = comp.obtieneDesdeEdicion.entidadProd(edicion);
		const prodID = edicion[campo_idProd];

		// Obtiene el producto original
		const original = await BD_genericas.obtienePorId(prodEntidad, prodID);

		// Elimina la edición si está vacía
		delete edicion[campo_idRCLV];
		await puleEdicion(prodEntidad, original, edicion);
	}
	// Fin
	return;
};
let siHayErroresBajaElStatus = (prodsPorEnts) => {
	// Variables
	const entidades = variables.entidades.prods;

	// Acciones por cada ENTIDAD
	entidades.forEach(async (entidad, i) => {
		// Averigua si existen registros por cada entidad
		if (prodsPorEnts[i].length)
			// Acciones por cada PRODUCTO
			for (let original of prodsPorEnts[i]) {
				// Si hay errores, le cambia el status
				const errores = await validaPR.consolidado({datos: {...original, entidad, publico: true, epoca: true}});
				if (errores.hay) BD_genericas.actualizaPorId(entidad, original.id, {statusRegistro_id: creadoAprob_id});
			}
	});

	// Fin
	return;
};
