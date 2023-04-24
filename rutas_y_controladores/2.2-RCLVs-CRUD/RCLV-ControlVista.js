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
		// Puede venir de agregarProd o edicionProd
		// Tema y Código
		const tema = req.baseUrl == "/rclv" ? "rclv_crud" : req.baseUrl == "/revision" ? "revisionEnts" : "";
		const codigo = req.path.slice(1, -1); // Resultados posibles: 'agregar' o 'edicion'

		// Variables
		const {entidad, id} = req.query;
		const prodEntidad = req.query.prodEntidad;
		const prodID = req.query.prodID;
		const userID = req.session.usuario.id;
		const entidadNombre = comp.obtieneEntidadNombreDesdeEntidad(entidad);
		const titulo = (codigo == "agregar" ? "Agregar - " : codigo == "edicion" ? "Edición - " : "Revisar - ") + entidadNombre;
		const tituloCuerpo =
			(codigo == "agregar"
				? "Agregá un " + entidadNombre + " a"
				: codigo == "edicion"
				? "Editá el " + entidadNombre + " de"
				: "Revisá el " + entidadNombre + " de") + " nuestra Base de Datos";
		let dataEntry = req.session[entidad] ? req.session[entidad] : req.cookies[entidad] ? req.cookies[entidad] : {};
		let ap_mars, roles_igl;

		// Variables específicas para personajes
		if (entidad == "personajes") {
			roles_igl = roles_iglesia.filter((m) => m.personaje);
			ap_mars = await BD_genericas.obtieneTodos("hechos", "ano");
			ap_mars = ap_mars.filter((n) => n.ama);
		}

		// Pasos exclusivos para edición y revisión
		if (codigo != "agregar") {
			// Obtiene el original y edicion
			let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
			// Pisa el data entry de session
			dataEntry = {...original, ...edicion, id};
			// 3. Revisar error de revisión
			if (tema == "revisionEnts" && !dataEntry.status_registro.creado) res.redirect("/revision/tablero-de-control");
			// Obtiene el día y el mes
			dataEntry = {...comp.diaDelAno(dataEntry), ...dataEntry};
		}

		// Datos Duros - Avatar
		const imgDerPers = procsCRUD.obtieneAvatar(original, {...edicion, ...edicSession});
		const avatarLinksExternos = variables.avatarExternosRCLV(original.nombre);

		// Info para la vista
		const statusCreado = tema == "revisionEnts" && dataEntry.status_registro_id == creado_id;
		const origen = req.query.origen ? req.query.origen : tema == "revisionEnts" ? "TE" : "";
		const personajes = entidad == "personajes";
		const hechos = entidad == "hechos";
		const ent = personajes ? "pers" : hechos ? "hecho" : "";

		// Ir a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, origen},
			...{entidad, id, prodEntidad, prodID, familia: "rclv", ent},
			...{personajes, hechos, ent},
			...{titulo, tituloCuerpo},
			...{dataEntry, DE: !!Object.keys(dataEntry).length, statusCreado},
			...{roles_igl, ap_mars},
			...{cartelGenerico: codigo == "edicion", cartelRechazo: tema == "revisionEnts"},
			...{omitirImagenDerecha: true, omitirFooter: true},
			...{imgDerPers, avatarLinksExternos},
		});
	},
	altaEdicGrabar: async (req, res) => {
		// Puede venir de agregarProd o edicionProd

		// Variables
		let {entidad, id, origen, prodEntidad, prodID} = req.query;
		let datos = {...req.body, ...req.query};
		// Averigua si hay errores de validación y toma acciones
		let errores = await valida.consolidado(datos);
		if (errores.hay) {
			req.session[entidad] = datos;
			res.cookie(entidad, datos, {maxAge: unDia});
			return res.redirect(req.originalUrl);
		}
		// Obtiene el dataEntry
		let DE = procesos.altaEdicGrabar.procesaLosDatos(datos);
		// Guarda los cambios del RCLV
		await procesos.altaEdicGrabar.guardaLosCambios(req, res, DE);
		// Borra el RCLV en session y cookies
		if (req.session[entidad]) delete req.session[entidad];
		if (req.cookies[entidad]) res.clearCookie(entidad);
		// Obtiene el url de la siguiente instancia
		let destino =
			origen == "DA"
				? "/producto/agregar/datos-adicionales"
				: origen == "EDP"
				? "/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID
				: origen == "DTP"
				? "/producto/detalle/?entidad=" + prodEntidad + "&id=" + prodID
				: origen == "DTR"
				? "/rclv/detalle/?entidad=" + entidad + "&id=" + id
				: "/";
		// Redirecciona a la siguiente instancia
		return res.redirect(destino);
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
