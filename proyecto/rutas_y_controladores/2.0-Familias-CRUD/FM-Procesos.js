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
			includesOrig = [...includesEdic, "creadoPor", "altaRevisadaPor", "statusSugeridoPor", "statusRegistro", "motivo"];
			if (entidad == "capitulos") includesOrig.push("coleccion");
			if (entidad == "colecciones") includesOrig.push("capitulos");
			if (familia == "rclv") includesOrig.push("prodsEdiciones", ...variables.entidades.prods);
		}

		// Obtiene el registro original con sus includes y le quita los campos sin contenido
		let original = BD_genericas.obtienePorIdConInclude(entidad, entID, includesOrig);
		let edicion = userID ? BD_genericas.obtienePorCondicionConInclude(entidadEdic, condicionEdic, includesEdic) : "";
		[original, edicion] = await Promise.all([original, edicion]);
		if (includesOrig.includes("capitulos"))
			original.capitulos = original.capitulos.filter((n) => activos_ids.includes(n.statusRegistro_id));
		for (let campo in original) if (original[campo] === null) delete original[campo];

		// Pule la edición
		edicion = edicion
			? await puleEdicion(entidad, original, edicion) // El output puede ser 'null'
			: {}; // Debe ser un objeto, porque más adelante se lo trata como tal

		// Fin
		return [original, edicion];
	},

	// Guardado de edición
	guardaActEdicCRUD: async ({entidad, original, edicion, userID}) => {
		// Variables
		let entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);

		// Quita la info que no agrega valor
		edicion = await puleEdicion(entidad, original, edicion);

		// Acciones si quedaron datos para actualizar
		if (edicion) {
			// Si existe el registro, lo actualiza
			if (edicion.id) await BD_genericas.actualizaPorId(entidadEdic, edicion.id, edicion);

			// Si no existe el registro, lo agrega
			if (!edicion.id) {
				// campo_id, editadoPor_id
				const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
				edicion[campo_id] = original.id;
				edicion.editadoPor_id = userID;

				// producto_id
				if (entidad == "links") {
					const producto_id = comp.obtieneDesdeCampo_id.campo_idProd(original);
					edicion[producto_id] = original[producto_id];
					if (producto_id != "pelicula_id") edicion.borrarCol_id = original.borrarCol_id; // para ediciones de links
				}

				// borrarCol_id
				if (entidad == "colecciones") edicion.borrarCol_id = original.id; // para ediciones de colección
				if (entidad == "capitulos") edicion.borrarCol_id = original.coleccion_id; // para ediciones de capítulos
				if (entidad == "links") edicion.borrarCol_id = original.borrarCol_id; // para ediciones de links

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
		const carpeta = familias == "productos" ? "2-Productos" : "3-RCLVs";
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
			? "/Externa/" + final + original.avatar
			: comp.gestionArchivos.existe(carpetaExterna + revisar + original.avatar)
			? "/Externa/" + revisar + original.avatar
			: sinAvatar;

		// avatarEdic
		const edic = edicion && edicion.avatar ? "/Externa/" + revisar + edicion.avatar : orig;

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
			const cond22 = cond21 && edicion[campo] != 2; // particularidad para rclv_id
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
				let espera = [];
				for (let edic of ediciones) espera.push(puleEdicion(entidad, original, edic));
				await Promise.all(espera);
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
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);

			// Acciones si no hay errores
			const errores = await validaPR.consolidado({datos: {...registro, entidad}});
			if (errores.impideAprobado) return false;

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
			let espera = [];
			let datos;

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
				datos = {entidad: "capitulos", ...capitulo};
				const errores = await validaPR.consolidado({datos});

				// Actualiza los datos
				datos = errores.impideAprobado
					? {...datosFijos, statusRegistro_id: creadoAprob_id}
					: {...datosFijos, ...datosSugeridos, ...datosTerm};
				espera.push(BD_genericas.actualizaPorId("capitulos", capitulo.id, datos));
			}

			// Espera hasta que se revisen todos los capítulos
			await Promise.all(espera);

			// Fin
			return;
		},
		accionesPorCambioDeStatus: async function (entidad, registro) {
			// Variables
			let familias = comp.obtieneDesdeEntidad.familias(entidad);

			// prodsEnRCLV
			if (familias == "productos") {
				// Variables
				const prodAprob = aprobados_ids.includes(registro.statusRegistro_id);

				// Actualiza prodAprob en sus links
				if (registro.links) {
					let espera = [];
					for (let link of registro.links) espera.push(BD_genericas.actualizaPorId("links", link.id, {prodAprob}));
					await Promise.all(espera);
				}

				// Rutina por entidad RCLV
				const entidadesRCLV = variables.entidades.rclvs;
				for (let entidadRCLV of entidadesRCLV) {
					const campo_id = comp.obtieneDesdeEntidad.campo_id(entidadRCLV);
					if (registro[campo_id] && registro[campo_id] != 1)
						prodAprob
							? BD_genericas.actualizaPorId(entidadRCLV, registro[campo_id], {prodsAprob: true})
							: this.prodsEnRCLV({entidad: entidadRCLV, id: registro[campo_id]});
				}
			}

			// linksEnProds
			if (familias == "links") {
				// Obtiene los datos identificatorios del producto
				const prodEntidad = comp.obtieneDesdeCampo_id.entidadProd(registro);
				const campo_id = comp.obtieneDesdeCampo_id.campo_idProd(registro);
				const prodID = registro[campo_id];

				// Actualiza el producto
				await this.linksEnProd({entidad: prodEntidad, id: prodID});
				if (prodEntidad == "capitulos") {
					const colID = await BD_genericas.obtienePorId("capitulos", prodID).then((n) => n.coleccion_id);
					this.linksEnColec(colID);
				}
			}

			// Actualiza la variable de links vencidos
			await comp.actualizaLinksVencPorSem();

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
				...["linksTrailer", "linksGral", "linksGratis", "linksCast", "linksSubt"],
				...["HD_Gral", "HD_Gratis", "HD_Cast", "HD_Subt"],
			];

			// Rutinas
			const links = await BD_genericas.obtieneTodosPorCondicion("capitulos", {coleccion_id: colID});
			for (let campo of campos) {
				// Cuenta la cantidad de casos true, false y null
				const SI = links.filter((n) => n[campo] == conLinks).length;
				const potencial = links.filter((n) => n[campo] == linksTalVez).length;
				const NO = links.filter((n) => n[campo] == sinLinks).length;

				// Averigua los porcentajes de OK y Potencial
				const total = SI + potencial + NO;
				const resultado = {
					SI: SI / total,
					potencial: (SI + potencial) / total,
				};
				const valor = resultado.SI > 0.5 ? conLinks : resultado.potencial >= 0.5 ? linksTalVez : sinLinks;

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
						prodsAprob = linksTalVez;
						break;
					}
				}

			// 3. Averigua si existe alguna edición con ese rclv_id
			if (!prodsAprob && (await BD_genericas.obtienePorCondicion("prodsEdicion", condicion))) prodsAprob = linksTalVez;

			// 4. No encontró ningún caso
			if (!prodsAprob) prodsAprob = sinLinks;

			// Actualiza el campo en el RCLV
			BD_genericas.actualizaPorId(entidad, id, {prodsAprob});

			// Fin
			return;
		},
	},
	eliminar: {
		eliminaDependientes: async (entidad, id, original) => {
			// Variables
			const familias = comp.obtieneDesdeEntidad.familias(entidad);
			const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const carpeta = familias == "productos" ? "2-Productos" : "3-RCLVs";
			const condicion = entidad == "colecciones" ? {borrarCol_id: id} : {[campo_id]: id};

			// Elimina el archivo avatar del original
			if (original.avatar && !original.avatar.includes("/")) {
				comp.gestionArchivos.elimina(carpetaExterna + carpeta + "/Final", original.avatar);
				comp.gestionArchivos.elimina(carpetaExterna + carpeta + "/Revisar", original.avatar);
			}

			// Acciones para las ediciones
			const ediciones = await BD_genericas.obtieneTodosPorCondicion(entidadEdic, condicion);
			if (ediciones.length) {
				// Elimina el archivo avatar de las ediciones
				for (let edicion of ediciones)
					if (edicion.avatar) comp.gestionArchivos.elimina(carpetaExterna + carpeta + "/Revisar", edicion.avatar);

				// Elimina las ediciones
				await BD_genericas.eliminaTodosPorCondicion(entidadEdic, condicion);
			}

			// Productos
			if (familias == "productos") {
				// Elimina los links
				await BD_genericas.eliminaTodosPorCondicion("linksEdicion", condicion);
				await BD_genericas.eliminaTodosPorCondicion("links", condicion);

				// Colección - elimina sus capítulos
				if (entidad == "colecciones") await BD_genericas.eliminaTodosPorCondicion("capitulos", {coleccion_id: id});
			}

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
			let espera = [];

			// Obtiene los productos vinculados al RCLV, en cada entidad
			for (let entidad of entidades)
				prodsPorEnts.push(
					BD_genericas.obtieneTodosPorCondicion(entidad, {[campo_idRCLV]: rclvID}).then((n) =>
						n.map((m) => ({...m, [campo_id]: 1}))
					)
				);
			prodsPorEnts = await Promise.all(prodsPorEnts);
			for (let prodsPorEnt of prodsPorEnts) prods.push(...prodsPorEnt);

			// Averigua si existían productos vinculados al RCLV
			if (prods.length) {
				// Les actualiza el campo_idRCLV al valor 'Ninguno'
				for (let entidad of entidades)
					espera.push(BD_genericas.actualizaTodosPorCondicion(entidad, {[campo_id]: rclvID}, {[campo_id]: 1}));

				//Revisa si se le debe cambiar el status a algún producto - la rutina no necesita este resultado
				siHayErroresBajaElStatus(prodsPorEnts);
			}

			// Espera a que concluyan las rutinas
			await Promise.all(espera);

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
				? {titulo: "Revisado el", valor: comp.fechaHora.diaMesAno(registro.altaRevisadaEn)}
				: {titulo: "Creado el", valor: comp.fechaHora.diaMesAno(registro.creadoEn)}
		);

		// Status resumido
		bloque.push({titulo: "Status", ...this.statusResumido(registro)});

		// Fin
		return bloque;
	},
	statusResumido: (registro) => {
		// Variables
		const {entidad, id} = registro;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const {codigo, nombre} = registro.statusRegistro;
		const origen = familia == "producto" ? "P" : "R";
		const cola = "/?entidad=" + entidad + "&id=" + id + "&origen=DT" + origen;

		// Genera el href
		const href =
			registro.statusRegistro_id == creado_id
				? "/revision/" + familia + "/alta" + cola
				: registro.statusRegistro_id == creadoAprob_id // sólo aplica para productos
				? "/revision/" + familia + "/edicion" + cola
				: [inactivar_id, recuperar_id].includes(registro.statusRegistro_id)
				? "/revision/" + familia + "/inactivar-o-recuperar" + cola
				: "";

		// Fin
		return {codigo, valor: nombre, href};
	},
	fichaDelUsuario: async function (userID, petitFamilias) {
		// Variables
		const ahora = comp.fechaHora.ahora();
		const usuario = await BD_genericas.obtienePorId("usuarios", userID);
		let bloque = [];

		// Nombre
		bloque.push({titulo: "Nombre", valor: usuario.nombre + " " + usuario.apellido});

		// Edad
		if (usuario.fechaNacim) {
			let edad = parseInt((ahora - new Date(usuario.fechaNacim).getTime()) / unAno);
			bloque.push({titulo: "Edad", valor: edad + " años"});
		}

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
		const campo_idProd = comp.obtieneDesdeCampo_id.campo_idProd(edicion);
		const prodEntidad = comp.obtieneDesdeCampo_id.entidadProd(edicion);
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
				const errores = await validaPR.consolidado({datos: {...original, entidad}});
				if (errores.impideAprobado)
					BD_genericas.actualizaPorId(entidad, original.id, {statusRegistro_id: creadoAprob_id});
			}
	});

	// Fin
	return;
};
let averiguaTipoDeLink = (links, condicion) => {
	// Filtro inicial
	if (condicion) links = links.filter((n) => n[condicion]);

	// Resultados
	let resultado = {
		SI: links.filter((n) => aprobados_ids.includes(n.statusRegistro_id)).length,
		linksTalVez: links.filter((n) => n.statusRegistro_id != inactivo_id).length,
	};

	// Fin
	return resultado.SI ? conLinks : resultado.linksTalVez ? linksTalVez : sinLinks;
};
