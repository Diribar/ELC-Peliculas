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
		let rclvID = req.query.id;
		let userID = req.session.usuario.id;
		let dataEntry = req.session[entidad]
			? req.session[entidad]
			: req.cookies[entidad]
			? req.cookies[entidad]
			: {};
		let nombre = comp.obtieneEntidadNombre(entidad);
		let titulo =
			(codigo == "agregar" ? "Agregar - " : codigo == "edicion" ? "Edición - " : "Revisar - ") + nombre;
		let tituloCuerpo =
			(codigo == "agregar"
				? "Agregá un " + nombre + " a"
				: codigo == "edicion"
				? "Editá el " + nombre + " de"
				: "Revisá el " + nombre + " de") + " nuestra Base de Datos";
		let ap_mars, roles_igl, procesos_canon;
		// Variables específicas para personajes
		if (entidad == "personajes") {
			roles_igl = roles_iglesia.filter((m) => m.personaje);
			procesos_canon = procs_canon.filter((m) => m.id.length == 3);
			ap_mars = await BD_genericas.obtieneTodos("hechos", "ano");
			ap_mars = ap_mars.filter((n) => n.ama);
		}
		// Pasos exclusivos para edición y revisión
		if (codigo != "agregar") {
			// Obtiene el rclvOrig y rclvEdic
			let [rclvOrig, rclvEdic] = await procsCRUD.obtieneOriginalEdicion(entidad, rclvID, userID);
			// Pisa el data entry de session
			dataEntry = {...rclvOrig, ...rclvEdic, id: rclvID};
			// 3. Revisar error de revisión
			if (tema == "revisionEnts" && !dataEntry.status_registro.creado)
				res.redirect("/revision/tablero-de-control");
			// Obtiene el día y el mes
			dataEntry = comp.diaDelAno(dataEntry);
		}
		// Botón salir
		let rutaSalir = comp.rutaSalir(tema, codigo, datos);
		// Ir a la vista
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			entidad,
			personajes: entidad == "personajes",
			hechos: entidad == "hechos",
			titulo,
			tituloCuerpo,
			dataEntry,
			DE: !!Object.keys(dataEntry).length,
			meses,
			epocas,
			roles_igl,
			procesos_canon,
			ap_mars,
			sexos,
			rutaSalir,
			institucional: true,
		});
	},
	altaEdicGrabar: async (req, res) => {
		// Puede venir de agregarProd o edicionProd

		// Variables
		let {entidad, id: rclvID, origen, prodEntidad, prodID} = req.query;
		let datos = {...req.body, ...req.query};
		// Averigua si hay errores de validación y toma acciones
		let errores = await valida.consolidado(datos);
		if (errores.hay) {
			req.session[entidad] = datos;
			res.cookie(entidad, datos, {maxAge: unDia});
			return res.redirect(req.originalUrl);
		}
		// Obtiene el dataEntry
		let DE = procesos.procesaLosDatos(datos);
		// Guarda los cambios del RCLV
		await procesos.guardaLosCambios(req, res, DE);
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
				: origen == "DT_RCLV"
				? "/rclv/detalle/?entidad=" + entidad + "&id=" + rclvID
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
		let RCLV_id = req.query.id;
		let userID = req.session.usuario ? req.session.usuario.id : "";
		let entidadNombre = comp.obtieneEntidadNombre(entidad);
		// Obtiene RCLV con productos
		let includes = [
			...variables.entidadesProd,
			"prods_edicion",
			"status_registro",
			"creado_por",
			"alta_analizada_por",
		];
		if (entidad == "personajes") includes.push("ap_mar", "proc_canon", "rol_iglesia");
		let RCLV = await BD_genericas.obtienePorIdConInclude(entidad, RCLV_id, includes);
		// Productos
		let prodsDelRCLV = await procesos.prodsDelRCLV(RCLV, userID);
		let cantProds = prodsDelRCLV.length;
		// Ir a la vista
		// return res.send(prodsDelRCLV);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Detalle de un " + entidadNombre,
			bloqueDerecha: await procesos.bloqueDerecha({...RCLV, entidad}, cantProds),
			omitirImagenDerecha: true,
			omitirFooter: false,
			prodsDelRCLV,
			procCanoniz: await procesos.procCanoniz(RCLV),
			RCLVnombre: RCLV.nombre,
			entidad,
			RCLV_id,
			entidadNombre,
		});
	},
};
