"use strict";
// ************ Requires ************
const validar = require("../../funciones/4-Validaciones/RCLV");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const procesar = require("../../funciones/3-Procesos/3-RUD");

module.exports = {
	redireccionar: (req, res) => {
		// Se usa sobretodo para:
		// 	1. Estandarizar la ruta entre 'Agregar' y 'Edición'
		//	2. Guardar cookies
		// Detectar el origen
		let RCLV = {
			origen: req.query.origen,
			RCLV_entidad: req.query.RCLV_entidad,
		};
		let vistaRCLV = req.query.vistaRCLV;
		let RCLV_id = vistaRCLV != "agregar" ? req.query.RCLV_id : "";
		//return res.send(req.query)
		if (RCLV.origen == "prodAgregar") {
			// 1. Si se perdió la info anterior, volver al circuito de 'Agregar Producto'
			let datosPers = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
			if (!datosPers) return res.redirect("/producto/agregar/datos-personalizados");
			// Obtener los datos actualizados del formulario
			let datosActualizados = {...req.query};
			delete datosActualizados.origen;
			delete datosActualizados.RCLV_entidad;
			// Session y Cookie actualizados
			datosPers = {...datosPers, ...datosActualizados};
			req.session.datosPers = datosPers;
			res.cookie("datosPers", datosPers, {maxAge: unDia});
			// Completar RCLV
			RCLV.destino = "/producto/agregar/datos-personalizados";
		} else {
			// Completar RCLV
			RCLV.prodEntidad = req.query.entidad;
			RCLV.prodID = req.query.id;
			let origen = RCLV.origen.slice(4).toLowerCase();
			RCLV.destino = "/producto/" + origen + "/?entidad=" + RCLV.prodEntidad + "&id=" + RCLV.prodID;
		}
		// Producto a RCLV
		RCLV.RCLV_nombre = funciones.obtenerEntidadNombre(RCLV.RCLV_entidad);
		// Session y Cookie para RCLV
		req.session.RCLV = RCLV;
		res.cookie("RCLV", RCLV, {maxAge: unDia});
		// Redirigir
		let ruta = "/rclv/" + vistaRCLV;
		let url = "/?entidad=" + RCLV.RCLV_entidad + (RCLV_id ? "&id=" + RCLV_id : "");
		return res.redirect(ruta + url);
	},

	altaForm: async (req, res) => {
		// 1. Si se perdió la info anterior, ir a inicio
		let RCLV = req.session.RCLV ? req.session.RCLV : req.cookies.RCLV;
		if (!RCLV) {
			let informacion = {
				mensajes: ["Se perdió información crítica. Reiniciá este proceso."],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: req.session.urlAnterior,
						titulo: "Ir a la vista anterior",
					},
				],
			};
			return res.render("Errores", informacion);
		}
		// 2. Tema y Código
		let tema = "rclv_alta";
		let codigo = RCLV.RCLV_entidad;
		// Pasos exclusivos para Datos Personalizados
		if (RCLV.origen == "prodAgregar") {
			let datosPers = req.session.datosPers
				? req.session.datosPers
				: req.cookies.datosPers
				? req.cookies.datosPers
				: "";
			if (!datosPers) {
				let informacion = {
					mensajes: ["Se perdió información crítica. Reiniciá este proceso."],
					iconos: [
						{
							nombre: "fa-thumbs-up",
							link: "/producto/agregar/datos-duros",
							titulo: "Regresar al entorno de Agregar Productos",
						},
					],
				};
				return res.render("Errores", informacion);
			}
			if (!req.session.datosPers) req.session.datosPers = datosPers;
		}
		// 4. Errores
		let errores = req.session.erroresRCLV ? req.session.erroresRCLV : "";
		// 5. Bases de Datos para la vista
		let meses = await BD_genericas.obtenerTodos("meses", "id");
		if (codigo == "personajes") {
			var procesos_canonizacion = await BD_genericas.obtenerTodos("procesos_canonizacion", "orden");
			procesos_canonizacion = procesos_canonizacion.filter((m) => m.id.length == 3);
			var roles_iglesia = await BD_genericas.obtenerTodos("roles_iglesia", "orden");
			roles_iglesia = roles_iglesia.filter((m) => m.id.length == 3);
			var apariciones_marianas = await BD_genericas.obtenerTodos("hechos", "nombre");
			apariciones_marianas = apariciones_marianas.filter((n) => n.ap_mar);
		}

		// 6. Render
		return res.render("0-Estructura-Gral", {
			tema,
			codigo,
			titulo: "Agregar - " + RCLV.RCLV_nombre,
			link: req.originalUrl,
			dataEntry: RCLV,
			errores,
			meses,
			roles_iglesia,
			procesos_canonizacion,
			apariciones_marianas,
		});
	},

	altaGrabar: async (req, res) => {
		//return res.send(["línea 123", req.body])
		// 1. Si se perdió la info anterior => error
		let datosRCLV = req.session.RCLV ? req.session.RCLV : req.cookies.RCLV;
		if (!datosRCLV) {
			let informacion = {
				mensajes: ["Se perdió información crítica. Reiniciá este proceso."],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: req.session.urlAnterior,
						titulo: "Ir a la vista anterior",
					},
				],
			};
			return res.render("Errores", {informacion});
		}
		// 2. Pasos exclusivos para Datos Personalizados
		if (datosRCLV.origen == "prodAgregar") {
			let datosPers = req.session.datosPers
				? req.session.datosPers
				: req.cookies.datosPers
				? req.cookies.datosPers
				: "";
			if (!datosPers) {
				let informacion = {
					mensajes: ["Se perdió información crítica. Reiniciá este proceso."],
					iconos: [
						{
							nombre: "fa-thumbs-up",
							link: "/producto/agregar/datos-duros",
							titulo: "Regresar al entorno de Agregar Productos",
						},
					],
				};
				return res.render("Errores", informacion);
			}
			if (!req.session.datosPers) req.session.datosPers = datosPers;
		}
		datosRCLV = {...req.body, ...datosRCLV, entidad: datosRCLV.RCLV_entidad};
		// 3. Averiguar si hay errores de validación y tomar acciones
		let errores = await validar.consolidado(datosRCLV);
		if (errores.hay) {
			req.session.RCLV = RCLV;
			res.cookie(RCLV, RCLV, {maxAge: unDia});
			req.session.erroresRCLV = errores;
			return res.redirect(req.url);
		}
		// 4. Preparar la información a guardar
		let datos = {
			...datosRCLV,
			creado_por_id: req.session.usuario.id,
		};
		if (datosRCLV.RCLV_entidad == "personajes") {
			let santo_beato = datosRCLV.proceso_id.slice(0, 2);
			santo_beato = santo_beato == "ST" || santo_beato == "BT";
			datos = {
				...datos,
				subcategoria_id:
					datosRCLV.jss == "1" ? "JSS" : datosRCLV.cnt == "1" ? "CNT" : santo_beato ? "HAG" : null,
				santo_beato,
				ap_mar_id: datosRCLV.ap_mar_id != "" ? datosRCLV.ap_mar_id : null,
			};
		}
		// 5. Obtener el día del año
		if (!datosRCLV.desconocida)
			datos.dia_del_ano_id = await BD_genericas.obtenerTodos("dias_del_ano", "id")
				.then((n) => n.find((m) => m.mes_id == datosRCLV.mes_id && m.dia == datosRCLV.dia))
				.then((n) => n.id);

		//return res.send([datosRCLV, datos]);
		// 6. Crear el registro en la BD
		let {id} = await BD_genericas.agregarRegistro(datosRCLV.RCLV_entidad, datos);
		// Averiguar el campo para el RCLV-ID
		let RCLVentidad_id = funciones.obtenerEntidad_id(datosRCLV.RCLV_entidad);
		// Agregar el RCLVentidad_id al origen
		if (datosRCLV.origen == "prodAgregar") {
			req.session.datosPers[RCLVentidad_id] = id;
			res.cookie("datosPers", req.session.datosPers, {maxAge: unDia});
		} else if (datosRCLV.origen == "prodEdicion")
			await procesar.guardar_o_actualizar_Edicion(datosRCLV.entidad, datosRCLV.prodID, userID, {
				[RCLVentidad_id]: id,
			});
		// Obtener el destino a dónde redireccionar
		// 8. Borrar session y cookies de RCLV
		if (req.session && req.session.RCLV) delete req.session.RCLV;
		if (req.cookies && req.cookies.RCLV) res.clearCookie("RCLV");
		// 9. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect(datosRCLV.destino);
	},

	detalle: async (req, res) => {
		return res.send(req.query);
	},

	edicion: async (req, res) => {
		return res.send(req.query);
	},
};
