"use strict";
// ************ Requires ************
const validar = require("../../funciones/4-Validaciones/RCLV");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const procesar = require("../../funciones/3-Procesos/3-RUD");

module.exports = {
	altaEdicForm: async (req, res) => {
		// ALTA - EDICIÓN / Puede venir de agregarProd o edicionProd
		// 1. Variables
		let url = req.url.slice(1);
		let agregar_edicion = url.slice(0, url.indexOf("/"));
		let tema = "rclv_" + agregar_edicion;
		let entidad = req.query.entidad;
		let meses = await BD_genericas.obtenerTodos("meses", "id");
		let dataEntry = req.session.datosRCLV
			? req.session.datosRCLV
			: req.cookies.datosRCLV
			? req.cookies.datosRCLV
			: {};
		let nombre = funciones.obtenerEntidadNombre(entidad);
		let titulo = (agregar_edicion == "agregar" ? "Agregar - " : "Edición - ") + nombre;
		let tituloCuerpo =
			(agregar_edicion == "agregar" ? "Agregá un " + nombre + " a" : "Editá el " + nombre + " de") +
			" nuestra Base de Datos";
		// 2. Variables específicas para personajes
		if (entidad == "personajes") {
			var procesos_canonizacion = await BD_genericas.obtenerTodos("procesos_canonizacion", "orden");
			procesos_canonizacion = procesos_canonizacion.filter((m) => m.id.length == 3);
			var roles_iglesia = await BD_genericas.obtenerTodos("roles_iglesia", "orden");
			roles_iglesia = roles_iglesia.filter((m) => m.id.length == 3);
			var apariciones_marianas = await BD_genericas.obtenerTodos("hechos", "nombre");
			apariciones_marianas = apariciones_marianas.filter((n) => n.ap_mar);
		}
		// 3. Pasos exclusivos para edición
		if (agregar_edicion == "edicion") {
			let id = req.query.id;
			dataEntry = await BD_genericas.obtenerPorId(entidad, id);
			if (dataEntry.dia_del_ano_id) {
				let dia_del_ano = await BD_genericas.obtenerTodos("dias_del_ano", "id").then((n) =>
					n.find((m) => m.id == dataEntry.dia_del_ano_id)
				);
				dataEntry.dia = dia_del_ano.dia;
				dataEntry.mes_id = dia_del_ano.mes_id;
			}
		}
		// 4. Render
		return res.render("0-Estructura-Gral", {
			tema,
			entidad: entidad,
			titulo,
			tituloCuerpo,
			link: req.originalUrl,
			dataEntry,
			meses,
			roles_iglesia,
			procesos_canonizacion,
			apariciones_marianas,
			agregar_edicion,
		});
	},

	altaEdicGrabar: async (req, res) => {
		// Puede venir de agregarProd o edicionProd
		// 1. Obtener los datos
		let entidad = req.query.entidad;
		let id = req.query.id;
		let datos = {...req.body, ...req.query};
		// return res.send(datos)
		// 2. Averiguar si hay errores de validación y tomar acciones
		let errores = await validar.consolidado(datos);
		if (errores.hay) {
			req.session.datosRCLV = datos;
			res.cookie("datosRCLV", datos, {maxAge: unDia});
			return res.redirect(req.url);
		}
		// 3. Obtener el día del año
		if (!datos.desconocida)
			datos.dia_del_ano_id = await BD_genericas.obtenerTodos("dias_del_ano", "id")
				.then((n) => n.find((m) => m.mes_id == datos.mes_id && m.dia == datos.dia))
				.then((n) => n.id);
		// 4. Datos para personjes
		if (datos.entidad == "personajes" && datos.categoria_id == "CFC") {
			let santo_beato = datos.proceso_id.startsWith("ST") || datos.proceso_id.startsWith("BT");
			datos = {
				...datos,
				subcategoria_id:
					datos.jss == "1" ? "JSS" : datos.cnt == "1" ? "CNT" : santo_beato ? "HAG" : null,
				santo_beato,
				ap_mar_id: datos.ap_mar_id != "" ? datos.ap_mar_id : null,
			};
		}
		if (datos.proceso_id === "") datos.proceso_id = null;
		if (datos.rol_iglesia_id === "") datos.rol_iglesia_id = null;
		if (datos.ap_mar_id === "") datos.ap_mar_id = null;
		// 3. Preparar la información a guardar
		let url = req.url.slice(1);
		let agregar_edicion = url.slice(0, url.indexOf("/"));
		if (agregar_edicion == "agregar") {
			datos.creado_por_id = req.session.usuario.id;
			// 5. Crear el registro RCLV en la BD
			id = await BD_genericas.agregarRegistro(entidad, datos).then((n) => n.id);
			console.log(id);
		} else if (agregar_edicion == "edicion") {
			datos = {...datos, editado_por_id: req.session.usuario.id, editado_en: funciones.ahora()};
			//return res.send([datos, datos]);
			// si es el mismo usuario y está recién creado, pisa
			// de lo contrario, ídem productos
			// guarda sólo las diferencias
			// crea un registro de edición
			// si está en status creado, no permite editarlo
			// 6. Actualizar el registro RCLV en la BD
			await BD_genericas.actualizarPorId(entidad, id, datos);
		}
		// 8. Borrar session y cookies de RCLV
		if (req.session && req.session.datosRCLV) delete req.session.datosRCLV;
		if (req.cookies && req.cookies.datosRCLV) res.clearCookie("datosRCLV");
		// 9. Redireccionar a la siguiente instancia
		return res.redirect("/rclv/detalle/?entidad=" + entidad + "&id=" + id);
	},

	detalle: async (req, res) => {
		return res.send(req.query);
	},

	edicion: async (req, res) => {
		return res.send(req.query);
	},
};
