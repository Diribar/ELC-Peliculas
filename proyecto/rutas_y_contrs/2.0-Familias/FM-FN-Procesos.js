"use strict";
const validacsFM = require("./FM-FN-Validar");

module.exports = {
	// CRUD
	obtieneDatosForm: async function (req) {
		// Variables
		const {baseUrl, ruta} = comp.reqBasePathUrl(req);
		const {entidad, id} = req.query;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const origen = req.query.origen;
		const userID = req.session && req.session.usuario ? req.session.usuario.id : null;
		let comentario;

		// Obtiene el tema y código
		const tema = baseUrl == "/revision" ? "revisionEnts" : "fmCrud";
		const codigo = this.codigo({ruta, familia});

		// Comentario para 'revisionInactivar'
		if (codigo == "revisionInactivar") {
			const ultHist = await baseDeDatos.obtienePorCondicionElUltimo(
				"statusHistorial",
				{entidad, entidad_id: id},
				"statusFinalEn"
			); // no debe filtrar por 'comentario not null', porque el de inactivar puede estar vacío
		}

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("statusRegistro", "creadoPor", "statusSugeridoPor", "altaRevisadaPor");
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		if (familia == "rclv") include.push(...variables.entidades.prods);
		let original = await baseDeDatos.obtienePorId(entidad, id, include);
		if (entidad == "capitulos") original.capitulos = await this.obtieneCapitulos(original.coleccion_id, original.temporada);

		// Cantidad de productos asociados al RCLV
		let cantProds, canonNombre, RCLVnombre, prodsDelRCLV;
		if (familia == "rclv") {
			prodsDelRCLV = await this.prodsDelRCLV(original, userID);
			cantProds = prodsDelRCLV.length;
			canonNombre = comp.canonNombre(original);
			RCLVnombre = original.nombre;
		}

		// Más variables
		const status_id = original.statusRegistro_id;
		const urlActual = req.originalUrl;
		const entsNombre = variables.entidades[petitFamilias + "Nombre"];
		const {titulo, entidadNombre} = this.titulo({entidad, codigo});
		const bloqueDer = await this.bloques.consolidado({tema, familia, entidad, original});
		const imgDerPers = this.obtieneAvatar(original).orig;
		const cartelGenerico = codigo != "historial";

		// Fin
		return {
			...{tema, codigo, titulo, origen},
			...{entidad, entidadNombre, familia, petitFamilias, id, registro: original, comentario},
			...{canonNombre, RCLVnombre, prodsDelRCLV, imgDerPers, bloqueDer, status_id, cantProds},
			...{entsNombre, urlActual, cartelGenerico},
		};
	},
	codigo: ({ruta, familia}) => {
		// Obtiene el código a partir de la familia
		let codigo = ruta.replaceAll("/", "");

		// Pule el código
		const esRevision = codigo.includes(familia);
		codigo = codigo.replace(familia, "");

		// Actualiza el código
		if (esRevision && ["inactivar", "recuperar"].includes(codigo)) codigo = "revision" + comp.letras.inicialMayus(codigo);

		// Fin - revisionInactivar - revisionRecuperar - recuperar - historial
		return codigo;
	},
	titulo: ({entidad, codigo}) => {
		// Variables
		const opcionesDeTitulo = {
			inactivar: "Inactivar",
			rechazar: "Rechazar",
			recuperar: "Recuperar",
			eliminar: "Eliminar",
			revisionInactivar: "Revisión de Inactivar",
			revisionRecuperar: "Revisión de Recuperar",
			historial: "Historial de",
		};
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

		// Título
		let titulo = opcionesDeTitulo[codigo] + " ";
		titulo += comp.obtieneDesdeEntidad.unaUn(entidad) + " ";
		titulo += entidadNombre;

		// Fin
		return {titulo, entidadNombre};
	},
	obtieneDatosGuardar: async function (req) {
		// Variables
		const {entidad, id, motivo_id, entDupl, idDupl} = {...req.query, ...req.body};
		let {comentario} = req.body;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const {ruta} = comp.reqBasePathUrl(req);
		const codigo = ruta.slice(1, -1); // 'inactivar' o 'recuperar'
		const userID = req.session.usuario.id;
		const ahora = comp.fechaHora.ahora();
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const include = comp.obtieneTodosLosCamposInclude(entidad);
		const original = await baseDeDatos.obtienePorId(entidad, id, include);
		const statusFinal_id = codigo == "inactivar" ? inactivar_id : recuperar_id;
		comentario = await this.comentario({entidad, id, motivo_id, entDupl, idDupl, comentario, statusFinal_id});

		// Fin
		return {entidad, id, familia, motivo_id, codigo, userID, ahora, campo_id, original, statusFinal_id, comentario};
	},
	comentario: async function (datos) {
		// Variables
		let comentario = null;

		// Si el motivo es 'duplicado', genera el comentario
		if (datos.motivo_id == motivoDupl_id) {
			// Variables
			const {entDupl, idDupl} = datos;
			const elLa = comp.obtieneDesdeEntidad.elLa(entDupl);
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entDupl).toLowerCase();
			comentario = "con " + elLa + " " + entidadNombre + " id " + idDupl;
			return comentario;
		}

		// Lo obtiene del formulario
		if (datos && datos.comentario) comentario = datos.comentario;

		// Si corresponde, lo obtiene del movimiento anterior
		if (!comentario) {
			const {comentNeces} = statusMotivos.find((n) => n.id == datos.motivo_id);
			if (!comentario && comentNeces && datos.statusFinal_id == inactivo_id && datos.ultHist && datos.ultHist.comentario)
				comentario = datos.ultHist.comentario;
		}

		// Fin
		if (comentario && comentario.endsWith(".")) comentario = comentario.slice(0, -1);
		return comentario;
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
			includesOrig = [...includesEdic, "creadoPor", "altaRevisadaPor", "statusSugeridoPor", "statusRegistro"];
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

			// Obtiene el historial de status
			let historialStatus = await baseDeDatos
				.obtieneTodosPorCondicion("statusHistorial", condics, include)
				.then((n) => n.sort((a, b) => a.statusFinalEn - b.statusFinalEn));

			// Agrega los registros anteriores al historial
			historialStatus = this.movimsAntsAlHist({prodRclv, historialStatus});

			// Completa el historial
			historialStatus = this.revisaElHist(historialStatus);

			// Procesa los comentarios
			historialStatus = historialStatus.map((n) => {
				const correspondeMotivo = [inactivar_id, inactivo_id].includes(n.statusFinal_id);
				return {
					...n,
					comentario:
						(n.motivo && correspondeMotivo ? n.motivo.descripcion : "") +
						(n.comentario ? (correspondeMotivo ? ": " : "") + n.comentario : ""),
				};
			});

			// Fin
			return this.formato(historialStatus);
		},
		movimsAntsAlHist: ({prodRclv, historialStatus}) => {
			// Variables
			const {
				entidad,
				id: entidad_id,
				creadoPor_id,
				creadoEn,
				altaRevisadaEn,
				altaTermEn,
				statusSugeridoEn,
				statusRegistro_id,
			} = prodRclv;
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			let statusOriginal_id, regHistorial;

			// Agrega el primer registro con status 'creado_id'
			let statusFinal_id = creado_id;
			let statusFinal = {nombre: "Creado", codigo: "creado"};
			let statusFinalPor_id = creadoPor_id;
			let statusFinalEn = creadoEn;
			historialStatus.unshift({statusFinal_id, statusFinal, statusFinalPor_id, statusFinalEn});

			// Acciones para el status posterior a 'creado_id'
			if (
				statusRegistro_id > creado_id &&
				(historialStatus.length == 1 || historialStatus[1].statusOriginal_id != creado_id) // no hay registro siguiente (ej: porque se eliminó c/feedback a usuarios) o sí existe y comienza con un status distinto a como termina el anterior
			) {
				statusOriginal_id = creado_id;
				statusFinal_id =
					altaRevisadaEn.getTime() >= statusSugeridoEn.getTime() // si la fecha de revisión es mayor o igual que la sugerida => statusRegistro_id; debería ser 'igual', pero originalmente la revisión no impacta en la de sugerido
						? statusRegistro_id
						: altaTermEn // si se terminó de revisar, es porque fue aprobado
						? familia == "producto"
							? creadoAprob_id
							: aprobado_id
						: historialStatus.length > 1
						? historialStatus[1].statusOriginal_id // si el historial tiene un registro siguiente, ese registro
						: statusRegistro_id; // de lo contrario, el status del producto

				// Si el movimiento ya corresponde al historial, interrumpe la función
				if (statusFinal_id > aprobado_id) return historialStatus;
				// Si el siguiente registro en el historial no continúa del anterior, agrega el movimiento al historial
				else {
					statusFinalEn = altaRevisadaEn;
					statusFinal = FN.statusFinal(statusFinal_id);
					regHistorial = {entidad, entidad_id, statusOriginal_id, statusFinal_id, statusFinalEn, statusFinal};
					historialStatus.splice(1, 0, regHistorial);
				}
			}

			// Acciones para el status posterior a 'creadoAprob_id'
			if (
				statusRegistro_id > creadoAprob_id &&
				historialStatus.length >= 2 && // existen por lo menos dos registros
				historialStatus[1].statusFinal_id == creadoAprob_id // el registro anterior terminó en 'creadoAprob_id'
			) {
				// Si el movimiento ya corresponde al historial, interrumpe la función
				statusFinal_id = altaTermEn ? aprobado_id : inactivar_id;
				if (statusFinal_id > aprobado_id) return historialStatus;

				// Averigua el 'statusFinalEn'
				statusFinalEn = altaTermEn
					? altaTermEn // si se completó el alta, esa fecha
					: historialStatus.length > 2
					? historialStatus[2].statusOriginalEn // si el historial tiene un registro siguiente, ese registro
					: statusSugeridoEn; // de lo contrario, el status del producto

				// Agrega el registro al historial
				statusOriginal_id = creadoAprob_id;
				statusFinal = FN.statusFinal(statusFinal_id);
				regHistorial = {entidad, entidad_id, statusOriginal_id, statusFinal_id, statusFinalEn, statusFinal};
				historialStatus.splice(2, 0, regHistorial);
			}

			// Fin
			return historialStatus;
		},
		revisaElHist: (historialStatus) => {
			// Variables

			// Revisa de a uno el historial, asumiendo que no hay errores
			let contador = 1;
			while (contador <= historialStatus.length - 1) {
				// Variables
				const anterior = historialStatus[contador - 1];
				const siguiente = historialStatus[contador];

				//
				if (anterior.statusFinal_id != siguiente.statusOriginal_id) {
					// Genera los datos
					const actual = {
						statusOriginal_id: anterior.statusFinal_id,
						statusFinal_id: siguiente.statusOriginal_id,
						statusFinalEn: siguiente.statusOriginalEn,
						statusFinal: FN.statusFinal(siguiente.statusOriginal_id),
					};

					// Agrega el registro
					historialStatus.splice(contador, 0, actual);
				}
				contador++;
				if (contador == 10) break;
			}

			// Fin
			return historialStatus;
		},
		formato: (historialStatus) => {
			historialStatus.forEach((reg, i) => {
				// Variables
				const {statusFinalEn} = reg;
				let fecha;
				if (statusFinalEn) {
					const dia = statusFinalEn.getDate();
					const mes = statusFinalEn.getMonth() + 1;
					const ano = String(statusFinalEn.getFullYear()).slice(-2);
					const fechaDelAno = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes);
					const fechaNombre = fechaDelAno.nombre;
					fecha = fechaNombre + "/" + ano;
				}
				const statusCodigo = reg.statusFinal.codigo;
				const statusNombre = reg.statusFinal.nombre;
				const {comentario} = reg;
				historialStatus[i] = {statusCodigo, statusNombre, fecha, comentario};
			});

			// Fin
			return historialStatus;
		},
	},
	statusAlineado: async function ({entidad, id, prodRclv}) {
		// Obtiene el 'prodRclv'
		if (!prodRclv) {
			let include = ["statusRegistro"]; // se necesita para la vista de 'cambiarStatus'
			if (entidad == "capitulos") include.push("coleccion");
			if (entidad == "colecciones") include.push("capitulos");
			prodRclv = await baseDeDatos.obtienePorId(entidad, id, include);
		} else id = prodRclv.id;
		const {statusRegistro_id} = prodRclv;

		// Obtiene el 'ultHist'
		const ultHist = await this.obtieneUltHist(entidad, id);
		const statusFinal_id = ultHist ? ultHist.statusFinal_id : null;

		// Compara los status
		const statusAlineado =
			(statusRegistro_id == creado_id && !ultHist) || // creado
			(aprobados_ids.includes(statusRegistro_id) && (!ultHist || aprobados_ids.includes(statusFinal_id))) || // creadoAprob, aprobado
			([...inacRecup_ids, inactivo_id].includes(statusRegistro_id) && statusRegistro_id == statusFinal_id); // inactivar, recuperar, inactivo

		// Fin
		return {statusAlineado, prodRclv, ultHist};
	},
	obtieneUltHist: async (entidad, entidad_id) => {
		// Obtiene el 'ultHist'
		const condicion = {
			entidad,
			entidad_id,
			[Op.or]: {statusOriginal_id: {[Op.gt]: aprobado_id}, statusFinal_id: {[Op.gt]: aprobado_id}},
		};
		const ultHist = await baseDeDatos.obtienePorCondicionElUltimo("statusHistorial", condicion, "statusFinalEn");

		// Fin
		return ultHist;
	},
	prodsDelRCLV: async function (RCLV, userID) {
		// Variables
		const pppRegs = userID ? await baseDeDatos.obtieneTodosPorCondicion("pppRegistros", {usuario_id: userID}, "detalle") : [];
		for (let entidad of variables.entidades.prods) if (!RCLV[entidad]) RCLV[entidad] = [];

		// Convierte en productos, a las ediciones propias de productos, con 'campo_id' vinculado al RCLV,
		if (userID && RCLV.prodsEdiciones) {
			// Obtiene las ediciones propias
			const edicionesPropias = RCLV.prodsEdiciones.filter((n) => n.editadoPor_id == userID);

			// Obtiene los productos de las ediciones propias
			if (edicionesPropias.length)
				for (let edicion of edicionesPropias) {
					// Obtiene la entidad con la que está asociada la edición del RCLV, y su campo 'producto_id'
					let entProd = comp.obtieneDesdeCampo_id.entidadProd(edicion);
					let campo_id = comp.obtieneDesdeEntidad.campo_id(entProd);
					let entID = edicion[campo_id];

					// Obtiene los registros del producto original y su edición por el usuario
					let [prodOrig, prodEdic] = await this.obtieneOriginalEdicion({entidad: entProd, entID, userID});

					// Actualiza la variable del registro original
					let producto = {...prodOrig, ...prodEdic, id: prodOrig.id};

					// Fin
					RCLV[entProd].push(producto);
				}
		}

		// Completa la información de cada tipo de producto y une los productos en una sola array
		let prodsDelRCLV = [];
		for (let entidad of variables.entidades.prods) {
			// Completa la información de cada producto dentro del tipo de producto
			const prodsPorEnt = RCLV[entidad].map((registro) => {
				// Causas para descartar el registro
				if (inactivos_ids.includes(registro.statusRegistro_id)) return null; // status inactivar o inactivo
				if (registro.statusRegistro_id == creado_id && registro.creadoPor_id != userID) return null; // status creado
				if (registro.statusRegistro_id == recuperar_id && registro.statusSugeridoPor_id != userID) return null; // status recuperar

				// Variables
				const avatar = this.obtieneAvatar(registro).edic;
				const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
				const pppReg = pppRegs.find((n) => n.entidad == entidad && n.entidad_id == registro.id);
				const ppp = pppReg ? pppReg.detalle : pppOpcsObj.sinPref;

				// Agrega la entidad, el avatar, y el nombre de la entidad
				return {...registro, entidad, avatar, entidadNombre, ppp};
			});

			// Consolida la información
			prodsDelRCLV.push(...prodsPorEnt);
		}

		// Descarta los productos eliminados
		prodsDelRCLV = prodsDelRCLV.filter((n) => !!n);

		// Separa entre capitulos y resto
		let capitulos = prodsDelRCLV.filter((n) => n.entidad == "capitulos");
		let noCapitulos = prodsDelRCLV.filter((n) => n.entidad != "capitulos");

		// Elimina capitulos si las colecciones están presentes
		let colecciones = prodsDelRCLV.filter((n) => n.entidad == "colecciones");
		let coleccionesId = colecciones.map((n) => n.id);
		capitulos = capitulos.filter((n) => !coleccionesId.find((m) => m == n.coleccion_id));

		// Operaciones varias
		prodsDelRCLV = [...capitulos, ...noCapitulos]; // consolida los productos
		if (prodsDelRCLV.length) {
			for (let prod of prodsDelRCLV)
				if (prod.direccion.includes(",")) {
					prod.direccion = prod.direccion.split(", ");
					prod.direccion.splice(2);
					prod.direccion = prod.direccion.join(", ");
				}
			prodsDelRCLV.sort((a, b) => b.anoEstreno - a.anoEstreno); // Ordena por año (decreciente)
			prodsDelRCLV = prodsDelRCLV.filter((n) => n.statusRegistro_id != inactivo_id); // Quita los inactivos
		}

		// Fin
		return prodsDelRCLV;
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
			if (registro.statusRegistro_id == inactivo_id) resultado.push(await FN.obtieneMotivoDetalle(registro));

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

		// Fin
		return {codigo, valor: nombre};
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
	obtieneMotivoDetalle: async (registro) => {
		// Variables
		const {entidad, id: entidad_id} = registro;
		const condicion = {entidad, entidad_id, statusFinal_id: inactivo_id};

		// Obtiene el motivo del último statusHistorial
		const statusHistorial = await baseDeDatos.obtienePorCondicionElUltimo("statusHistorial", condicion, "statusFinalEn");
		const motivo =
			statusHistorial && statusHistorial.motivo_id ? statusMotivos.find((n) => n.id == statusHistorial.motivo_id) : null;
		const motivoDetalle = motivo ? motivo.descripcion : null;

		// Fin
		return {motivoDetalle};
	},
	statusFinal: (statusFinal_id) => {
		const {nombre} = statusRegistros.find((n) => n.id == statusFinal_id);
		const {codigo} = statusRegistros.find((n) => n.id == statusFinal_id);
		return {nombre, codigo};
	},
};
