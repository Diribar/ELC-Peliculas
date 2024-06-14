"use strict";
// Variables
const validaPR = require("../2.1-Prods-RUD/PR-FN-Validar");

// Exportar ------------------------------------
module.exports = {
	// CRUD
	obtieneOriginalEdicion: async ({entidad, entID, userID, excluirInclude, omitirPulirEdic}) => {
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

		// Obtiene el registro original con sus includes
		let original = BD_genericas.obtienePorIdConInclude(entidad, entID, includesOrig);
		let edicion = userID ? BD_genericas.obtienePorCondicionConInclude(entidadEdic, condicionEdic, includesEdic) : "";
		[original, edicion] = await Promise.all([original, edicion]);
		if (includesOrig.includes("capitulos"))
			original.capitulos = original.capitulos.filter((n) => activos_ids.includes(n.statusRegistro_id));

		// Le quita los campos sin contenido
		for (let prop in original) if (original[prop] === null) delete original[prop];

		// Pule la edición
		edicion = edicion
			? omitirPulirEdic
				? edicion
				: await comp.puleEdicion(entidad, original, edicion) // El output puede ser 'null'
			: {}; // Debe ser un objeto, porque más adelante se lo trata como tal

		// Fin
		return [original, edicion];
	},
	guardaActEdic: async ({entidad, original, edicion, userID}) => {
		// Variables
		let entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);

		// Quita la info que no agrega valor
		edicion = await comp.puleEdicion(entidad, original, edicion);

		// Acciones si quedaron datos para actualizar
		if (edicion) {
			// Si existe el registro, lo actualiza
			if (edicion.id) await BD_genericas.actualizaPorId(entidadEdic, edicion.id, edicion);
			// Si no existe el registro, lo agrega
			else {
				// campo_id, editadoPor_id
				const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
				edicion[campo_id] = original.id;
				edicion.editadoPor_id = userID;

				// producto_id
				if (entidad == "links") {
					const producto_id = comp.obtieneDesdeCampo_id.campo_idProd(original);
					edicion[producto_id] = original[producto_id];
					if (producto_id != "pelicula_id") edicion.grupoCol_id = original.grupoCol_id; // para ediciones de links
				}

				// grupoCol_id
				if (entidad == "colecciones") edicion.grupoCol_id = original.id; // para ediciones de colección
				if (entidad == "capitulos") edicion.grupoCol_id = original.coleccion_id; // para ediciones de capítulos
				if (entidad == "links") edicion.grupoCol_id = original.grupoCol_id; // para ediciones de links

				// Se agrega el registro
				await BD_genericas.agregaRegistro(entidadEdic, edicion);
			}
		}

		// Fin
		return edicion;
	},
	obtieneElHistorialDeStatus: async function (prodRclv) {
		// Variables
		const {entidad, id: entidad_id, creadoPor_id, creadoEn} = prodRclv;
		const condics = {entidad, entidad_id};
		const include = ["statusOriginal", "statusFinal", "motivo"];
		const ordenMovs = [
			{stOrig_id: 1, stFinal_id: 6},
			{stOrig_id: 4, stFinal_id: 6},
			{stOrig_id: 6, stFinal_id: 5},
		]; // no se incluye hacia 'inactivar_id', porque sería el único registro

		// Obtiene el historial de status
		let historialStatus = await BD_genericas.obtieneTodosPorCondicionConInclude("histStatus", condics, include);
		historialStatus = historialStatus
			.map((n) => ({
				...n,
				orden: ordenMovs.findIndex((m) => m.stOrig_id == n.statusOriginal_id && m.stFinal_id == n.statusFinal_id),
			}))
			.sort((a, b) => a.orden - b.orden)
			.sort((a, b) => (a.statusOriginalEn < b.statusOriginalEn ? -1 : a.statusOriginalEn > b.statusOriginalEn ? 1 : 0));

		// Agrega el primer registro, con status 'creado_id'
		historialStatus.unshift({
			statusFinal_id: creado_id,
			statusFinal: {nombre: "Creado"},
			statusFinalPor_id: creadoPor_id,
			statusFinalEn: creadoEn,
		});

		// Completa el historial - rutina para los siguientes
		let contador = 0;
		while (contador < historialStatus.length) {
			historialStatus = await this.agregaUnMovStatus({historialStatus, prodRclv, contador});
			contador++;
		}

		// Procesa los comentarios
		historialStatus = historialStatus.map((n) => ({
			...n,
			comentario: n.comentario ? n.comentario : n.motivo ? n.motivo.descripcion : "",
		}));

		// Fin
		return historialStatus;
	},
	agregaUnMovStatus: async ({historialStatus, prodRclv, contador}) => {
		// Variables
		const {entidad, id: entidad_id, motivo} = prodRclv;
		const {altaRevisadaPor_id, altaRevisadaEn, altaTermEn} = prodRclv;
		const {statusSugeridoPor_id, statusSugeridoEn, statusRegistro_id} = prodRclv;
		const regAct = historialStatus[contador];
		const statusAct = regAct.statusFinal_id;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		let statusFinal_id, statusFinal, statusFinalPor_id, statusFinalEn, comentario;

		// Obtiene el siguiente status
		const buscarDelProdRCLV = contador == historialStatus.length - 1; // no hay un registro posterior en el historial
		const statusSig = buscarDelProdRCLV
			? statusRegistro_id // el status del prodRclv
			: historialStatus[contador + 1].statusOriginal_id; // el status del siguiente registro en el historial

		// Si el status coincide, interrumpe la función
		if (statusAct == statusSig) return historialStatus;

		// Algoritmos por status
		if (statusAct == creado_id) {
			// Variables - Los datos finales son los de la revisión
			statusFinalPor_id = altaRevisadaPor_id;
			statusFinalEn = altaRevisadaEn;

			statusFinal_id =
				altaRevisadaEn == statusSugeridoEn // si la fecha de revisión es la misma que la sugerida => statusRegistro_id
					? statusRegistro_id
					: familia == "producto"
					? altaRevisadaEn != altaTermEn // si la fecha no coincide, es porque fue aprobado
						? creadoAprob_id
						: inactivo_id // si la fecha coincide, es porque fue rechazado
					: familia == "rclv"
					? statusSig == inactivar_id // Rclvs - si está en inactivar, pasó por aprobado, de lo contrario está o pasó por inactivo_id
						? aprobado_id
						: inactivo_id
					: null;
			if (statusFinal_id == inactivo_id) comentario = motivo.descripcion;
		}
		if (statusAct == creadoAprob_id) statusFinal_id = altaTermEn ? aprobado_id : inactivar_id;
		if (statusAct == aprobado_id) statusFinal_id = inactivar_id;
		if (statusAct == inactivar_id) statusFinal_id = inactivo_id;
		if (statusAct == inactivo_id) statusFinal_id = recuperar_id;

		// Agrega el nombre del statusFinal
		if (!statusFinal_id) return historialStatus;
		const {nombre} = statusRegistros.find((n) => n.id == statusFinal_id);
		statusFinal = {nombre};

		// Agrega otros datos
		if (statusFinal_id == statusSig) {
			if (!statusFinalPor_id)
				statusFinalPor_id = buscarDelProdRCLV
					? statusSugeridoPor_id // del producto
					: historialStatus[contador + 1].statusOriginalPor_id; // del siguiente registro
			if (!statusFinalEn)
				statusFinalEn = buscarDelProdRCLV
					? statusSugeridoEn // del producto
					: historialStatus[contador + 1].statusOriginalEn; // del siguiente producto
		}

		// Arma el registro a agregarle al historial
		const statusOriginal_id = regAct.statusFinal_id;
		const statusOriginal = {nombre: regAct.statusFinal.nombre};
		const statusOriginalPor_id = regAct.statusFinalPor_id;
		const statusOriginalEn = regAct.statusFinalEn;
		if (!statusFinalEn) statusFinalEn = statusOriginalEn;
		let sigReg = {
			...{entidad, entidad_id},
			...{statusOriginal_id, statusOriginal, statusOriginalPor_id, statusOriginalEn},
			...{statusFinal_id, statusFinal, statusFinalPor_id, statusFinalEn},
		};

		// Se fija si corresponde guardar el último registro en la BD
		if (statusFinal_id == inactivo_id || inactivos_ids.includes(statusOriginal_id))
			await BD_genericas.agregaRegistro("histStatus", sigReg);

		// Procesa el comentario
		if (statusFinal_id == inactivar_id) comentario = motivo.descripcion;
		if (comentario) sigReg.comentario = comentario;

		// Agrega el registro al historial
		historialStatus.splice(contador + 1, 0, sigReg);

		// Fin
		return historialStatus;
	},
	grupos: {
		pers: (camposDA) => {
			// Variables
			const personajes = camposDA
				.find((n) => n.nombre == "personaje_id") // Obtiene los personajes
				.valores // Obtiene los valores
				.map((n) => {
					// Deja los datos necesarios
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
	actualizaAgregaComentario: async (datos) => {
		// Variables
		const tabla = "comentsInactivos";
		const {entidad, entidad_id} = datos;

		// Averigua si existe el registro
		let registro = await BD_genericas.obtienePorCondicion(tabla, {entidad, entidad_id});

		// Si existe, lo actualiza
		if (registro) await BD_genericas.actualizaPorId(tabla, registro.id, datos);
		// Si no existe, lo agrega
		else await BD_genericas.agregaRegistro(tabla, datos);

		// Fin
		return;
	},

	// CRUD y Revisión
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
			for (let edic of ediciones) espera.push(comp.puleEdicion(entidad, original, edic));
			await Promise.all(espera);
		}

		// Fin
		return;
	},
	statusAprob: async function ({entidad, registro}) {
		// Variables
		const familias = comp.obtieneDesdeEntidad.familias(entidad);

		// Primera respuesta
		let statusAprob = familias != "productos" || registro.statusRegistro_id != creadoAprob_id;
		if (statusAprob) return true;

		// Si hay errores, devuelve falso e interrumpe la función
		const errores = await validaPR.consolidado({datos: {...registro, entidad}});
		if (errores.impideAprobado) return false;

		// 1. Cambia el status del registro
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
		await BD_genericas.actualizaPorId(entidad, registro.id, datos);

		// 2. Actualiza el campo 'prodAprob' en los links
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const condicion = {[campo_id]: registro.id};
		BD_genericas.actualizaTodosPorCondicion("links", condicion, {prodAprob: true});

		// 3. Si es una colección, revisa si corresponde aprobar capítulos
		if (entidad == "colecciones") await this.capsAprobs(registro.id);

		// 4. Actualiza 'prodsEnRCLV' en sus RCLVs
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
	accionesPorCambioDeStatus: async (entidad, registro) => {
		// Variables
		const familias = comp.obtieneDesdeEntidad.familias(entidad);

		// prodsEnRCLV
		if (familias == "productos") {
			// Variables
			const prodAprob = aprobados_ids.includes(registro.statusRegistro_id);

			// Actualiza prodAprob en sus links
			if (registro.links && registro.links.length) {
				const campo_id = entidad == "colecciones" ? "grupoCol_id" : comp.obtieneDesdeEntidad.campo_id(entidad);
				await BD_genericas.actualizaTodosPorCondicion("links", {[campo_id]: registro.id}, {prodAprob});
			}

			// Rutina por entidad RCLV
			const entidadesRCLV = variables.entidades.rclvs;
			for (let entidadRCLV of entidadesRCLV) {
				const campo_id = comp.obtieneDesdeEntidad.campo_id(entidadRCLV);
				if (registro[campo_id] && registro[campo_id] != 1)
					prodAprob
						? BD_genericas.actualizaPorId(entidadRCLV, registro[campo_id], {prodsAprob: true})
						: comp.prodsEnRCLV({entidad: entidadRCLV, id: registro[campo_id]});
			}
		}

		// linksEnProds
		if (familias == "links") {
			// Obtiene los datos identificatorios del producto
			const prodEntidad = comp.obtieneDesdeCampo_id.entidadProd(registro);
			const campo_id = comp.obtieneDesdeCampo_id.campo_idProd(registro);
			const prodID = registro[campo_id];

			// Actualiza el producto
			await comp.linksEnProd({entidad: prodEntidad, id: prodID});
			if (prodEntidad == "capitulos") {
				const colID = await BD_genericas.obtienePorId("capitulos", prodID).then((n) => n.coleccion_id);
				comp.linksEnColec(colID);
			}
		}

		// Actualiza la variable de links vencidos
		await comp.linksVencPorSem.actualizaLVPS();

		// Fin
		return;
	},
	eliminar: {
		eliminaDependientes: async (entidad, id, original) => {
			// Variables
			const familias = comp.obtieneDesdeEntidad.familias(entidad);
			const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const carpeta = familias == "productos" ? "2-Productos" : "3-RCLVs";
			const condicion = entidad == "colecciones" ? {grupoCol_id: id} : {[campo_id]: id};

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

				// Particularidades para colección
				if (entidad == "colecciones") {
					await BD_genericas.eliminaTodosPorCondicion("capitulos", {coleccion_id: id}); // elimina sus capítulos
					await BD_genericas.eliminaTodosPorCondicion("capsSinLink", {coleccion_id: id}); // elimina su 'capSinLink'
				}
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
				FN.eliminaEdicionesVacias(ediciones, rclv_id);
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
				FN.siHayErroresBajaElStatus(prodsPorEnts);
			}

			// Espera a que concluyan las rutinas
			await Promise.all(espera);

			// Fin
			return;
		},
	},

	// Bloques a mostrar
	bloqueRegistro: async function (registro) {
		// Variable
		let resultado = [];

		// Datos CRUD
		resultado.push(
			!registro.altaRevisadaEn
				? {titulo: "Creado el", valor: comp.fechaHora.diaMesAno(registro.creadoEn)}
				: {titulo: "Ingresado el", valor: comp.fechaHora.diaMesAno(registro.altaRevisadaEn)}
		);

		// Status resumido
		resultado.push({titulo: "Status", ...FN.statusRegistro(registro)});

		// Si el registro está inactivo, le agrega el motivo
		if (registro.statusRegistro_id == inactivo_id) {
			const {entidad, id: entidad_id} = registro;
			const regComent = await BD_genericas.obtienePorCondicion("comentsInactivos", {entidad, entidad_id});
			const comentario = regComent ? regComent.comentario : "No disponemos del comentario";
			resultado.push({titulo: "Motivo", valor: comentario});
		}

		// Fin
		return resultado;
	},
	fichaDelUsuario: async (userID, petitFamilias) => {
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
		bloque.push(...FN.usuarioCalidad(usuario, petitFamilias));

		// Fin
		return bloque;
	},
};

// Funciones
let FN = {
	eliminaEdicionesVacias: async function (ediciones, campo_idRCLV) {
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
			await comp.puleEdicion(prodEntidad, original, edicion);
		}
		// Fin
		return;
	},
	siHayErroresBajaElStatus: (prodsPorEnts) => {
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
	},
	statusRegistro: (registro) => {
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
