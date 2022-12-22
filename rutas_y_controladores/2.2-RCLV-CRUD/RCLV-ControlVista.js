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
		// 1. Tema y Código
		const tema = req.baseUrl == "/rclv" ? "rclv_crud" : req.baseUrl == "/revision" ? "revisionEnts" : "";
		const codigo = req.path.slice(1, -1);
		const datos = req.query;
		// 2. Variables
		let entidad = req.query.entidad;
		let rclvID = req.query.id;
		let userID = req.session.usuario.id;
		let meses = await BD_genericas.obtieneTodos("meses", "id");
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
		// 3. Variables específicas para personajes
		if (entidad == "personajes") {
			var procs_canon = await BD_genericas.obtieneTodos("procs_canon", "orden");
			procs_canon = procs_canon.filter((m) => m.id.length == 3);
			var roles_iglesia = await BD_genericas.obtieneTodos("roles_iglesia", "orden");
			roles_iglesia = roles_iglesia.filter((m) => m.id.length == 3);
			var apariciones_marianas = await BD_genericas.obtieneTodos("hechos", "nombre");
			apariciones_marianas = apariciones_marianas.filter((n) => n.ama);
		}
		// 4. Pasos exclusivos para edición
		if (codigo != "agregar") {
			// Obtiene el rclvOrig y rclvEdic
			let [rclvOrig, rclvEdic] = await procsCRUD.obtieneVersionesDelRegistro(
				entidad,
				rclvID,
				userID,
				"rclvs_edicion",
				"rclvs"
			);
			// Pisa el data entry de session
			dataEntry = {...rclvOrig, ...rclvEdic, id: rclvID};
			// 3. Revisar error de revisión
			if (tema == "revisionEnts" && !dataEntry.status_registro.creado)
				res.redirect("/revision/tablero-de-control");
			// Obtiene el día y el mes
			if (dataEntry.dia_del_ano_id) {
				let dia_del_ano = await BD_genericas.obtieneTodos("dias_del_ano", "id").then((n) =>
					n.find((m) => m.id == dataEntry.dia_del_ano_id)
				);
				dataEntry.dia = dia_del_ano.dia;
				dataEntry.mes_id = dia_del_ano.mes_id;
			}
		}
		// Botón salir
		let rutaSalir = procesos.rutaSalir(codigo, datos);
		// 5. Ir a la vista
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			entidad: entidad,
			titulo,
			tituloCuerpo,
			dataEntry,
			DE: !!Object.keys(dataEntry).length,
			meses,
			roles_iglesia,
			procs_canon,
			apariciones_marianas,
			rutaSalir,
		});
	},
	altaEdicGrabar: async (req, res) => {
		// Puede venir de agregarProd o edicionProd
		// 1. Variables
		let {entidad, id: rclvID, origen, prodEntidad, prodID} = req.query;
		let datos = {...req.body, ...req.query};
		// 2. Averigua si hay errores de validación y toma acciones
		let errores = await valida.consolidado(datos);
		if (errores.hay) {
			req.session[entidad] = datos;
			res.cookie(entidad, datos, {maxAge: unDia});
			return res.redirect(req.originalUrl);
		}
		// 3. Obtiene el dataEntry
		let DE = await procesos.procesaLosDatos(datos);
		// Guarda los cambios del RCLV
		await procesos.guardaLosCambios(req, res, DE);
		// 9. Redirecciona a la siguiente instancia
		let destino =
			origen == "DP"
				? "/producto/agregar/datos-personalizados"
				: origen == "ED"
				? "/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID
				: origen == "DTP"
				? "/producto/detalle/?entidad=" + prodEntidad + "&id=" + prodID
				: origen == "DT_RCLV"
				? "/rclv/detalle/?entidad=" + entidad + "&id=" + rclvID
				: "/";
		return res.redirect(destino);
	},
	detalle: async (req, res) => {
		// 1. Tema y Código
		const tema = "rclv_crud";
		const codigo = "detalle";
		// 2. Variables
		let entidad = req.query.entidad;
		let RCLV_id = req.query.id;
		let userID = req.session.usuario.id;
		let entidadNombre = comp.obtieneEntidadNombre(entidad);
		let entidadSingular = comp.obtieneEntidadSingular(entidad);
		// Obtiene RCLV con produtos
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
		let prodsEnBD = await procesos.prodsEnBD(RCLV, userID);
		let cantProdsEnBD = prodsEnBD.length;
		// 5. Ir a la vista
		// return res.send(prodsEnBD);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Detalle de un " + entidadNombre,
			bloqueDerecha: await procesos.resumen({...RCLV, entidad}, cantProdsEnBD),
			omitirImagenDerecha: true,
			omitirFooter: false,
			prodsEnBD,
			procCanoniz: await procesos.procCanoniz(RCLV),
			RCLVnombre: RCLV.nombre,
			entidad,
			RCLV_id,
			entidadNombre,
			entidadSingular,
		});
	},
};
