"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procesos = require("./FN-Procesos");
const validar = require("./FN-Validar");

module.exports = {
	altaEdicForm: async (req, res) => {
		// Puede venir de agregarProd o edicionProd
		// 1. Tema y Código
		const tema = req.baseUrl == "/rclv" ? "rclv_crud" : req.baseUrl == "/revision" ? "revisionEnts" : "";
		const codigo = req.path.slice(1, -1);
		const datos = req.query;
		// 2. Variables
		let entidad = req.query.entidad;
		let meses = await BD_genericas.obtenerTodos("meses", "id");
		let dataEntry = req.session[entidad]
			? req.session[entidad]
			: req.cookies[entidad]
			? req.cookies[entidad]
			: {};
		let nombre = comp.obtenerEntidadNombre(entidad);
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
			var procesos_canonizacion = await BD_genericas.obtenerTodos("procesos_canonizacion", "orden");
			procesos_canonizacion = procesos_canonizacion.filter((m) => m.id.length == 3);
			var roles_iglesia = await BD_genericas.obtenerTodos("roles_iglesia", "orden");
			roles_iglesia = roles_iglesia.filter((m) => m.id.length == 3);
			var apariciones_marianas = await BD_genericas.obtenerTodos("hechos", "nombre");
			apariciones_marianas = apariciones_marianas.filter((n) => n.ap_mar);
		}
		// 4. Pasos exclusivos para edición
		if (codigo != "agregar") {
			let id = req.query.id;
			let includes = entidad == "personajes" ? "rol_iglesia" : "";
			// Pisa el data entry de session
			dataEntry = await BD_genericas.obtenerPorIdConInclude(entidad, id, includes);
			if (dataEntry.dia_del_ano_id) {
				let dia_del_ano = await BD_genericas.obtenerTodos("dias_del_ano", "id").then((n) =>
					n.find((m) => m.id == dataEntry.dia_del_ano_id)
				);
				dataEntry.dia = dia_del_ano.dia;
				dataEntry.mes_id = dia_del_ano.mes_id;
			}
		}
		// Botón salir
		let rutaSalir = procesos.rutaSalir(codigo, datos);
		//console.log(rutaSalir);
		//console.log(dataEntry);
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
			procesos_canonizacion,
			apariciones_marianas,
			rutaSalir,
		});
	},
	altaEdicGrabar: async (req, res) => {
		// Puede venir de agregarProd o edicionProd
		// 1. Variables
		let {entidad, origen, prodEntidad, prodID} = req.query;
		let datos = {...req.body, ...req.query};
		// return res.send(datos)
		// 2. Averiguar si hay errores de validación y tomar acciones
		let errores = await validar.consolidado(datos);
		if (errores.hay) {
			req.session[entidad] = datos;
			res.cookie(entidad, datos, {maxAge: unDia});
			return res.redirect(req.originalUrl);
		}
		// 3. Obtiene el dataEntry
		let DE = await procesos.DE(datos);
		// Guarda los cambios del RCLV
		await procesos.guardarCambios(req, res, DE);
		// 9. Redireccionar a la siguiente instancia
		let destino =
			origen == "DP"
				? "/producto/agregar/datos-personalizados"
				: origen == "ED"
				? "/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID
				: origen == "DTP"
				? "/producto/detalle/?entidad=" + prodEntidad + "&id=" + prodID
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
		let entidadNombre = comp.obtenerEntidadNombre(entidad);
		// Obtener RCLV con produtos
		let entProductos = ["peliculas", "colecciones", "capitulos"];
		let includes = [...entProductos, "status_registro", "creado_por", "alta_analizada_por"];
		if (entidad == "personajes") includes.push("ap_mar", "proc_canoniz", "rol_iglesia");
		let RCLV = await BD_genericas.obtenerPorIdConInclude(entidad, RCLV_id, includes);
		// Productos
		let prodsYaEnBD = procesos.prodsYaEnBD(entProductos, RCLV);
		//let prodsNuevos = await procesos.prodsNuevos(RCLV);
		let cantProdsEnBD = prodsYaEnBD.length;
		// 5. Ir a la vista
		//return res.send(prodsYaEnBD);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Detalle de un " + entidadNombre,
			bloqueDerecha: await procesos.resumen({...RCLV, entidad}, cantProdsEnBD),
			omitirImagenDerecha: true,
			omitirFooter: false,
			prodsYaEnBD,
			// prodsNuevos,
			procCanoniz: await procesos.procCanoniz(RCLV),
			RCLVnombre: RCLV.nombre,
			entidad,
			RCLV_id,
			Entidad: comp.obtenerEntidadNombre(entidad)
		});
	},
};
