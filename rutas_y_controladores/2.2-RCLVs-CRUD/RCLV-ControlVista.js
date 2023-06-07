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
		const articulo = entidad == "epocas_del_ano" ? "a" : "";
		const titulo = "Detalle de un" + articulo + " " + entidadNombre;

		// Obtiene RCLV con productos
		let include = [...variables.entidades.prods, ...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("prods_ediciones", "status_registro", "creado_por", "sugerido_por", "alta_revisada_por");
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
			codigo == "detalle" && ([creado_aprob_id, aprobado_id].includes(status_id) || status_id == inactivo_id);
		// Datos para la vista
		const procCanoniz = procesos.detalle.procCanoniz(registro);
		const RCLVnombre = registro.nombre;
		const userIdentVal = req.session.usuario && req.session.usuario.status_registro.ident_validada;

		// Ir a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen, revisor},
			...{entidad, entidadNombre, id, familia, status_id, statusEstable},
			...{imgDerPers, bloqueDer},
			...{prodsDelRCLV, procCanoniz, RCLVnombre},
			userIdentVal,
		});
	},
	altaEdicForm: async (req, res) => {
		// Puede venir de: agregarProd, edicionProd, detalleRCLV, revision...
		// Tema y Código
		const tema = req.baseUrl == "/rclv" ? "rclv_crud" : req.baseUrl == "/revision" ? "revisionEnts" : "";
		const codigo = req.path.slice(1, -1); // Resultados posibles: 'agregar' o 'edicion'

		// Más variables
		const {entidad, id, prodEntidad, prodID} = req.query;
		const origen = req.query.origen ? req.query.origen : tema == "revisionEnts" ? "TE" : "";
		const userID = req.session.usuario.id;
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const personajes = entidad == "personajes";
		const hechos = entidad == "hechos";
		const temas = entidad == "temas";
		const eventos = entidad == "eventos";
		const epocas_del_ano = entidad == "epocas_del_ano";
		let dataEntry = {};
		let ap_mars, roles_igl, edicID;

		// Configura el título de la vista
		const titulo = (codigo == "agregar" ? "Agregar - " : codigo == "edicion" ? "Edición - " : "Revisar - ") + entidadNombre;

		// Variables específicas para personajes
		if (personajes) {
			roles_igl = roles_iglesia.filter((m) => m.personaje);
			ap_mars = await BD_genericas.obtieneTodos("hechos", "ano").then((n) => n.filter((m) => m.ama));
		}

		// Pasos exclusivos para edición y revisión
		if (codigo != "agregar") {
			// Obtiene el original y edicion
			let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
			edicID = edicion.id;
			// Pisa el data entry de session
			dataEntry = {...original, ...edicion, id, edicID: edicion.id};
			// Obtiene el día y el mes
			dataEntry = {...comp.fechaHora.diaDelAno(dataEntry), ...dataEntry};
		}

		// Tipo de fecha
		dataEntry.tipoFecha_id = procesos.altaEdicForm.tipoFecha_id(dataEntry, entidad);
		if (!dataEntry.prioridad_id) dataEntry.prioridad_id = procesos.altaEdicForm.prioridad_id(dataEntry, entidad);

		// Avatar
		const imgDerPers = procsCRUD.obtieneAvatar(dataEntry).edic;

		// Info para la vista
		const statusCreado = tema == "revisionEnts" && dataEntry.statusRegistro_id == creado_id;
		const ent = personajes ? "pers" : hechos ? "hecho" : "";
		const originalUrl = req.originalUrl;
		const DE = !!Object.keys(dataEntry).length;
		const prioridades = variables.prioridadesRCLV;
		const revisor = req.session.usuario && req.session.usuario.rolUsuario.revisorEnts;

		// Ir a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, origen, titulo},
			...{entidad, id, prodEntidad, prodID, edicID, familia: "rclv", ent, familia},
			...{personajes, hechos, temas, eventos, epocas_del_ano, prioridades},
			...{dataEntry, DE, imgDerPers, statusCreado},
			...{roles_igl, ap_mars, originalUrl, revisor},
			...{cartelGenerico: codigo == "edicion", cartelRechazo: tema == "revisionEnts"},
			...{omitirImagenDerecha: true, omitirFooter: true},
		});
	},
	// Puede venir de agregarProd, edicionProd, o detalleRCLV
	altaEdicGuardar: async (req, res) => {
		// Variables
		const {entidad, id, prodEntidad, prodID, eliminar} = req.query;
		const origen = req.query.origen ? req.query.origen : "DTR";
		let datos = {...req.body, ...req.query, opcional: true};
		const codigo = req.baseUrl + req.path;
		const userID = req.session.usuario.id;

		// Si recibimos un avatar, se completa la información
		if (req.file) {
			datos.avatar = req.file.filename;
			datos.tamano = req.file.size;
		}

		// Averigua si hay errores de validación y toma acciones
		const errores = await valida.consolidado(datos);
		if (errores.hay || eliminar) {
			// Guarda session y cookie
			req.session[entidad] = datos;
			res.cookie(entidad, datos, {maxAge: unDia});

			// Si se agregó un archivo avatar, lo elimina
			if (req.file && datos.avatar) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio/", datos.avatar);

			// Acciones si se eliminó la edición
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const condiciones = {[campo_id]: id, editadoPor_id: userID};
			if (eliminar) {
				// La elimina de la BD
				await BD_genericas.eliminaTodosPorCondicion("rclvs_edicion", condiciones);
				// Quita la porción de texto referida a 'eliminar=true'
				req.originalUrl = req.originalUrl.replace("&eliminar=true", "");
			}

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
				if (original.creadoPor_id == userID && original.status_registro.creado) {
					if (original.avatar) comp.gestionArchivos.elimina("./publico/imagenes/2-RCLVs/Revisar/", original.avatar);
				}
				// Si no está en status 'creado', borra el eventual avatar edicion
				else if (edicion && edicion.avatar)
					comp.gestionArchivos.elimina("./publico/imagenes/2-RCLVs/Revisar/", edicion.avatar);
			}
		}

		// Borra el RCLV en session y cookies
		if (req.session[entidad]) delete req.session[entidad];
		if (req.cookies[entidad]) res.clearCookie(entidad);

		// Obtiene el url de la siguiente instancia
		let destino = "/inactivar-captura/?entidad=" + entidad + "&id=" + (id ? id : 1) + "&origen=" + origen;
		if (origen == "EDP" || origen == "DTP") destino += "&prodEntidad=" + prodEntidad + "&prodID=" + prodID;

		// Redirecciona a la siguiente instancia
		return res.redirect(destino);
	},
};
