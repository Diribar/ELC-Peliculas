"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");
const procesos = require("./RCLV-FN-Procesos");
const valida = require("./RCLV-FN-Validar");

module.exports = {
	detalle: async (req, res) => {
		// Variables
		const tema = "rclvCrud";
		const codigo = "detalle";
		const {siglaFam, entidad} = comp.partesDelUrl(req);
		const {id, hoyLocal} = req.query;
		const origen = req.query.origen ? req.query.origen : "DT";
		const usuario = req.session.usuario ? req.session.usuario : null;
		const usuario_id = usuario ? usuario.id : null;
		const delLa = comp.obtieneDesdeEntidad.delLa(entidad);
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		let imgDerPers, ayudasTitulo;

		// Obtiene RCLV y sus productos
		const [original, edicion] = await procsFM.obtieneOriginalEdicion({entidad, entId: id, usuario_id});
		let rclv = {...original, ...edicion, id};
		rclv = await procesos.actualizaProdsRCLV_conEdicionPropia(rclv, usuario_id);
		const prodsDelRCLV = await procsFM.prodsDelRCLV(rclv, usuario_id);

		// Ayuda para el titulo
		if (prodsDelRCLV.length == 1) ayudasTitulo = ["Es la única película que tenemos en nuestra base de datos."];
		if (prodsDelRCLV.length > 1)
			ayudasTitulo = [
				"Son las películas que tenemos en nuestra base de datos.",
				"Están ordenadas desde la más reciente a la más antigua.",
			];

		// Bloque de la derecha
		const bloqueDer = {
			rclv: procsFM.bloques.rclv({...rclv, entidad}),
			registro: await procsFM.bloques.registro({...rclv, entidad}),
		};

		// Imagen derecha
		if (hoyLocal) {
			const rutaNombre = carpetaPublica + "/imagenes/ImagenDerecha/" + hoyLocal + ".jpg";
			const existe = comp.gestionArchivos.existe(rutaNombre);
			if (existe) imgDerPers = "/publico/imagenes/ImagenDerecha/" + hoyLocal + ".jpg";
		}
		if (!imgDerPers) imgDerPers = procsFM.obtieneAvatar(original, edicion).edic;

		// Datos para la vista
		const status_id = original.statusRegistro_id;
		const canonNombre = comp.canonNombre(rclv);
		const RCLVnombre = rclv.nombre;
		const revisorPERL = usuario && usuario.rolUsuario.revisorPERL;
		const creadoPor_id = rclv.creadoPor_id;
		const tituloDetalle = "Detalle" + delLa + entidadNombre;
		const titulo = entidadNombre + " - " + canonNombre + " " + rclv.nombre;
		const iconoDL = "fa-video";
		const iconoDB = "fa-child";
		const ea = comp.obtieneDesdeEntidad.ea(entidad);
		const {statusAlineado} = await procsFM.statusAlineado({entidad, prodRclv: rclv});

		// Ir a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, tituloDetalle, titulo, ayudasTitulo, origen, revisorPERL, usuario},
			...{siglaFam, entidad, entidadNombre, id, familia, status_id, creadoPor_id, registro: rclv, statusAlineado},
			...{imgDerPers, bloqueDer, prodsDelRCLV, canonNombre, RCLVnombre, ea},
			...{iconosMobile: true, iconoDL, iconoDB},
		});
	},
	altaEdic: {
		form: async (req, res) => {
			// Tema y Código - puede venir de: agregarProd, edicionProd, detalleRCLV, revision...
			const {baseUrl, tarea, siglaFam, entidad} = comp.partesDelUrl(req);
			const tema = baseUrl == "/revision" ? "revisionEnts" : "rclvCrud";
			let codigo = tarea.slice(1);
			if (codigo == "alta") codigo += "/r"; // crud: 'agregar', 'edicion'; revisión: 'alta/r', 'solapamiento'

			// Más variables
			const {id, prodEntidad, prodId} = req.query;
			const origen = req.query.origen ? req.query.origen : tema == "revisionEnts" ? (codigo == "alta/r" ? "RA" : "TE") : "";
			const usuario_id = req.session.usuario.id;
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const personajes = entidad == "personajes";
			const hechos = entidad == "hechos";
			const temas = entidad == "temas";
			const eventos = entidad == "eventos";
			const epocasDelAno = entidad == "epocasDelAno";
			let dataEntry = {};
			let apMars, edicID, bloqueDer;

			// Configura el título de la vista
			const titulo =
				(codigo == "agregar" ? "Agregar - " : codigo == "edicion" ? "Edición - " : "Revisión - ") + entidadNombre;

			// Variables específicas para personajes
			if (personajes)
				apMars = await baseDeDatos.obtieneTodosConOrden("hechos", "anoComienzo").then((n) => n.filter((m) => m.ama));

			// Pasos exclusivos para edición y revisión
			if (codigo != "agregar") {
				// Obtiene el original y edicion
				const [original, edicion] = await procsFM.obtieneOriginalEdicion({entidad, entId: id, usuario_id});
				edicID = edicion.id;

				// Actualiza el data entry de session
				dataEntry = {...original, ...edicion, id, edicID: edicion.id};
				const session = req.session[entidad] ? req.session[entidad] : req.cookies ? req.cookies[entidad] : null;
				if (session) {
					dataEntry = {...dataEntry, ...session};
					req.session[entidad] = null;
					res.clearCookie(entidad);
				}

				// Obtiene el día y el mes
				dataEntry = {...comp.fechaHora.fechaDelAno(dataEntry), ...dataEntry};

				// Datos Breves
				if (tema == "revisionEnts")
					bloqueDer = {
						registro: await procsFM.bloques.registro({...original, entidad}),
						usuario: await procsFM.bloques.usuario(original.statusSugeridoPor_id, entidad),
					};
			}

			// Tipo de fecha
			dataEntry.tipoFecha_id = procesos.altaEdicForm.tipoFecha_id(dataEntry, entidad);
			if (!dataEntry.prioridad_id) dataEntry.prioridad_id = procesos.altaEdicForm.prioridad_id(dataEntry, entidad);

			// Imagen Personalizada
			const imgDerPers = procsFM.obtieneAvatar(dataEntry).edic;

			// Info para la vista
			const statusCreado = tema == "revisionEnts" && dataEntry.statusRegistro_id == creado_id;
			const ent = personajes ? "Pers" : hechos ? "Hecho" : "";
			const originalUrl = req.originalUrl;
			const opcsHoyEstamos =
				dataEntry.genero_id && dataEntry.hoyEstamos_id
					? hoyEstamos.filter((n) => n.entidad == entidad && n.genero_id == dataEntry.genero_id)
					: [];
			const opcsLeyNombre =
				dataEntry.nombre && dataEntry.leyNombre
					? procesos.altaEdicForm.opcsLeyNombre({...dataEntry, personajes, hechos})
					: [];
			const ayudas = procesos.altaEdicForm.ayudas(entidad);
			const statusAlineado = codigo == "alta/r";
			const cartelGenerico = codigo == "edicion";
			const cartelRechazo = tema == "revisionEnts";

			// Ir a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, origen, titulo},
				...{siglaFam, entidad, id, prodEntidad, prodId, edicID, familia: "rclv", ent, familia},
				...{personajes, hechos, temas, eventos, epocasDelAno, prioridadesRclv},
				...{dataEntry, imgDerPers, statusCreado, bloqueDer, ayudas},
				...{apMars, originalUrl, opcsHoyEstamos, opcsLeyNombre, statusAlineado},
				...{cartelGenerico, cartelRechazo, estrucPers: true},
			});
		},
		// Puede venir de agregarProd, edicionProd, detalleRCLV, revision
		guardar: async (req, res) => {
			// Variables
			const entidad = comp.obtieneEntidadDesdeUrl(req);
			const {id, prodEntidad, prodId, eliminarEdic} = req.query;
			const {tarea} = comp.partesDelUrl(req);
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const origen = req.query.origen ? req.query.origen : "DT";
			const usuario_id = req.session.usuario.id;
			let errores;

			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let prop in req.body)
				if (!req.body[prop]) delete req.body[prop];
				else if (typeof req.body[prop] == "string") req.body[prop] = req.body[prop].trim();

			// Obtiene los datos
			let datos = {...req.body, ...req.query, imgOpcional: true};

			// Si recibimos un avatar, se completa la información
			if (req.file) {
				datos.avatar = req.file.filename;
				datos.tamano = req.file.size;
			}

			// Acciones si el usuario elimina la edición
			if (eliminarEdic) {
				// Variables
				const condicion = {[campo_id]: id, editadoPor_id: usuario_id};

				// Borra el eventual avatar guardado en la edicion y elimina la edición de la BD
				const edicion = await baseDeDatos.obtienePorCondicion("rclvsEdicion", condicion);
				if (edicion && edicion.avatar) comp.gestionArchivos.elimina(carpetaExterna + "3-RCLVs/Revisar/", edicion.avatar);
				if (edicion) await baseDeDatos.eliminaPorId("rclvsEdicion", edicion.id);

				// Actualiza el 'originalUrl'
				let posicion = req.originalUrl.indexOf("&edicID");
				const urlInicial = req.originalUrl.slice(0, posicion);
				let urlFinal = req.originalUrl.slice(posicion + 1);
				posicion = urlFinal.indexOf("&");
				urlFinal = posicion > 0 ? urlFinal.slice(posicion) : "";
				req.originalUrl = urlInicial + urlFinal;
				req.originalUrl = req.originalUrl.replace("&eliminarEdic=true", "");
			}
			// Averigua si hay errores de validación
			else errores = await valida.consolidado(datos);

			// Acciones si hay errores o se eliminó la edición
			if (eliminarEdic || (errores && errores.hay)) {
				if (errores && errores.hay) {
					// Guarda session y cookie
					const session = {...req.body};
					req.session[entidad] = session;
					res.cookie(entidad, session, {maxAge: unDia});
				}
				// Si se agregó un archivo avatar, lo elimina
				if (req.file) comp.gestionArchivos.elimina(carpetaExterna + "9-Provisorio/", datos.avatar);

				// Redirige a la vista 'form'
				return res.redirect(req.originalUrl);
			}

			// Obtiene el dataEntry y guarda los cambios
			const DE = procesos.altaEdicGuardar.procesaLosDatos(datos);
			const {original, edicion, edicN} = await procesos.altaEdicGuardar.guardaLosCambios(req, res, DE);

			// Acciones si se agregó un registro 'rclv'
			if (tarea == "/agregar") {
				// Si el origen es "Datos Adicionales", actualiza su session y cookie
				if (origen == "PDA") {
					req.session.datosAdics = {...req.session.datosAdics, [campo_id]: original.id};
					res.cookie("datosAdics", req.session.datosAdics, {maxAge: unDia});
				}
				// Si el origen es "Edición de Producto", crea o actualiza la edición
				if (origen == "PED") {
					// Obtiene el registro original del producto, y su edición ya creada (si existe)
					let [prodOrig, prodEdic] = await procsFM.obtieneOriginalEdicion({
						entidad: prodEntidad,
						entId: prodId,
						usuario_id,
						excluirInclude: true,
					});

					// Actualiza la edición
					prodEdic = {...prodEdic, [campo_id]: original.id};

					// Crea o actualiza la edición
					await procsFM.guardaActEdic({entidad: prodEntidad, original: prodOrig, edicion: prodEdic, usuario_id});
				}
			}

			// Acciones si recibimos un avatar
			if (req.file) {
				// Lo mueve de 'Provisorio' a 'Revisar'
				comp.gestionArchivos.mueveImagen(DE.avatar, "9-Provisorio", "3-RCLVs/Revisar");

				// Elimina el eventual anterior
				if (tarea == "/edicion") {
					// Si es un registro propio y en status creado, borra el eventual avatar original
					if (original.creadoPor_id == usuario_id && original.statusRegistro_id == creado_id) {
						if (original.avatar) comp.gestionArchivos.elimina(carpetaExterna + "3-RCLVs/Revisar/", original.avatar);
					}
					// Si no está en status 'creado', borra el eventual avatar_edicion anterior
					else if (edicion && edicion.avatar)
						comp.gestionArchivos.elimina(carpetaExterna + "3-RCLVs/Revisar/", edicion.avatar);
				}
			}

			// Si corresponde, actualiza el solapamiento
			if (entidad == "epocasDelAno" && !edicion && !edicN) comp.actualizaSolapam();

			// Obtiene el url de la siguiente instancia
			let destino = "/inactivar-captura/" + entidad + "/?id=" + (id ? id : 1) + "&origen=" + origen;
			if (origen == "PED") destino += "&prodEntidad=" + prodEntidad + "&prodId=" + prodId;

			// Redirecciona a la siguiente instancia
			return res.redirect(destino);
		},
	},
	prodsPorReg: async (req, res) => {
		// Variables
		const entidad = comp.obtieneEntidadDesdeUrl(req);
		const condicion = {id: {[Op.ne]: 1}};
		const include = [...variables.entidades.prods, "prodsEdiciones"];
		const registros = {};
		const resultado = {};

		// Lectura
		await baseDeDatos
			.obtieneTodosPorCondicion(entidad, condicion, include)
			// Averigua la cantidad de includes por registro rclv
			.then((regs) => {
				for (let reg of regs) {
					registros[reg.nombre] = 0;
					for (let entInclude of include) registros[reg.nombre] += reg[entInclude].length;
				}
			})
			// Ordena los registros por su cantidad de productos, en orden descendente
			.then(() => {
				// Ordena los métodos según la cantidad de productos
				const metodos = Object.keys(registros);
				metodos.sort((a, b) =>
					registros[b] != registros[a]
						? registros[b] - registros[a] // por cantidad de productos
						: a < b // por orden alfabético
						? -1
						: 1
				);

				// Crea un objeto nuevo, con los métodos ordenados
				for (let metodo of metodos) resultado[metodo] = registros[metodo];
			});

		// Fin
		return res.send(resultado);
	},
};
