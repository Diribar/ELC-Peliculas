"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./RCLV-FN-Procesos");
const valida = require("./RCLV-FN-Validar");

module.exports = {
	detalle: async (req, res) => {
		// Variables
		const tema = "rclv_crud";
		const codigo = "detalle";
		const {entidad, id} = req.query;
		const origen = req.query.origen ? req.query.origen : "DTR";
		const usuario = req.session.usuario ? req.session.usuario : "";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const revisor = req.session.usuario && req.session.usuario.rolUsuario.revisorEnts;
		const articulo = entidad == "epocasDelAno" ? "a" : "";
		const titulo = "Detalle de un" + articulo + " " + entidadNombre;

		// Obtiene RCLV con productos
		let include = [...variables.entidades.prods, ...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("prods_ediciones", "statusRegistro", "creado_por", "sugerido_por", "alta_revisada_por");
		const original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const edicion = usuario
			? await BD_genericas.obtienePorCondicion("rclvs_edicion", {[campo_id]: id, editadoPor_id: usuario.id})
			: {};
		const registro = {...original, ...edicion, id};

		// Productos
		const prodsDelRCLV = await procesos.detalle.prodsDelRCLV(original, usuario);
		const cantProds = prodsDelRCLV.length;

		// Ayuda para el titulo
		const ayudasTitulo = [
			"El grupo de películas con fondo azul, son las que ya tenemos en nuestra BD.",
			"El grupo de películas con fondo verde, son las que no tenemos en nuestra BD y podés agregar.",
			"Dentro de cada grupo, primero figuran las colecciones y luego las películas, y están ordenadas desde la más reciente a las más antigua.",
		];
		// Bloque de la derecha
		const bloqueDer = {
			rclv: procesos.detalle.bloqueRCLV({...original, entidad}),
			registro: procsCRUD.bloqueRegistro({registro: original, revisor, cantProds}),
		};
		// Imagen Derecha
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;
		// Status de la entidad
		const status_id = original.statusRegistro_id;
		const statusEstable =
			codigo == "detalle" && ([creadoAprob_id, aprobado_id].includes(status_id) || status_id == inactivo_id);
		// Datos para la vista
		const procCanoniz = procesos.detalle.procCanoniz(registro);
		const RCLVnombre = registro.nombre;
		const userIdentVal = req.session.usuario && req.session.usuario.statusRegistro.ident_validada;

		// Ir a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen, revisor},
			...{entidad, entidadNombre, id, familia, status_id, statusEstable},
			...{imgDerPers, bloqueDer},
			...{prodsDelRCLV, procCanoniz, RCLVnombre},
			userIdentVal,
		});
	},
	altaEdic:{
		form: async (req, res) => {
			// Puede venir de: agregarProd, edicionProd, detalleRCLV, revision...
			// Tema y Código
			const {baseUrl, ruta} = comp.reqBasePathUrl(req);
			const tema = baseUrl == "/rclv" ? "rclv_crud" : baseUrl == "/revision" ? "revisionEnts" : "";
			const codigo = ruta.slice(1, -1); // Resultados posibles: 'agregar', 'edicion', 'alta'
	
			// Más variables
			const {entidad, id, prodEntidad, prodID} = req.query;
			const origen = req.query.origen ? req.query.origen : tema == "revisionEnts" ? "TE" : "";
			const userID = req.session.usuario.id;
			const revisor = req.session.usuario.rolUsuario.revisorEnts;
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
			const personajes = entidad == "personajes";
			const hechos = entidad == "hechos";
			const temas = entidad == "temas";
			const eventos = entidad == "eventos";
			const epocasDelAno = entidad == "epocasDelAno";
			let dataEntry = {};
			let ap_mars, roles_igl, edicID, bloqueDer;
	
			// Configura el título de la vista
			const titulo = (codigo == "agregar" ? "Agregar - " : codigo == "edicion" ? "Edición - " : "Revisión - ") + entidadNombre;
	
			// Variables específicas para personajes
			if (personajes) {
				roles_igl = roles_iglesia.filter((m) => m.personaje);
				ap_mars = await BD_genericas.obtieneTodos("hechos", "anoComienzo").then((n) => n.filter((m) => m.ama));
			}
	
			// Pasos exclusivos para edición y revisión
			if (codigo != "agregar") {
				// Obtiene el original y edicion
				const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
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
				dataEntry = {...comp.fechaHora.diaDelAno(dataEntry), ...dataEntry};
	
				// Datos Breves
				if (tema == "revisionEnts")
					bloqueDer = [
						procsCRUD.bloqueRegistro({registro: {...original, entidad}, revisor, cantProds: 0}),
						await procsCRUD.fichaDelUsuario(original.statusSugeridoPor_id, petitFamilias),
					];
			}
	
			// Tipo de fecha
			dataEntry.tipoFecha_id = procesos.altaEdicForm.tipoFecha_id(dataEntry, entidad);
			if (!dataEntry.prioridad_id) dataEntry.prioridad_id = procesos.altaEdicForm.prioridad_id(dataEntry, entidad);
	
			// Imagen Personalizada
			const imgDerPers = procsCRUD.obtieneAvatar(dataEntry).edic;
	
			// Info para la vista
			const statusCreado = tema == "revisionEnts" && dataEntry.statusRegistro_id == creado_id;
			const ent = personajes ? "pers" : hechos ? "hecho" : "";
			const originalUrl = req.originalUrl;
			const prioridades = variables.prioridadesRCLV;
	
			// Ir a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, origen, titulo},
				...{entidad, id, prodEntidad, prodID, edicID, familia: "rclv", ent, familia},
				...{personajes, hechos, temas, eventos, epocasDelAno, prioridades},
				...{dataEntry, imgDerPers, statusCreado, bloqueDer},
				...{roles_igl, ap_mars, originalUrl, revisor},
				...{cartelGenerico: codigo == "edicion", cartelRechazo: tema == "revisionEnts"},
				...{omitirImagenDerecha: true, omitirFooter: true},
			});
		},
		// Puede venir de agregarProd, edicionProd, o detalleRCLV
		guardar: async (req, res) => {
			// Variables
			const {entidad, id, prodEntidad, prodID, eliminarEdic} = req.query;
			const origen = req.query.origen ? req.query.origen : "DTR";
			const codigo = req.baseUrl + req.path;
			const userID = req.session.usuario.id;
			let errores;
	
			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let campo in req.body) if (!req.body[campo]) delete req.body[campo];
			for (let campo in req.body) if (typeof req.body[campo] == "string") req.body[campo] = req.body[campo].trim();
	
			// Obtiene los datos
			let datos = {...req.body, ...req.query, opcional: true};
	
			// Si recibimos un avatar, se completa la información
			if (req.file) {
				datos.avatar = req.file.filename;
				datos.tamano = req.file.size;
			}
	
			// Acciones si se elimina la edición
			if (eliminarEdic) {
				// Variables
				const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
				const condiciones = {[campo_id]: id, editadoPor_id: userID};
	
				// Borra el eventual avatar guardado en la edicion y elimina la edición de la BD
				const edicion = await BD_genericas.obtienePorCondicion("rclvs_edicion", condiciones);
				if (edicion && edicion.avatar) comp.gestionArchivos.elimina("./publico/imagenes/2-RCLVs/Revisar/", edicion.avatar);
				if (edicion) await BD_genericas.eliminaPorId("rclvs_edicion", edicion.id);
	
				// Actualiza el 'originalUrl'
				let posicion = req.originalUrl.indexOf("&edicID");
				const urlInicial = req.originalUrl.slice(0, posicion);
				let urlFinal = req.originalUrl.slice(posicion + 1);
				posicion = urlFinal.indexOf("&");
				urlFinal = posicion > 0 ? urlFinal.slice(posicion) : "";
				req.originalUrl = urlInicial + urlFinal;
				req.originalUrl = req.originalUrl.replace("&eliminarEdic=true", "");
			} else {
				// Averigua si hay errores de validación
				errores = await valida.consolidado(datos);
				if (errores.hay) {
					// Guarda session y cookie
					const session = {...req.body};
					req.session[entidad] = session;
					res.cookie(entidad, session, {maxAge: unDia});
				}
			}
	
			// Acciones si hay errores o se eliminó la edición
			if ((errores && errores.hay) || eliminarEdic) {
				// Si se agregó un archivo avatar, lo elimina
				if (req.file) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio/", datos.avatar);
	
				// Redirige a la vista 'form'
				return res.redirect(req.originalUrl);
			}
	
			// Obtiene el dataEntry y guarda los cambios
			const DE = procesos.altaEdicGuardar.procesaLosDatos(datos);
			const {original, edicion} = await procesos.altaEdicGuardar.guardaLosCambios(req, res, DE);
	
			// Acciones si recibimos un avatar
			if (req.file) {
				// Lo mueve de 'Provisorio' a 'Revisar'
				comp.gestionArchivos.mueveImagen(DE.avatar, "9-Provisorio", "2-RCLVs/Revisar");
	
				// Elimina el eventual anterior
				if (codigo == "/rclv/edicion/") {
					// Si es un registro propio y en status creado, borra el eventual avatar original
					if (original.creadoPor_id == userID && original.statusRegistro.creado) {
						if (original.avatar) comp.gestionArchivos.elimina("./publico/imagenes/2-RCLVs/Revisar/", original.avatar);
					}
					// Si no está en status 'creado', borra el eventual avatar_edicion anterior
					else if (edicion && edicion.avatar)
						comp.gestionArchivos.elimina("./publico/imagenes/2-RCLVs/Revisar/", edicion.avatar);
				}
			}
	
			// Obtiene el url de la siguiente instancia
			let destino = "/inactivar-captura/?entidad=" + entidad + "&id=" + (id ? id : 1) + "&origen=" + origen;
			if (origen == "EDP" || origen == "DTP") destino += "&prodEntidad=" + prodEntidad + "&prodID=" + prodID;
	
			// Redirecciona a la siguiente instancia
			return res.redirect(destino);
		},
	},
};
