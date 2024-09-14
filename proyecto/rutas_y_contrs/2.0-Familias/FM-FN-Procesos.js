"use strict";
const validacsFM = require("./FM-FN-Validar");

module.exports = {
	// Header
	quickSearch: {
		condicion: (palabras, campos, usuario_id, original) => {
			// Variables
			let todasLasPalabrasEnAlgunCampo = [];

			// Convierte las palabras en un array
			palabras = palabras.split(" ");

			// Rutina para cada campo
			for (let campo of campos) {
				// Variables
				let palabrasEnElCampo = [];

				// Dónde debe buscar cada palabra dentro del campo
				for (let palabra of palabras) {
					const palabraEnElCampo = {
						[Op.or]: [
							{[campo]: {[Op.like]: palabra + "%"}}, // En el comienzo del texto
							{[campo]: {[Op.like]: "% " + palabra + "%"}}, // En el comienzo de una palabra
						],
					};
					palabrasEnElCampo.push(palabraEnElCampo);
				}

				// Exige que cada palabra del conjunto esté presente
				const todasLasPalabrasEnElCampo = {[Op.and]: palabrasEnElCampo};

				// Consolida el resultado
				todasLasPalabrasEnAlgunCampo.push(todasLasPalabrasEnElCampo);
			}

			// Se fija que 'la condición de palabras' se cumpla en alguno de los campos
			const condicPalabras = {[Op.or]: todasLasPalabrasEnAlgunCampo};

			// Se fija que el registro esté en statusAprobado, o status 'creados_ids' y por el usuario
			const condicStatus = {
				[Op.or]: [
					{statusRegistro_id: aprobados_ids},
					{[Op.and]: [{statusRegistro_id: creado_id}, {creadoPor_id: usuario_id}]},
				],
			};

			// Se fija que una edición sea del usuario
			const condicEdicion = {editadoPor_id: usuario_id};

			// Fin
			return {[Op.and]: [condicPalabras, original ? condicStatus : condicEdicion]};
		},
		registros: async (condicion, dato) => {
			// Obtiene los registros
			const registros = await baseDeDatos.obtieneTodosPorCondicionConLimite(dato.entidad, condicion, 10).then((n) =>
				n.map((m) => {
					let respuesta = {
						id: m.id,
						nombre: m[dato.campos[0]],
						entidad: dato.entidad,
						familia: dato.familia,
						avatar: m.avatar, // específicos para PA-Desambiguar
					};
					if (m.anoEstreno) respuesta.anoEstreno = m.anoEstreno;
					if (m.nombreOriginal) respuesta.nombreOriginal = m.nombreOriginal; // específicos para PA-Desambiguar

					return respuesta;
				})
			);

			// Fin
			return registros;
		},
		ediciones: async (condicion, dato) => {
			// Obtiene los registros
			const registros = await baseDeDatos
				.obtieneTodosPorCondicionConLimite(dato.entidad, condicion, 10, dato.include)
				.then((n) =>
					n.map((m) => {
						const entidad = comp.obtieneDesdeCampo_id.entidad(m, dato.entidad);
						const asoc = comp.obtieneDesdeEntidad.asociacion(entidad);
						return {
							entidad,
							id: m[comp.obtieneDesdeEntidad.campo_id(entidad)],
							anoEstreno: m.anoEstreno ? m.anoEstreno : m[asoc].anoEstreno,
							nombre: m[dato.campos[0]] ? m[dato.campos[0]] : m[dato.campos[1]],
							familia: dato.familia,
						};
					})
				);

			// Fin
			return registros;
		},
	},

	// CRUD
	obtieneDatosForm: async function (req) {
		// Variables
		const {baseUrl, ruta} = comp.reqBasePathUrl(req);
		const {entidad, id} = req.query;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const origen = req.query.origen;
		const usuario_id = req.session && req.session.usuario ? req.session.usuario.id : null;
		let comentario;

		// Obtiene el tema y código
		const tema = baseUrl == "/revision" ? "revisionEnts" : "fmCrud";
		const codigo = this.codigo({ruta, familia});

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
			prodsDelRCLV = await this.prodsDelRCLV(original, usuario_id);
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
		const usuario_id = req.session.usuario.id;
		const ahora = comp.fechaHora.ahora();
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const include = comp.obtieneTodosLosCamposInclude(entidad);
		const original = await baseDeDatos.obtienePorId(entidad, id, include);
		const statusFinal_id = codigo == "inactivar" ? inactivar_id : recuperar_id;
		comentario = await this.comentario({entidad, id, motivo_id, entDupl, idDupl, comentario, statusFinal_id});

		// Fin
		return {entidad, id, familia, motivo_id, codigo, usuario_id, ahora, campo_id, original, statusFinal_id, comentario};
	},
	comentario: async function (datos) {
		// Stoppers
		if (datos.codigo == "recuperar") return comentario;
		if (!datos.motivo_id) return null;

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
			if (comentNeces && datos.statusFinal_id == inactivo_id) {
				const ultHist = await this.historialDeStatus.ultimoRegistro(datos.entidad, datos.id);
				if (ultHist && ultHist.statusFinal_id == inactivar_id && ultHist.comentario) comentario = ultHist.comentario;
			}
		}

		// Fin
		if (comentario && comentario.endsWith(".")) comentario = comentario.slice(0, -1);
		return comentario;
	},
	obtieneOriginalEdicion: async ({entidad, entId, usuario_id, excluirInclude, omitirPulirEdic}) => {
		// Variables
		const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const condEdic = {[campo_id]: entId, editadoPor_id: usuario_id};
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
		let original = baseDeDatos.obtienePorId(entidad, entId, includesOrig);
		let edicion = usuario_id ? baseDeDatos.obtienePorCondicion(entidadEdic, condEdic, includesEdic) : null;
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
		if (entidad == "capitulos" && usuario_id) {
			// Variables
			const condColec = {coleccion_id: original.coleccion_id, editadoPor_id: usuario_id};
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
	guardaActEdic: async ({entidad, original, edicion, usuario_id}) => {
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
				edicion.editadoPor_id = usuario_id;

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
				const motivo = n.motivo && !n.motivo.general ? n.motivo.descripcion : "";
				const comentario = motivo + (n.comentario ? (motivo ? ": " : "") + n.comentario : "");
				return {...n, comentario};
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
		ultimoRegistro: async (entidad, entidad_id) => {
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
		const ultHist = await this.historialDeStatus.ultimoRegistro(entidad, id);
		const statusFinal_id = ultHist ? ultHist.statusFinal_id : null;

		// Compara los status
		const statusAlineado =
			(statusRegistro_id == creado_id && !ultHist) || // creado
			(aprobados_ids.includes(statusRegistro_id) && (!ultHist || aprobados_ids.includes(statusFinal_id))) || // creadoAprob, aprobado
			([...inacRecup_ids, inactivo_id].includes(statusRegistro_id) && statusRegistro_id == statusFinal_id); // inactivar, recuperar, inactivo

		// Fin
		return {statusAlineado, prodRclv, ultHist};
	},
	prodsDelRCLV: async function (RCLV, usuario_id) {
		// Variables
		let prodsDelRCLV = [];
		const pppRegs = usuario_id
			? await baseDeDatos.obtieneTodosPorCondicion("pppRegistros", {usuario_id: usuario_id}, "detalle") // si existe usuario
			: [];

		// Crea un array para cada asociación de producto del RCLV
		for (let entidad of variables.entidades.prods) if (!RCLV[entidad]) RCLV[entidad] = [];

		// Convierte en productos, a las ediciones propias de productos, con 'campo_id' vinculado al RCLV,
		if (usuario_id && RCLV.prodsEdiciones) {
			// Obtiene las ediciones propias
			const edicionesPropias = RCLV.prodsEdiciones.filter((n) => n.editadoPor_id == usuario_id);

			// Obtiene los productos de las ediciones propias
			if (edicionesPropias.length)
				for (let edicion of edicionesPropias) {
					// Obtiene la entidad con la que está asociada la edición del RCLV, y su campo 'producto_id'
					let entProd = comp.obtieneDesdeCampo_id.entidadProd(edicion);
					let campo_id = comp.obtieneDesdeEntidad.campo_id(entProd);
					let entId = edicion[campo_id];

					// Obtiene los registros del producto original y su edición por el usuario
					let [prodOrig, prodEdic] = await this.obtieneOriginalEdicion({entidad: entProd, entId, usuario_id});

					// Actualiza la variable del registro original
					let producto = {...prodOrig, ...prodEdic, id: prodOrig.id};

					// Fin
					RCLV[entProd].push(producto);
				}
		}

		// Completa la información de cada tipo de producto y une los productos en una sola array
		for (let entidad of variables.entidades.prods) {
			// Completa la información de cada producto
			for (let producto of RCLV[entidad]) {
				// Causas para descartar el registro
				if (
					inactivos_ids.includes(producto.statusRegistro_id) || // status inactivar o inactivo
					(producto.statusRegistro_id == creado_id && producto.creadoPor_id != usuario_id) || // status creado
					(producto.statusRegistro_id == recuperar_id && producto.statusSugeridoPor_id != usuario_id) // status recuperar
				)
					continue;

				// Variables
				const avatar = this.obtieneAvatar(producto).edic;
				const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
				const pppReg = pppRegs.find((n) => n.entidad == entidad && n.entidad_id == producto.id);
				const ppp = pppReg ? pppReg.detalle : pppOpcsObj.sinPref;

				// Agrega la entidad, el avatar, y el nombre de la entidad
				prodsDelRCLV.push({...producto, entidad, avatar, entidadNombre, ppp});
			}
		}

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
	transfDatosDeColParaCaps: async (original, edicion, campo) => {
		// Variables
		const novedad = {[campo]: edicion[campo]};
		const {camposTransfCaps} = variables;

		// Si el campo no recibe datos, termina
		const camposAceptados = Object.values(camposTransfCaps).flat();
		if (!camposAceptados.includes(campo)) return;

		// Campos que se reemplazan siempre
		const esActoresSiempre = campo == "actores" && [dibujosAnimados, documental].includes(edicion.actores);
		if (camposTransfCaps.sinDifs.includes(campo) || esActoresSiempre) {
			const condicion = {coleccion_id: original.id};
			await baseDeDatos.actualizaTodosPorCondicion("capitulos", condicion, novedad);
		}

		// Campos para los que se puede preservar el valor según el caso
		const esActoresDepende = campo == "actores" && ![dibujosAnimados, documental].includes(edicion.actores);
		if (camposTransfCaps.conDifs.includes(campo) || esActoresDepende) {
			// Condición
			const condicion = {coleccion_id: original.id, [campo]: [original[campo]]}; // si el valor del capítulo coincide coincide con el del original
			if (original[campo] !== null) condicion[campo].push(null); // se asegura de que reemplace los que tengan valor 'null'

			// Campos particulares
			const esRclv_id = variables.entidades.rclvs_id.includes(campo);
			const noEsVarios = esRclv_id && edicion[campo] != 2; // 'rclv_id', salvo que sea 'varios'
			const esEpocaOcurrencia = campo == "epocaOcurrencia_id";
			const noEsVarias = esEpocaOcurrencia && edicion.epocaOcurrencia_id != epocasVarias.id; // 'epocaOcurrencia_id', salvo que sea 'varios'
			const esOtroCampo = !esRclv_id && !esEpocaOcurrencia;

			// Reemplaza los valores
			if (esOtroCampo || (esRclv_id && !noEsVarios) || (esEpocaOcurrencia && !noEsVarias))
				await baseDeDatos.actualizaTodosPorCondicion("capitulos", condicion, novedad);
		}

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
				// Variables
				let espera = [];

				// Elimina los registros de las entidades dependientes, comunes a todos los productos
				for (let entDepen of ["prodsComplem", "linksEdicion", "links"])
					espera.push(baseDeDatos.eliminaTodosPorCondicion(entDepen, condicion));

				// Elimina los registros de las entidades dependientes, específicos de las colecciones
				if (entidad == "colecciones")
					for (let entDepen of ["capitulos", "capsSinLink"])
						espera.push(baseDeDatos.eliminaTodosPorCondicion(entDepen, {coleccion_id: id}));

				// Fin
				espera = await Promise.all(espera);
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
			let prods = [];
			let espera = [];

			// Obtiene los productos vinculados al RCLV, en cada entidad
			for (let entidad of entidades)
				prods.push(
					baseDeDatos
						.obtieneTodosPorCondicion(entidad, {[campo_idRCLV]: rclvID})
						.then((n) => n.map((m) => ({...m, [campo_id]: 1})))
				);
			prods = await Promise.all(prods).then((n) => n.flat());

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
					: {titulo: "Aprobado el", valor: comp.fechaHora.diaMesAno(registro.altaRevisadaEn)}
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
				const articulo =
					registro.entidad == "personajes"
						? (registro.genero_id.includes("M") ? "o" : "a") + (registro.genero_id.includes("P") ? "s" : "")
						: comp.obtieneDesdeEntidad.oa(registro.entidad);
				bloque.push({titulo: "También conocid" + articulo + " como", valor: registro.nombreAltern});
			}
			if (registro.canon && registro.canon_id != "NN" && registro.canon[registro.genero_id])
				bloque.push({titulo: "Status Canoniz.", valor: registro.canon[registro.genero_id]});

			if (registro.fechaDelAno && registro.fechaDelAno.id < 400) {
				const articulo = comp.letras.laLo(registro);
				bloque.push({titulo: "Se " + articulo + " recuerda el", valor: registro.fechaDelAno.nombre});
			}

			if (registro.rolIglesia && registro.rolIglesia_id != "NN")
				bloque.push({titulo: "Rol en la Iglesia", valor: registro.rolIglesia[registro.genero_id]});
			if (registro.apMar && registro.apMar_id != 10)
				bloque.push({titulo: "Aparición Mariana", valor: registro.apMar.nombre});
			if (registro.anoNacim) bloque.push({titulo: "Año de nacimiento", valor: registro.anoNacim});

			// Particularidades para hechos
			if (registro.entidad == "hechos") {
				if (registro.anoComienzo) bloque.push({titulo: "Año", valor: registro.anoComienzo});
				if (registro.ama) bloque.push({valor: "Es una aparición mariana"});
			}

			// Fin
			return bloque;
		},
		usuario: async (usuario_id, entidad) => {
			// Variables
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
			const ahora = comp.fechaHora.ahora();
			const usuario = await baseDeDatos.obtienePorId("usuarios", usuario_id);
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
			const prodId = edicion[campo_idProd];

			// Obtiene el producto original
			const original = await baseDeDatos.obtienePorId(prodEntidad, prodId);

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
			{titulo: "Eficacia de " + sufijo, valor: calidad},
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
		const motivoDetalle = motivo ? (motivo.general ? statusHistorial.comentario : motivo.descripcion) : null;

		// Fin
		return {motivoDetalle};
	},
	statusFinal: (statusFinal_id) => {
		const {nombre} = statusRegistros.find((n) => n.id == statusFinal_id);
		const {codigo} = statusRegistros.find((n) => n.id == statusFinal_id);
		return {nombre, codigo};
	},
};
