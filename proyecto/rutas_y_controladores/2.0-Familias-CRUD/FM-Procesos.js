"use strict";
// Variables
const validaPR = require("../2.1-Prod-RUD/PR-FN-Validar");

// Exportar ------------------------------------
module.exports = {
	// Soporte para lectura y guardado de edición
	puleEdicion: async (entidad, original, edicion) => {
		return await puleEdicion(entidad, original, edicion);
	},

	// Lectura de edicion
	obtieneOriginalEdicion: async (entidad, entID, userID, excluirInclude) => {
		// Variables
		const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const condicionEdic = {[campo_id]: entID, editadoPor_id: userID};
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		let includesOrig = "";

		// Obtiene los campos include
		let includesEdic = !excluirInclude ? comp.obtieneTodosLosCamposInclude(entidad) : "";
		if (!excluirInclude) {
			includesOrig = [...includesEdic, "creadoPor", "altaRevisadaPor", "sugerido_por", "statusRegistro", "motivo"];
			if (entidad == "capitulos") includesOrig.push("coleccion");
			if (entidad == "colecciones") includesOrig.push("capitulos");
			if (familia == "rclv") includesOrig.push("prodsEdiciones", ...variables.entidades.prods);
		}

		// Obtiene el registro original con sus includes y le quita los campos sin contenido
		let original = BD_genericas.obtienePorIdConInclude(entidad, entID, includesOrig);
		let edicion = userID ? BD_genericas.obtienePorCondicionConInclude(entidadEdic, condicionEdic, includesEdic) : "";
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
		const familias = original.fuente ? "productos" : "RCLVs"; // los registros de producto tienen el campo 'fuente'
		const carpeta = (familias == "productos" ? "2-" : "3-") + comp.convierteLetras.inicialMayus(familias);
		const final = carpeta + "/Final/";
		const revisar = carpeta + "/Revisar/";
		const sinAvatar = "/publico/imagenes/Avatar/Sin-Avatar.jpg";

		// Si no detectó la familia, devuelve el genérico
		if (!familias) return {orig: sinAvatar, edic: sinAvatar};

		// Obtiene el avatar original
		const orig = !original.avatar
			? sinAvatar
			: original.avatar.includes("/")
			? original.avatar
			: comp.gestionArchivos.existe(carpetaExterna + final + original.avatar)
			? "/externa/" + final + original.avatar
			: comp.gestionArchivos.existe(carpetaExterna + revisar + original.avatar)
			? "/externa/" + revisar + original.avatar
			: sinAvatar;

		// avatarEdic
		const edic = edicion && edicion.avatar ? "/externa/" + revisar + edicion.avatar : orig;

		// Fin
		return {orig, edic};
	},

	// Listados de RCLV
	grupos: {
		pers: (camposDA) => {
			// Variables
			const personajes = camposDA
				.find((n) => n.nombre == "personaje_id") // Obtiene los personajes
				.valores // Obtiene los valores
				// Deja los datos necesarios
				.map((n) => {
					return {
						id: n.id,
						nombre: n.nombre,
						categoria_id: n.categoria_id,
						epocaOcurrencia_id: n.epocaOcurrencia_id,
						rolIglesia_id: n.rolIglesia_id,
						apMar_id: n.apMar_id,
					};
				});
			let casosPuntuales = [];

			// Grupos Estándar
			let grupos = [
				{orden: 2, codigo: "ant", campo: "epocaOcurrencia_id", label: "Antiguo Testamento", clase: "CFC VPC"},
				{orden: 3, codigo: "SF", campo: "rolIglesia_id", label: "Sagrada Familia", clase: "CFC"},
				{orden: 4, codigo: "AL", campo: "rolIglesia_id", label: "Apóstoles", clase: "CFC"},
				{orden: 5, codigo: "cnt", campo: "epocaOcurrencia_id", label: "Contemporáneos de Cristo", clase: "CFC VPC"},
				{orden: 6, codigo: "PP", campo: "rolIglesia_id", label: "Papas", clase: "CFC"},
				{orden: 7, codigo: "pst", campo: "epocaOcurrencia_id", label: "Post. a Cristo (Fe Católica)", clase: "CFC"},
				{orden: 8, codigo: "pst", campo: "epocaOcurrencia_id", label: "Post. a Cristo (Con valores)", clase: "VPC"},
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
		hechos: (camposDA) => {
			// Variables
			let hechos = camposDA.find((n) => n.nombre == "hecho_id").valores;

			// Deja los datos necesarios
			hechos = hechos.map((n) => {
				let {id, nombre, soloCfc, epocaOcurrencia_id, ama} = n;
				return {id, nombre, soloCfc, epocaOcurrencia_id, ama};
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
				if (!hecho.soloCfc) hecho.clase += "VPC ";

				// Apariciones Marianas
				if (hecho.ama) {
					hecho.clase += "ama";
					apMar.push(hecho);
					OK = true;
				}

				// Si es alguno de los 'grupos'
				if (!OK)
					for (let grupo of grupos)
						if (hecho.epocaOcurrencia_id == grupo.codigo) {
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
	},

	// CAMBIOS DE STATUS
	// Revisión: API-edicAprobRech / VISTA-avatarGuardar - Cada vez que se aprueba un valor editado
	// Prod-RUD: Edición - Cuando la realiza un revisor
	revisiones: {
		transfiereDatos: async (original, edicion, campo) => {
			// 1. Si el campo no recibe datos, termina
			const camposQueNoRecibenDatos = [
				"nombreOriginal",
				"nombreCastellano",
				"anoEstreno",
				"sinopsis",
				"avatar",
				"avatar_url",
				...variables.entidades.rclvs_id,
			];
			if (camposQueNoRecibenDatos.includes(campo)) return;

			// Condiciones
			const condicion = {coleccion_id: original.id}; // que pertenezca a la colección
			const condiciones = {...condicion, [campo]: {[Op.or]: [null, ""]}}; // que además el campo esté vacío
			if (original[campo]) condiciones[campo][Op.or].push(original[campo]); // o que coincida con el valor original

			// 2. Actualización condicional por campo
			const cond1 = campo == "tipoActuacion_id";
			const cond21 = variables.entidades.rclvs_id.includes(campo);
			const cond22 = cond21 && edicion[campo] != 2; // Particularidad para rclv_id
			const cond31 = campo == "epocaOcurrencia_id";
			const cond32 = cond31 && edicion.epocaOcurrencia_id != epocasVarias.id; // Particularidad para epocaOcurrencia_id
			const novedad = {[campo]: edicion[campo]};
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
			let statusAprob = familias != "productos" || registro.statusRegistro_id != creadoAprob_id;

			// Acciones si es un producto que no está en status 'aprobado':
			// 1. Averigua si corresponde cambiarlo al status 'aprobado'
			// 2. Si es una colección, ídem para sus capítulos
			// 3. Actualiza 'prodsEnRCLV' en sus RCLVs
			// 4. Obtiene el nuevo status del producto
			if (!statusAprob) statusAprob = await this.prodsPosibleAprob(entidad, registro);

			// Fin
			return statusAprob;
		},
		prodsPosibleAprob: async function (entidad, registro) {
			// Variables
			const publico = true;
			const epocaOcurrencia = true;
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);

			// Acciones si no hay errores
			const errores = await validaPR.consolidado({datos: {...registro, entidad, publico, epocaOcurrencia}});
			if (errores.hay) return false;

			// Variables
			const ahora = comp.fechaHora.ahora();
			let datos = {statusRegistro_id: aprobado_id};
			if (!registro.altaTermEn)
				datos = {
					...datos,
					altaTermEn: ahora,
					leadTimeCreacion: comp.obtieneLeadTime(registro.creadoEn, ahora),
					statusSugeridoPor_id: usAutom_id,
					statusSugeridoEn: ahora,
				};

			// Cambia el status del registro
			await BD_genericas.actualizaPorId(entidad, registro.id, datos);

			// Actualiza el campo 'prodAprob' en los links
			BD_genericas.actualizaTodosPorCondicion("links", {[campo_id]: registro.id}, {prodAprob: true});

			// Si es una colección, revisa si corresponde aprobar capítulos
			if (entidad == "colecciones") await this.capsAprobs(registro.id);

			// Agrega un registro en el histStatus - Genera la información
			let datosHist = {
				...{entidad, entidad_id: registro.id},
				...{sugeridoPor_id: registro.statusSugeridoPor_id, sugeridoEn: registro.statusSugeridoEn},
				...{statusOriginal_id: registro.statusRegistro_id, statusFinal_id: aprobado_id},
				...{revisadoPor_id: 2, revisadoEn: ahora, aprobado: true, comentario: "Aprobado"},
			};
			// Agrega un registro en el histStatus - Guarda los datos históricos
			BD_genericas.agregaRegistro("histStatus", datosHist);

			// Actualiza prodsEnRCLV
			this.accionesPorCambioDeStatus(entidad, {...registro, ...datos});

			// Fin
			return true;
		},
		capsAprobs: async (colID) => {
			// Variables
			const ahora = comp.fechaHora.ahora();
			const publico = true;
			const epocaOcurrencia = true;
			let esperar = [];

			// Prepara los datos
			const datosFijos = {statusColeccion_id: aprobado_id, statusRegistro_id: aprobado_id};
			const datosSugeridos = {statusSugeridoPor_id: usAutom_id, statusSugeridoEn: ahora};

			// Obtiene los capitulos id
			const capitulos = await BD_genericas.obtieneTodosPorCondicion("capitulos", {coleccion_id: colID});

			// Actualiza el status de los capítulos
			for (let capitulo of capitulos) {
				// Variables
				const datosTerm = !capitulo.altaTermEn
					? {altaTermEn: ahora, leadTimeCreacion: comp.obtieneLeadTime(capitulo.creadoEn, ahora)}
					: {};

				// Revisa si cada capítulo supera el test de errores
				let validar = {entidad: "capitulos", ...capitulo, publico, epocaOcurrencia};
				const errores = await validaPR.consolidado({datos: validar});

				// Actualiza los datos
				const datos = !errores.hay
					? {...datosFijos, ...datosSugeridos, ...datosTerm}
					: {...datosFijos, statusRegistro_id: creadoAprob_id};
				esperar.push(BD_genericas.actualizaPorId("capitulos", capitulo.id, datos));
			}

			// Espera hasta que se revisen todos los capítulos
			await Promise.all(esperar);

			// Fin
			return;
		},
		accionesPorCambioDeStatus: function (entidad, registro) {
			// Variables
			let familias = comp.obtieneDesdeEntidad.familias(entidad);

			// prodsEnRCLV
			if (familias == "productos") {
				// 1. Variables
				const stAprob = registro.statusRegistro_id == aprobado_id;
				const entidadesRCLV = variables.entidades.rclvs;

				// 2. Actualiza prodAprob en sus links
				if (registro.links) {
					const prodAprob = aprobados_ids.includes(registro.statusRegistro_id);
					for (let link of registro.links) BD_genericas.actualizaPorId("links", link.id, {prodAprob});
				}

				// 3. Rutina por entidad RCLV
				for (let entidad of entidadesRCLV) {
					let campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
					if (registro[campo_id])
						stAprob
							? BD_genericas.actualizaPorId(entidad, registro[campo_id], {prodsAprob: conLinks})
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
		// Actualiza los campos de 'links' en el producto
		linksEnProd: async ({entidad, id}) => {
			// Variables
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad); // entidad del producto
			const lectura = await BD_genericas.obtieneTodosPorCondicion("links", {[campo_id]: id});

			// Obtiene las películas y trailers
			const linksTrailers = lectura.filter((n) => n.tipo_id == linkTrailer_id);
			const linksPelis = lectura.filter((n) => n.tipo_id == linkPelicula_id);
			const linksHD = linksPelis.filter((n) => n.calidad >= 720);

			// Averigua qué links tiene
			const tiposDeLink = {
				// Trailer
				linksTrailer: averiguaTipoDeLink(linksTrailers),

				// Películas
				linksGral: averiguaTipoDeLink(linksPelis),
				linksGratis: averiguaTipoDeLink(linksPelis, "gratuito"),
				linksCast: averiguaTipoDeLink(linksPelis, "castellano"),
				linksSubt: averiguaTipoDeLink(linksPelis, "subtitulos"),

				// Películas HD
				HD_Gral: averiguaTipoDeLink(linksHD),
				HD_Gratis: averiguaTipoDeLink(linksHD, "gratuito"),
				HD_Cast: averiguaTipoDeLink(linksHD, "castellano"),
				HD_Subt: averiguaTipoDeLink(linksHD, "subtitulos"),
			};

			// Actualiza el registro
			entidad != "capitulos"
				? BD_genericas.actualizaPorId(entidad, id, tiposDeLink)
				: await BD_genericas.actualizaPorId(entidad, id, tiposDeLink); // con 'await', para que dé bien el cálculo para la colección

			// Fin
			return;
		},
		linksEnColec: async (colID) => {
			// Variables
			const campos = [
				"linksTrailer",
				"linksGral",
				"linksGratis",
				"linksCast",
				"linksSubt",
				"HD_Gral",
				"HD_Gratis",
				"HD_Cast",
				"HD_Subt",
			];

			// Rutinas
			const links = await BD_genericas.obtieneTodosPorCondicion("capitulos", {coleccion_id: colID});
			for (let campo of campos) {
				// Cuenta la cantidad de casos true, false y null
				const SI = links.filter((n) => n[campo] == conLinks).length;
				const potencial = links.filter((n) => n[campo] == talVez).length;
				const NO = links.filter((n) => n[campo] == sinLinks).length;

				// Averigua los porcentajes de OK y Potencial
				const total = HD + SI + potencial + NO;
				const resultado = {
					SI: SI / total,
					potencial: (SI + potencial) / total,
				};
				const valor = resultado.SI > 0.5 ? conLinks : resultado.potencial >= 0.5 ? talVez : sinLinks;

				// Actualiza la colección
				BD_genericas.actualizaPorId("colecciones", colID, {[campo]: valor});
			}

			// Fin
			return;
		},

		// Actualiza los campos de 'producto' en el RCLV
		prodsEnRCLV: async ({entidad, id}) => {
			// Variables
			const entidadesProds = variables.entidades.prods;
			const statusAprobado = {statusRegistro_id: aprobado_id};
			const statusValido = {statusRegistro_id: {[Op.ne]: inactivo_id}};
			let prodsAprob;

			// Si el ID es menor o igual a 10, termina la función
			if (id && id <= 10) return;

			// Establece la condición perenne
			const rclv_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const condicion = {[rclv_id]: id};

			// 1. Averigua si existe algún producto aprobado, con ese rclv_id
			for (let entidadProd of entidadesProds) {
				prodsAprob = await BD_genericas.obtienePorCondicion(entidadProd, {...condicion, ...statusAprobado});
				if (prodsAprob) {
					prodsAprob = conLinks;
					break;
				}
			}

			// 2. Averigua si existe algún producto en status provisorio, con ese rclv_id
			if (!prodsAprob)
				for (let entidadProd of entidadesProds) {
					prodsAprob = await BD_genericas.obtienePorCondicion(entidadProd, {...condicion, ...statusValido});
					if (prodsAprob) {
						prodsAprob = talVez;
						break;
					}
				}

			// 3. Averigua si existe alguna edición con ese rclv_id
			if (!prodsAprob && (await BD_genericas.obtienePorCondicion("prodsEdicion", condicion))) prodsAprob = talVez;

			// 4. No encontró ningún caso
			if (!prodsAprob) prodsAprob = sinLinks;

			// Actualiza el campo en el RCLV
			BD_genericas.actualizaPorId(entidad, id, {prodsAprob});

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
			const carpeta = (familias == "productos" ? "2-" : "3-") + comp.convierteLetras.inicialMayus(familias);

			if (ediciones.length) {
				// 1. Elimina el archivo avatar de las ediciones
				for (let edicion of ediciones)
					if (edicion.avatar) comp.gestionArchivos.elimina(carpetaExterna + carpeta + "/Revisar", edicion.avatar);

				// 2. Elimina las ediciones
				BD_genericas.eliminaTodosPorCondicion(entidadEdic, {[campo_id]: id});
			}

			//Fin
			return true;
		},
		eliminaDependsMasEdics: async ({entidadPadre, padreID, entidadHijo}) => {
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
			const ediciones = await BD_genericas.obtieneTodosPorCondicion("prodsEdicion", {[rclv_id]: rclvID});
			if (ediciones.length) {
				// Les borra el vínculo
				await BD_genericas.actualizaTodosPorCondicion("prodsEdicion", {[rclv_id]: rclvID}, {[rclv_id]: null});

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
	bloqueRegistro: function (registro) {
		// Variable
		let bloque = [];

		// Datos CRUD
		bloque.push(
			registro.altaRevisadaEn
				? {titulo: "Revisado el", valor: comp.fechaHora.fechaDiaMesAno(registro.altaRevisadaEn)}
				: {titulo: "Creado el", valor: comp.fechaHora.fechaDiaMesAno(registro.creadoEn)}
		);

		// Status resumido
		bloque.push({titulo: "Status", ...this.statusResumido(registro)});

		// Fin
		return bloque;
	},
	statusResumido: (registro) => {
		return registro.statusRegistro.creados
			? {id: 1, valor: "Creado"}
			: registro.statusRegistro_id == aprobado_id
			? {id: 2, valor: "Aprobado"}
			: registro.statusRegistro_id == inactivo_id
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
		// Quita de edición los campos que no se comparan o que sean 'null'
		if (!camposRevisar.includes(campo) || edicion[campo] === null) {
			delete edicion[campo];
			continue;
		}

		// Corrige errores de data-entry
		if (typeof edicion[campo] == "string") edicion[campo] = edicion[campo].trim();

		// CONDICION 1: Los valores de original y edición son significativos e idénticos
		const condic1 =
			edicion[campo] === original[campo] || // son estrictamente iguales
			(typeof original[campo] == "number" && edicion[campo] == original[campo]) || // coincide el número
			(edicion[campo] === "1" && original[campo] === true) || // coincide el boolean
			(edicion[campo] === "0" && original[campo] === false); // coincide el boolean
		if (condic1) camposNull[campo] = null;

		// CONDICION 2: El objeto vinculado tiene el mismo ID
		const condic2 = !!edicion[campo] && !!edicion[campo].id && !!original[campo] && edicion[campo].id === original[campo].id;

		// Si se cumple alguna de las condiciones, se elimina ese método
		if (condic1 || condic2) delete edicion[campo];
	}

	// 3. Acciones en función de si quedan campos
	let quedanCampos = !!Object.keys(edicion).length;
	if (quedanCampos) {
		// Devuelve el id a la variable de edicion
		if (edicID) edicion.id = edicID;

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
				const errores = await validaPR.consolidado({datos: {...original, entidad, publico: true, epocaOcurrencia: true}});
				if (errores.hay) BD_genericas.actualizaPorId(entidad, original.id, {statusRegistro_id: creadoAprob_id});
			}
	});

	// Fin
	return;
};
let averiguaTipoDeLink = async (links, condicion) => {
	// Filtro inicial
	if (condicion) links = links.filter((n) => n[condicion]);

	// Resultados
	let resultado = {
		SI: links.filter((n) => aprobados_ids.includes(n.statusRegistro_id)).length,
		talVez: links.filter((n) => n.statusRegistro_id != inactivo_id).length,
	};

	// Fin
	return resultado.SI ? conLinks : resultado.talVez ? talVez : sinLinks;
};
