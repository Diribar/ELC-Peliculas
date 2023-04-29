"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./RCLV-FN-Procesos");
const valida = require("./RCLV-FN-Validar");

module.exports = {
	altaEdicForm: async (req, res) => {
		// Puede venir de: agregarProd, edicionProd, detalleRCLV, revision...
		// Tema y Código
		const tema = req.baseUrl == "/rclv" ? "rclv_crud" : req.baseUrl == "/revision" ? "revisionEnts" : "";
		const codigo = req.path.slice(1, -1); // Resultados posibles: 'agregar' o 'edicion'

		// Más variables
		const {entidad, id, prodEntidad, prodID} = req.query;
		const origen = req.query.origen ? req.query.origen : tema == "revisionEnts" ? "TE" : "";
		const userID = req.session.usuario.id;
		const revisor = req.session.usuario.rol_usuario.revisor_ents;
		const entidadNombre = comp.obtieneEntidadNombreDesdeEntidad(entidad);
		const familia = comp.obtieneFamiliaDesdeEntidad(entidad);
		let dataEntry = {};
		let ap_mars, roles_igl;

		// Configura el título de la vista
		const titulo = (codigo == "agregar" ? "Agregar - " : codigo == "edicion" ? "Edición - " : "Revisar - ") + entidadNombre;

		// Variables específicas para personajes
		if (entidad == "personajes") {
			roles_igl = roles_iglesia.filter((m) => m.personaje);
			ap_mars = await BD_genericas.obtieneTodos("hechos", "ano").then((n) => n.filter((m) => m.ama));
		}

		// Pasos exclusivos para edición y revisión
		if (codigo != "agregar") {
			// Obtiene el original y edicion
			let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
			// Pisa el data entry de session
			dataEntry = {...original, ...edicion, id};
			// Obtiene el día y el mes
			dataEntry = {...comp.diaDelAno(dataEntry), ...dataEntry};
		}

		// Tipo de fecha
		dataEntry.tipoFecha_id = false
			? false
			: dataEntry.fecha_movil
			? "FM"
			: dataEntry.dia_del_ano_id == 400
			? "SF"
			: dataEntry.dia_del_ano_id && dataEntry.dia_del_ano_id < 400
			? "FD"
			: entidad == "personajes" || entidad == "hechos"
			? "FD"
			: entidad == "eventos" || entidad == "epocas_del_ano"
			? "FM"
			: entidad == "temas"
			? "SF"
			: "";

		// Avatar
		const imgDerPers = procsCRUD.obtieneAvatar(codigo != "agregar" ? dataEntry : {dia_del_ano_id: 400}, {}).edic;
		const avatarLinksExternos = variables.avatarExternoRCLVs(codigo != "agregar" ? dataEntry.nombre : "@");

		// Info para la vista
		const statusCreado = tema == "revisionEnts" && dataEntry.status_registro_id == creado_id;
		const personajes = entidad == "personajes";
		const hechos = entidad == "hechos";
		const temas = entidad == "temas";
		const eventos = entidad == "eventos";
		const epocas_del_ano = entidad == "epocas_del_ano";
		const ent = personajes ? "pers" : hechos ? "hecho" : "";
		const prioridades = variables.prioridadesRCLV;
		const urlActual = req.path.slice(1);

		// Ir a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, origen, titulo},
			...{entidad, id, prodEntidad, prodID, familia: "rclv", ent, familia},
			...{personajes, hechos, temas, eventos, epocas_del_ano, prioridades},
			...{dataEntry, DE: !!Object.keys(dataEntry).length, statusCreado, revisor},
			...{roles_igl, ap_mars, urlActual},
			...{cartelGenerico: codigo == "edicion", cartelRechazo: tema == "revisionEnts"},
			...{omitirImagenDerecha: true, omitirFooter: true, imgDerPers, avatarLinksExternos},
		});
	},
	// Puede venir de agregarProd, edicionProd, o detalleRCLV
	altaEdicGrabar: async (req, res) => {
		// Variables
		const {entidad, id, origen, prodEntidad, prodID} = req.query;
		let datos = {...req.body, ...req.query, opcional: true};
		datos.revisor = req.session.usuario.rol_usuario.revisor_ents;

		// Si recibimos un avatar, se completa la información
		if (req.file) {
			datos.avatar = req.file.filename;
			datos.tamano = req.file.size;
		}

		// Averigua si hay errores de validación y toma acciones
		const errores = await valida.consolidado(datos);
		if (errores.hay) {
			req.session[entidad] = datos;
			res.cookie(entidad, datos, {maxAge: unDia});
			return res.redirect(req.originalUrl);
		}

		// Obtiene el dataEntry, guarda los cambios y mueve el archivo avatar del RCLV
		const DE = procesos.altaEdicGrabar.procesaLosDatos(datos);
		await procesos.altaEdicGrabar.guardaLosCambios(req, res, DE);

		// Borra el RCLV en session y cookies
		if (req.session[entidad]) delete req.session[entidad];
		if (req.cookies[entidad]) res.clearCookie(entidad);

		// Obtiene el url de la siguiente instancia
		const link = "/inactivar-captura/?entidad=" + entidad + "&id=" + (id ? id : 1) + "&origen=" + origen;
		// + prodEntidad + "&id=" + req.query.id + "&origen="+origen,
		if (origen == "EDP" || origen == "DTP" || origen == "DTR") link += "&prodEntidad=" + prodEntidad + "&prodID=" + prodID;

		// Redirecciona a la siguiente instancia
		return res.redirect(link);
	},
	detalle: async (req, res) => {
		// Tema y Código
		const tema = "rclv_crud";
		const codigo = "detalle";

		// Variables
		let {entidad, id, origen} = req.query;
		let usuario = req.session.usuario ? req.session.usuario : "";
		let entidadNombre = comp.obtieneEntidadNombreDesdeEntidad(entidad);
		const familia = comp.obtieneFamiliaDesdeEntidad(entidad);
		// const familias = comp.obtieneFamiliasDesdeEntidad(entidad);
		if (!origen) origen = "DTR";
		const revisor_ents = req.session.usuario.rol_usuario.revisor_ents;

		// Titulo
		const titulo = "Detalle de un " + entidadNombre;
		// Obtiene RCLV con productos
		let include = [...variables.entidadesProd, ...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("prods_edicion", "status_registro", "creado_por", "sugerido_por", "alta_revisada_por");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

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
			registro: procsCRUD.bloqueRegistro({registro: original, revisor: revisor_ents, cantProds}),
		};
		// Imagen Derecha
		const imgDerPers = procsCRUD.obtieneAvatar(original).orig;
		// Status de la entidad
		const status_id = original.status_registro_id;
		const statusEstable =
			codigo == "detalle" && ([creado_aprob_id, aprobado_id].includes(status_id) || status_id == inactivo_id);
		// Datos para la vista
		const procCanoniz = procesos.detalle.procCanoniz(original);
		const RCLVnombre = original.nombre;
		// Ir a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen},
			...{entidad, entidadNombre, id, familia, status_id, statusEstable},
			//familias,
			...{imgDerPers, bloqueDer},
			...{prodsDelRCLV, procCanoniz, RCLVnombre},
			userIdentVal: req.session.usuario && req.session.usuario.status_registro.ident_validada,
		});
	},
};
