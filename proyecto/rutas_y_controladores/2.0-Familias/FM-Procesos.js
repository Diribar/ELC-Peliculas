"use strict";
// Variables
const validaPR = require("../2.1-Prods-RUD/PR-FN-Validar");

// Exportar ------------------------------------
module.exports = {
	// Procesos CRUD
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

		// Obtiene el registro original con sus includes y le quita los campos sin contenido
		let original = BD_genericas.obtienePorIdConInclude(entidad, entID, includesOrig);
		let edicion = userID ? BD_genericas.obtienePorCondicionConInclude(entidadEdic, condicionEdic, includesEdic) : "";
		[original, edicion] = await Promise.all([original, edicion]);
		if (includesOrig.includes("capitulos"))
			original.capitulos = original.capitulos.filter((n) => activos_ids.includes(n.statusRegistro_id));
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
			if (!edicion.id) {
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
	obtieneDatos: async function (req) {
		// Variables
		const {ruta} = comp.reqBasePathUrl(req);
		let codigo = ruta.slice(1, -1); // 'inactivar' o 'recuperar'
		if (codigo.split("/").length > 2) codigo = codigo.slice(codigo.indexOf("/") + 1); // códigos posibles: 'rechazar', 'inactivar-o-recuperar'
		const inacRecups = codigo == "inactivar-o-recuperar";
		const ahora = comp.fechaHora.ahora();

		// Variables
		const {entidad, id, desaprueba} = req.query;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const rclv = familia == "rclv";

		// Obtiene el registro original y el subcodigo
		let include = comp.obtieneTodosLosCamposInclude(entidad);
		if (familia == "producto") include.push("links");
		const original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
		const statusOriginal_id = original.statusRegistro_id;

		// Obtiene el 'subcodigo'
		const subcodigo = inacRecups
			? statusOriginal_id == inactivar_id
				? "inactivar"
				: "recuperar"
			: ruta.endsWith("/alta/")
			? "alta"
			: "rechazar";

		// Averigua si la sugerencia fue aprobada
		const aprob = subcodigo != "rechazar" && !desaprueba;

		// Obtiene el status final
		const adicionales = {publico: true, epocaOcurrencia: true};
		const statusFinal_id =
			codigo == "inactivar"
				? inactivar_id
				: codigo == "recuperar"
				? recuperar_id
				: (!aprob && subcodigo != "inactivar") || (aprob && subcodigo == "inactivar") // si es un rechazo, un recuperar desaprobado, o un inactivar aprobado
				? inactivo_id
				: rclv // demás casos: un alta, un recuperar aprobado, o un inactivar desaprobado
				? aprobado_id // si es un RCLV, se aprueba
				: (await validaPR.consolidado({datos: {entidad, ...original, ...adicionales}}).then((n) => n.impideAprobado)) // si es un producto, se revisa si tiene errores
				? creadoAprob_id
				: entidad == "capitulos"
				? original.statusColeccion_id // si es un capítulo y fue aprobado, toma el status de su colección
				: aprobado_id;

		// Obtiene el motivo_id
		const motivo_id =
			subcodigo == "rechazar" ? req.body.motivo_id : statusFinal_id == inactivo_id ? original.motivo_id : null;

		// Obtiene el comentario
		let comentario = "";
		if (req.body.comentario) comentario = req.body.comentario;
		else {
			const condicion = {entidad, entidad_id: id};
			comentario = await BD_genericas.obtienePorCondicionElUltimo("histStatus", condicion)
				.then((n) => (n ? n : {comentario: "Motivo no comentado"})) // sería un error que hubiera algún motivo no comentado
				.then((n) => n.comentario);
		}
		if (comentario.endsWith(".")) comentario = comentario.slice(0, -1);

		// Fin
		return {
			...{original, statusOriginal_id, statusFinal_id},
			...{codigo, subcodigo, rclv, motivo_id, comentario, aprob},
		};
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

		// Si el registro no está activo, le agrega el comentario
		if (!activos_ids.includes(registro.statusRegistro_id)) {
			// Obtiene el motivo
			let valor = registro.motivo.descripcion;
			if (motivosStatusConComentario_ids.includes(registro.motivo_id)) {
				const condicion = {entidad: registro.entidad, entidad_id: registro.id};
				valor = await BD_genericas.obtienePorCondicionElUltimo("histStatus", condicion)
					.then((n) => (n ? n : {comentario: registro.motivo.descripcion}))
					.then((n) => n.comentario);
			}

			// Le agrega el motivo
			resultado.push({titulo: "Motivo", valor});
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
