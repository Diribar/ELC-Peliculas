"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./RCLV-Procesos");
const valida = require("./RCLV-Validar");

module.exports = {
	altaEdicForm: async (req, res) => {
		// Puede venir de agregarProd o edicionProd
		// Tema y Código
		const tema = req.baseUrl == "/rclv" ? "rclv_crud" : req.baseUrl == "/revision" ? "revisionEnts" : "";
		const codigo = req.path.slice(1, -1);
		const datos = req.query;

		// Variables
		let entidad = req.query.entidad;
		let id = req.query.id;
		let userID = req.session.usuario.id;
		let dataEntry = req.session[entidad] ? req.session[entidad] : req.cookies[entidad] ? req.cookies[entidad] : {};
		let nombre = comp.obtieneEntidadNombre(entidad);
		let titulo = (codigo == "agregar" ? "Agregar - " : codigo == "edicion" ? "Edición - " : "Revisar - ") + nombre;
		let tituloCuerpo =
			(codigo == "agregar"
				? "Agregá un " + nombre + " a"
				: codigo == "edicion"
				? "Editá el " + nombre + " de"
				: "Revisá el " + nombre + " de") + " nuestra Base de Datos";
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
			dataEntry = comp.diaDelAno(dataEntry);
		}

		// Info para la vista
		let rutaSalir = comp.rutaSalir(tema, codigo, datos);
		let motivos = tema == "revisionEnts" ? altas_motivos_rech.filter((n) => n.rclvs) : "";
		// Ir a la vista
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			entidad,
			id,
			origen: req.query.origen,
			familia: comp.obtieneFamiliaEnSingular(entidad),
			vista: req.baseUrl + req.path,
			personajes: entidad == "personajes",
			hechos: entidad == "hechos",
			titulo,
			tituloCuerpo,
			dataEntry,
			DE: !!Object.keys(dataEntry).length,
			roles_igl,
			ap_mars,
			rutaSalir,
			institucional: true,
			cartelGenerico: codigo == "edicion",
			cartelRechazo: tema == "revisionEnts",
			motivos,
			urlActual: req.session.urlActual,
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
				: origen == "ED"
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
		// 1. Tema y Código
		const tema = "rclv_crud";
		const codigo = "detalle";
		// 2. Variables
		let entidad = req.query.entidad;
		let id = req.query.id;
		let usuario = req.session.usuario ? req.session.usuario : "";
		let entidadNombre = comp.obtieneEntidadNombre(entidad);

		// Obtiene RCLV con productos
		let include = [...variables.entidadesProd, ...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("prods_edicion", "status_registro", "creado_por", "alta_analizada_por");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// Productos
		let prodsDelRCLV = await procesos.detalle.prodsDelRCLV(original, usuario);
		let cantProds = prodsDelRCLV.length;

		// Ir a la vista
		// return res.send(prodsDelRCLV);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Detalle de un " + entidadNombre,
			entidad,
			id,
			origen: req.query.origen,
			familia: comp.obtieneFamiliaEnSingular(entidad),
			vista: req.baseUrl + req.path,
			bloqueDerecha: await procesos.detalle.bloqueDerecha({...original, entidad}, cantProds),
			omitirImagenDerecha: true,
			omitirFooter: false,
			prodsDelRCLV,
			procCanoniz: await procesos.detalle.procCanoniz(original),
			RCLVnombre: original.nombre,
			entidadNombre,
		});
	},
};
