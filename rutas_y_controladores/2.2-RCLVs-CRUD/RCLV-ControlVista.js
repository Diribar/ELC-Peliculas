"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./RCLV-FN-Procesos");
const valida = require("./RCLV-FN-Validar");

module.exports = {
	detalle: async (req, res) => {
		// Tema y Código
		const tema = "rclv_crud";
		const codigo = "detalle";

		// Variables
		let {entidad, id, origen} = req.query;
		let usuario = req.session.usuario ? req.session.usuario : "";
		let entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		if (!origen) origen = "DTR";
		const revisor = req.session.usuario && req.session.usuario.rol_usuario.revisor_ents;

		// Titulo
		const articulo = entidad == "epocas_del_ano" ? "a" : "";
		const titulo = "Detalle de un" + articulo + " " + entidadNombre;
		// Obtiene RCLV con productos
		let include = [...variables.entidades.prods, ...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("prods_ediciones", "status_registro", "creado_por", "sugerido_por", "alta_revisada_por");
		const original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		let edicion = usuario
			? await BD_genericas.obtienePorCondicion("rclvs_edicion", {[campo_id]: id, editado_por_id: usuario.id})
			: {};

		// Productos
		let prodsDelRCLV = await procesos.detalle.prodsDelRCLV(original, usuario);
		let cantProds = prodsDelRCLV.length;

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
		const status_id = original.status_registro_id;
		const statusEstable =
			codigo == "detalle" && ([creado_aprob_id, aprobado_id].includes(status_id) || status_id == inactivo_id);
		// Datos para la vista
		const procCanoniz = procesos.detalle.procCanoniz(original);
		const RCLVnombre = original.nombre;

		// Ir a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen, revisor},
			...{entidad, entidadNombre, id, familia, status_id, statusEstable},
			//familias,
			...{imgDerPers, bloqueDer},
			...{prodsDelRCLV, procCanoniz, RCLVnombre},
			userIdentVal: req.session.usuario && req.session.usuario.status_registro.ident_validada,
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
		const avatarsExternos = codigo != "agregar" ? variables.avatarsExternos.rclvs(dataEntry.nombre) : null;

		// Info para la vista
		const statusCreado = tema == "revisionEnts" && dataEntry.status_registro_id == creado_id;
		const ent = personajes ? "pers" : hechos ? "hecho" : "";
		const originalUrl = req.originalUrl;
		const DE = !!Object.keys(dataEntry).length;
		const prioridades = variables.prioridadesRCLV;
		const revisor = req.session.usuario && req.session.usuario.rol_usuario.revisor_ents;

		// Ir a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, origen, titulo},
			...{entidad, id, prodEntidad, prodID, edicID, familia: "rclv", ent, familia},
			...{personajes, hechos, temas, eventos, epocas_del_ano, prioridades},
			...{dataEntry, DE, statusCreado},
			...{roles_igl, ap_mars, originalUrl, revisor},
			...{cartelGenerico: codigo == "edicion", cartelRechazo: tema == "revisionEnts"},
			...{omitirImagenDerecha: true, omitirFooter: true, imgDerPers, avatarsExternos},
		});
	},
	// Puede venir de agregarProd, edicionProd, o detalleRCLV
	altaEdicGuardar: async (req, res) => {
		// Variables
		const {entidad, id, origen, prodEntidad, prodID, eliminar} = req.query;
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

			// Si se eliminó la edición, la borra de la BD
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const condiciones = {[campo_id]: id, editado_por_id: userID};
			if (eliminar) await BD_genericas.eliminaTodosPorCondicion("rclvs_edicion", condiciones);

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
				if (original.creado_por_id == userID && original.status_registro.creado) {
					if (original.avatar) comp.gestionArchivos.elimina("./publico/imagenes/2-RCLVs/Revisar/", original.avatar);
				}
				// Si no está en status 'creado', borra el eventual avatar edicion
				else if (edicion && edicion.avatar) comp.gestionArchivos.elimina("./publico/imagenes/2-RCLVs/Revisar/", edicion.avatar);
			}
		}

		// Borra el RCLV en session y cookies
		if (req.session[entidad]) delete req.session[entidad];
		if (req.cookies[entidad]) res.clearCookie(entidad);

		// Obtiene el url de la siguiente instancia
		let destino = "/inactivar-captura/?entidad=" + entidad + "&id=" + (id ? id : 1) + "&origen=" + origen;
		if (origen == "EDP" || origen == "DTP" || origen == "DTR") destino += "&prodEntidad=" + prodEntidad + "&prodID=" + prodID;

		// Redirecciona a la siguiente instancia
		return res.redirect(destino);
	},
};
