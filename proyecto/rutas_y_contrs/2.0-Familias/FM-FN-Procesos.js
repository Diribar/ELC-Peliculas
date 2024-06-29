"use strict";
const validacsFM = require("./FM-FN-Validar");

// Exportar ------------------------------------
module.exports = {
	// CRUD
	obtieneDatosForm: async function (req) {
		// Tema
		const {baseUrl, ruta} = comp.reqBasePathUrl(req);
		const tema = baseUrl == "/revision" ? "revisionEnts" : "fmCrud";
		const codigo = ruta.slice(1, -1).replace("revision/", "");

		// Más variables
		const {entidad, id} = req.query;
		const origen = req.query.origen;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const userID = req.session.usuario.id;

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("statusRegistro", "creadoPor", "statusSugeridoPor", "altaRevisadaPor", "motivo");
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		if (familia == "rclv") include.push(...variables.entidades.prods);
		let original = await baseDeDatos.obtienePorId(entidad, id, include);
		if (entidad == "capitulos") original.capitulos = await this.obtieneCapitulos(original.coleccion_id, original.temporada);

		// Cantidad de productos asociados al RCLV
		let cantProds, canonNombre, RCLVnombre, prodsDelRCLV;
		if (familia == "rclv") {
			prodsDelRCLV = await procsRCLV.detalle.prodsDelRCLV(original, userID);
			cantProds = prodsDelRCLV.length;
			canonNombre = comp.canonNombre(original);
			RCLVnombre = original.nombre;
		}

		// Obtiene datos para la vista
		const status_id = original.statusRegistro_id;
		const urlActual = req.originalUrl;
		const entsNombre = variables.entidades[petitFamilias + "Nombre"];
		const {titulo, entidadNombre} = this.titulo({entidad, codigo});
		const bloqueDer = await this.bloques.consolidado({tema, familia, entidad, original});
		const imgDerPers = this.obtieneAvatar(original).orig;
		const cartelGenerico = true;

		// Fin
		return {
			...{tema, codigo, titulo, origen},
			...{entidad, entidadNombre, familia, petitFamilias, id, registro: original},
			...{canonNombre, RCLVnombre, prodsDelRCLV, imgDerPers, bloqueDer, status_id, cantProds},
			...{entsNombre, urlActual, cartelGenerico},
		};
	},
	obtieneDatosGuardar: async (req) => {
		const {entidad, id, motivo_id} = {...req.query, ...req.body};
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const {ruta} = comp.reqBasePathUrl(req);
		const codigo = ruta.slice(1, -1); // 'inactivar' o 'recuperar'
		const userID = req.session.usuario.id;
		const ahora = comp.fechaHora.ahora();
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const include = comp.obtieneTodosLosCamposInclude(entidad);
		const original = await baseDeDatos.obtienePorId(entidad, id, include);
		const statusFinal_id = codigo == "inactivar" ? inactivar_id : recuperar_id;

		// Fin
		return {entidad, id, familia, motivo_id, codigo, userID, ahora, campo_id, original, statusFinal_id};
	},
	obtieneOriginalEdicion: async ({entidad, entID, userID, excluirInclude, omitirPulirEdic}) => {
		// Variables
		const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const condEdic = {[campo_id]: entID, editadoPor_id: userID};
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const includesEdic = !excluirInclude ? comp.obtieneTodosLosCamposInclude(entidad) : null;

		// Obtiene los campos include
		let includesOrig;
		if (!excluirInclude) {
			includesOrig = [...includesEdic, "creadoPor", "altaRevisadaPor", "statusSugeridoPor", "statusRegistro", "motivo"];
			if (entidad == "capitulos") includesOrig.push("coleccion");
			if (entidad == "colecciones") includesOrig.push("capitulos");
			if (familia == "rclv") includesOrig.push("prodsEdiciones", ...variables.entidades.prods);
		}

		// Obtiene el registro original con sus includes
		let original = baseDeDatos.obtienePorId(entidad, entID, includesOrig);
		let edicion = userID ? baseDeDatos.obtienePorCondicion(entidadEdic, condEdic, includesEdic) : null;
		[original, edicion] = await Promise.all([original, edicion]);

		// Le quita al original los campos sin contenido
		for (let prop in original) if (original[prop] === null) delete original[prop];

		// Pule la edición
		edicion = edicion
			? omitirPulirEdic
				? edicion
				: await comp.puleEdicion(entidad, original, edicion) // El output puede ser 'null'
			: {}; // Debe ser un objeto, porque más adelante se lo trata como tal

		// Si es una colección, pule la cantidad de capítulos
		if (entidad == "colecciones" && original.capitulos)
			original.capitulos = original.capitulos.filter((n) => activos_ids.includes(n.statusRegistro_id));

		// Acciones si es un capítulo
		if (entidad == "capitulos" && userID) {
			// Variables
			const condColec = {coleccion_id: original.coleccion_id, editadoPor_id: userID};
			const edicColec = await baseDeDatos.obtienePorCondicion("prodsEdicion", condColec);
			if (!edicColec) return [original, edicion];

			// Si el 'nombreCastellano' de la colección está editado, lo actualiza en la variable 'original'
			if (original.coleccion && edicColec.nombreCastellano)
				original.coleccion.nombreCastellano = edicColec.nombreCastellano;

			// Si es un producto, reemplaza los campos vacíos del original y la edición
			if (familia == "producto") {
				const camposEditables = [...variables.camposDD, ...variables.camposDA];
				for (let campo of camposEditables) {
					const {nombre} = campo;
					if (
						(edicColec[nombre] != null && original[nombre] == null && (!edicion || edicion[nombre] == null)) || // sólo 'edicColec' tiene un valor; 'null' y 'undefined' son equivalentes con el '=='
						(campo.rclv && edicColec[nombre] > 10 && original[nombre] == 1 && !edicion[nombre]) // es un rclv y sólo 'edicColec' tiene un valor significativo
					)
						edicion = {...edicion, [nombre]: edicColec[nombre]};
				}
			}
		}

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
			if (edicion.id) await baseDeDatos.actualizaPorId(entidadEdic, edicion.id, edicion);
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
				await baseDeDatos.agregaRegistro(entidadEdic, edicion);
			}
		}

		// Fin
		return edicion;
	},
	historialDeStatus: {
		obtiene: async function (prodRclv) {
			// Variables
			const {entidad, id: entidad_id, creadoPor_id, creadoEn} = prodRclv;
			const condics = {entidad, entidad_id};
			const include = ["statusOriginal", "statusFinal", "motivo"];
			const ordenMovs = [
				{stOrig_id: 1, stFinal_id: 6},
				{stOrig_id: 4, stFinal_id: 6},
				{stOrig_id: 6, stFinal_id: 5},
			];

			// Obtiene el historial de status
			let historialStatus = await baseDeDatos.obtieneTodosPorCondicion("histStatus", condics, include);
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
				statusFinal: {nombre: "Creado", codigo: "creado"},
				statusFinalPor_id: creadoPor_id,
				statusFinalEn: creadoEn,
			});

			// Completa el historial - rutina para los siguientes
			let contador = 0;
			while (contador < historialStatus.length) {
				historialStatus = await this.agregaUnMov({historialStatus, prodRclv, contador});
				contador++;
			}

			// Procesa los comentarios
			historialStatus = historialStatus.map((n) => ({
				...n,
				comentario: n.comentario ? n.comentario : n.motivo ? n.motivo.descripcion : "",
			}));

			// Fin
			return this.formato(historialStatus);
		},
		agregaUnMov: async ({historialStatus, prodRclv, contador}) => {
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
			if (statusAct == inactivar_id) statusFinal_id = statusSig != aprobado_id ? inactivo_id : aprobado_id;
			if (statusAct == inactivo_id) statusFinal_id = recuperar_id;
			if (statusAct == recuperar_id) statusFinal_id = statusSig != inactivo_id ? aprobado_id : inactivo_id;

			// Agrega el nombre del statusFinal
			if (!statusFinal_id) return historialStatus;
			const {nombre} = statusRegistros.find((n) => n.id == statusFinal_id);
			const {codigo} = statusRegistros.find((n) => n.id == statusFinal_id);
			statusFinal = {nombre, codigo};

			// Agrega 'statusFinalPor_id' y 'statusFinalEn'
			if (statusFinal_id == statusSig && !statusFinalPor_id)
				statusFinalPor_id = buscarDelProdRCLV
					? statusSugeridoPor_id // del producto
					: historialStatus[contador + 1].statusOriginalPor_id; // del siguiente registro
			if (statusFinal_id == statusSig && !statusFinalEn)
				statusFinalEn = buscarDelProdRCLV
					? statusSugeridoEn // del producto
					: historialStatus[contador + 1].statusOriginalEn; // del siguiente producto

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
				await baseDeDatos.agregaRegistro("histStatus", sigReg);

			// Procesa el comentario
			if (statusFinal_id == inactivar_id) comentario = motivo.descripcion;
			if (comentario) sigReg.comentario = comentario;

			// Agrega el registro al historial
			historialStatus.splice(contador + 1, 0, sigReg);

			// Fin
			return historialStatus;
		},
		formato: (historialStatus) => {
			historialStatus.forEach((reg, i) => {
				// Variables
				const {statusFinalEn} = reg;
				const statusCodigo = reg.statusFinal.codigo;
				const dia = statusFinalEn.getDate();
				const mes = statusFinalEn.getMonth() + 1;
				const ano = String(statusFinalEn.getFullYear()).slice(-2);
				const fechaDelAno = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes);
				const fechaNombre = fechaDelAno.nombre;
				const fecha = fechaNombre + "/" + ano;
				const statusNombre = reg.statusFinal.nombre;
				const comentario = reg.comentario ? " - " + reg.comentario : "";
				historialStatus[i] = {statusCodigo, fecha, statusNombre, comentario};
			});

			// Fin
			return historialStatus;
		},
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
	obtieneCapitulos: async (coleccion_id, temporada) => {
		// Obtiene registros
		const condicion = {coleccion_id, temporada, statusRegistro_id: activos_ids};
		const registros = await baseDeDatos
			.obtieneTodosPorCondicion("capitulos", condicion)
			.then((n) => n.sort((a, b) => a.capitulo - b.capitulo))
			.then((n) =>
				n.map((m) => {
					const nombre = m.nombreCastellano ? m.nombreCastellano : m.nombreOriginal;
					return {id: m.id, numero: m.capitulo, nombre};
				})
			);

		// Fin
		return registros;
	},
	titulo: ({entidad, codigo}) => {
		// Variables
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

		// Título
		let titulo = codigo == "inactivar" ? "Inactivar" : "Rechazar";
		titulo += " " + comp.obtieneDesdeEntidad.unaUn(entidad) + " ";
		titulo += entidadNombre;

		// Fin
		return {titulo, entidadNombre};
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
		const condicColec = {coleccion_id: original.id}; // que pertenezca a la colección
		const condicCampoVacio = {...condicColec, [campo]: {[Op.or]: [null, ""]}}; // que además el campo esté vacío
		if (original[campo]) condicCampoVacio[campo][Op.or].push(original[campo]); // o que coincida con el valor original

		// 2. Actualización condicional por campo
		const cond1 = campo == "tipoActuacion_id";
		const cond21 = variables.entidades.rclvs_id.includes(campo);
		const cond22 = cond21 && edicion[campo] != 2; // particularidad para rclv_id
		const cond31 = campo == "epocaOcurrencia_id";
		const cond32 = cond31 && edicion.epocaOcurrencia_id != epocasVarias.id; // Particularidad para epocaOcurrencia_id
		const novedad = {[campo]: edicion[campo]};
		if (cond1 || cond22 || cond32) await baseDeDatos.actualizaTodosPorCondicion("capitulos", condicColec, novedad);

		// 3. Actualización condicional por valores
		if (!cond1 && !cond21 && !cond31) await baseDeDatos.actualizaTodosPorCondicion("capitulos", condicCampoVacio, novedad);

		// Fin
		return true;
	},
	elimina: {
		demasEdiciones: async ({entidad, original, id}) => {
			// Revisa cada registro de edición y decide si corresponde:
			// - Eliminar el registro
			// - Elimina el valor del campo

			// Variables
			const nombreEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const condicion = {[campo_id]: id};
			const ediciones = await baseDeDatos.obtieneTodosPorCondicion(nombreEdic, condicion);

			// Acciones si existen ediciones
			if (ediciones.length) {
				let espera = [];
				for (let edic of ediciones) espera.push(comp.puleEdicion(entidad, original, edic));
				await Promise.all(espera);
			}

			// Fin
			return;
		},
		dependientes: async (entidad, id, original) => {
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
			const ediciones = await baseDeDatos.obtieneTodosPorCondicion(entidadEdic, condicion);
			if (ediciones.length) {
				// Elimina el archivo avatar de las ediciones
				for (let edicion of ediciones)
					if (edicion.avatar) comp.gestionArchivos.elimina(carpetaExterna + carpeta + "/Revisar", edicion.avatar);

				// Elimina las ediciones
				await baseDeDatos.eliminaTodosPorCondicion(entidadEdic, condicion);
			}

			// Productos
			if (familias == "productos") {
				// Elimina los links
				await baseDeDatos.eliminaTodosPorCondicion("linksEdicion", condicion);
				await baseDeDatos.eliminaTodosPorCondicion("links", condicion);

				// Particularidades para colección
				if (entidad == "colecciones") {
					await baseDeDatos.eliminaTodosPorCondicion("capitulos", {coleccion_id: id}); // elimina sus capítulos
					await baseDeDatos.eliminaTodosPorCondicion("capsSinLink", {coleccion_id: id}); // elimina su 'capSinLink'
				}
			}

			// Fin
			return true;
		},
		vinculoEdicsProds: async ({entidadRCLV, rclvID}) => {
			// Variables
			const rclv_id = comp.obtieneDesdeEntidad.campo_id(entidadRCLV);

			// Averigua si existen ediciones
			const ediciones = await baseDeDatos.obtieneTodosPorCondicion("prodsEdicion", {[rclv_id]: rclvID});
			if (ediciones.length) {
				// Les borra el vínculo
				await baseDeDatos.actualizaTodosPorCondicion("prodsEdicion", {[rclv_id]: rclvID}, {[rclv_id]: null});

				// Revisa si tiene que eliminar alguna edición - la rutina no necesita este resultado
				FN.eliminaEdicionesVacias(ediciones, rclv_id);
			}

			// Fin
			return;
		},
		vinculoProds: async ({entidadRCLV, rclvID}) => {
			// Variables
			const campo_idRCLV = comp.obtieneDesdeEntidad.campo_id(entidadRCLV);
			const entidades = variables.entidades.prods;
			let prodsPorEnts = [];
			let prods = [];
			let espera = [];

			// Obtiene los productos vinculados al RCLV, en cada entidad
			for (let entidad of entidades)
				prodsPorEnts.push(
					baseDeDatos
						.obtieneTodosPorCondicion(entidad, {[campo_idRCLV]: rclvID})
						.then((n) => n.map((m) => ({...m, [campo_id]: 1})))
				);
			prodsPorEnts = await Promise.all(prodsPorEnts);
			for (let prodsPorEnt of prodsPorEnts) prods.push(...prodsPorEnt);

			// Averigua si existían productos vinculados al RCLV
			if (prods.length) {
				// Les actualiza el campo_idRCLV al valor 'Ninguno'
				for (let entidad of entidades)
					espera.push(baseDeDatos.actualizaTodosPorCondicion(entidad, {[campo_id]: rclvID}, {[campo_id]: 1}));

				//Revisa si se le debe cambiar el status a algún producto - la rutina no necesita este resultado
				validacsFM.siHayErroresBajaElStatus(prodsPorEnts);
			}

			// Espera a que concluyan las rutinas
			await Promise.all(espera);

			// Fin
			return;
		},
	},

	// Bloques a mostrar
	bloques: {
		consolidado: async function ({tema, familia, entidad, original}) {
			return tema == "revisionEnts"
				? {
						registro: await this.registro({...original, entidad}),
						usuario: await this.usuario(original.statusSugeridoPor_id, entidad),
				  }
				: familia == "producto"
				? {producto: true, registro: await this.registro({...original, entidad})}
				: familia == "rclv"
				? {rclv: this.rclv({...original, entidad}), registro: await this.registro({...original, entidad})}
				: {};
		},
		registro: async (registro) => {
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
				const comentario = await FN.comentarioBR(registro);
				resultado.push({comentario});
			}

			// Fin
			return resultado;
		},
		rclv: (registro) => {
			// Variables
			let bloque = [];

			// Información
			bloque.push({titulo: "Nombre", valor: registro.nombre});
			if (registro.nombreAltern) {
				const articulo = comp.obtieneDesdeEntidad.oa(registro.entidad);
				bloque.push({titulo: "También conocid" + articulo + " como", valor: registro.nombreAltern});
			}
			if (registro.fechaDelAno && registro.fechaDelAno.id < 400) {
				// Puede ser cualquier familia RCLV
				const articulo = comp.letras.laLo(registro);
				bloque.push({titulo: "Se " + articulo + " recuerda el", valor: registro.fechaDelAno.nombre});
			}

			// Particularidades para personajes
			if (registro.entidad == "personajes") {
				if (registro.anoNacim) bloque.push({titulo: "Año de nacimiento", valor: registro.anoNacim});
				if (registro.canon_id && registro.canon_id != "NN" && registro.canon && registro.canon[registro.genero_id])
					bloque.push({titulo: "Status Canoniz.", valor: registro.canon[registro.genero_id]});
				if (registro.rolIglesia_id && registro.rolIglesia_id != "NN" && registro.rolIglesia)
					bloque.push({titulo: "Rol en la Iglesia", valor: registro.rolIglesia[registro.genero_id]});
				if (registro.apMar_id && registro.apMar_id != 10 && registro.apMar)
					bloque.push({titulo: "Aparición Mariana", valor: registro.apMar.nombre});
			}

			// Particularidades para hechos
			if (registro.entidad == "hechos") {
				if (registro.anoComienzo) bloque.push({titulo: "Año", valor: registro.anoComienzo});
				if (registro.ama) bloque.push({valor: "Es una aparición mariana"});
			}

			// Fin
			return bloque;
		},
		usuario: async (userID, entidad) => {
			// Variables
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
			const ahora = comp.fechaHora.ahora();
			const usuario = await baseDeDatos.obtienePorId("usuarios", userID);
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
			const original = await baseDeDatos.obtienePorId(prodEntidad, prodID);

			// Elimina la edición si está vacía
			delete edicion[campo_idRCLV];
			await comp.puleEdicion(prodEntidad, original, edicion);
		}
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
	comentarioBR: async (registro) => {
		// Variables
		const {entidad, id: entidad_id} = registro;
		let comentario;

		// Actualiza el comentario - histStatus
		if (registro.motivo.agregarComent) {
			const condicion = {
				entidad,
				entidad_id,
				statusFinal_id: [inactivar_id, inactivo_id],
				comentario: {[Op.ne]: null},
			};
			let histStatus = await baseDeDatos.obtieneTodosPorCondicion("histStatus", condicion);
			if (histStatus.length > 1)
				histStatus.sort((a, b) => (a.statusFinalEn < b.statusFinalEn ? -1 : a.statusFinalEn > b.statusFinalEn ? 1 : 0));
			if (histStatus.length) comentario = histStatus.slice(-1)[0].comentario;
		}

		// Actualiza el comentario - motivo
		if (!comentario) comentario = registro.motivo.descripcion;

		// Fin
		return comentario;
	},
};
