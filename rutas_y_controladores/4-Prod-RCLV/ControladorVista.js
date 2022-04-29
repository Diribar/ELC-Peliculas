"use strict";
// ************ Requires ************
const validarRCLV = require("../../funciones/Validar/RCLV");
const BD_genericas = require("../../funciones/BD/Genericas");
const especificas = require("../../funciones/Varias/Especificas");
const procesar = require("../../funciones/Procesar/RUD");

module.exports = {
	redireccionar: (req, res) => {
		// Detectar el origen
		let RCLV = {
			origen: req.query.origen,
			RCLV_entidad: req.query.RCLV_entidad,
		};
		//return res.send(RCLV)
		if (RCLV.origen == "datosPers") {
			// 1. Si se perdió la info anterior, volver a 'Palabra Clave'
			let datosPers = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
			if (!datosPers) return res.redirect("/producto/agregar/palabras-clave");
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
		} else if (RCLV.origen == "edicion") {
			// Completar RCLV
			RCLV.entidad = req.query.entidad;
			RCLV.prodID = req.query.id;
			RCLV.destino = "/producto/edicion/?entidad=" + RCLV.entidad + "&id=" + RCLV.prodID;
		}
		// Producto a RCLV
		RCLV.RCLV_nombre = especificas.entidadNombre(RCLV.RCLV_entidad);
		// Session y Cookie para RCLV
		req.session.RCLV = RCLV;
		res.cookie("RCLV", RCLV, {maxAge: unDia});
		// Redirigir
		return res.redirect("/producto/rclv/agregar/?entidad=" + RCLV.RCLV_entidad);
	},

	RCLV_Form: async (req, res) => {
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
		let tema = "rclv";
		let codigo = RCLV.RCLV_entidad;
		// Pasos exclusivos para Datos Personalizados
		if (RCLV.origen == "datosPers") {
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
		let procesos_canonizacion =
			codigo == "RCLV_personajes"
				? await BD_genericas.obtenerTodos("procesos_canonizacion", "orden").then((n) =>
						n.filter((m) => m.id.length == 3)
				  )
				: "";
		let roles_iglesia =
			codigo == "RCLV_personajes"
				? await BD_genericas.obtenerTodos("roles_iglesia", "orden").then((n) =>
						n.filter((m) => m.id.length == 3)
				  )
				: "";
		// 6. Render
		return res.render("0-VistaEstandar", {
			tema,
			codigo,
			titulo: "Agregar - " + RCLV.RCLV_nombre,
			link: req.originalUrl,
			dataEntry: RCLV,
			errores,
			meses,
			roles_iglesia,
			procesos_canonizacion,
		});
	},

	RCLV_Grabar: async (req, res) => {
		// 1. Si se perdió la info anterior => error
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
			return res.render("Errores", {informacion});
		}
		// Pasos exclusivos para Datos Personalizados
		if (RCLV.origen == "datosPers") {
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
		// 2. Generar información
		if (RCLV.RCLV_entidad == "RCLV_personajes" && req.body.enProcCan == "0") {
			delete req.body.proceso_canonizacion_id;
			delete req.body.rol_iglesia_id;
		}
		RCLV = {...req.body, ...RCLV};
		// 3. Averiguar si hay errores de validación
		let errores = await validarRCLV.RCLV_consolidado({...RCLV, entidad: RCLV.RCLV_entidad});
		// 4. Acciones si hay errores
		if (errores.hay) {
			req.session.RCLV = RCLV;
			res.cookie(RCLV, RCLV, {maxAge: unDia});
			req.session.erroresRCLV = errores;
			return res.redirect(req.url);
		}
		// Si no hay errores...
		let userID = req.session.usuario.id;
		// 5. Preparar la info a guardar
		let datos = {
			...RCLV,
			creado_por_id: userID,
		};
		// Obtener el día del año
		if (!RCLV.desconocida)
			datos.dia_del_ano_id = await BD_genericas.obtenerTodos("dias_del_ano", "id")
				.then((n) => n.find((m) => m.mes_id == RCLV.mes_id && m.dia == RCLV.dia))
				.then((n) => n.id);

		// 6. Crear el registro en la BD
		let {id} = await BD_genericas.agregarRegistro(RCLV.RCLV_entidad, datos);
		// Averiguar el campo para el RCLV-ID
		let RCLVentidad_id = especificas.entidad_id(RCLV.RCLV_entidad);
		// Agregar el RCLVentidad_id al origen
		if (RCLV.origen == "datosPers") {
			req.session.datosPers[RCLVentidad_id] = id;
			res.cookie("datosPers", req.session.datosPers, {maxAge: unDia});
		} else if (RCLV.origen == "edicion")
			await procesar.guardar_o_actualizar_Edicion(RCLV.entidad, RCLV.prodID, userID, {[RCLVentidad_id]: id});
		// Obtener el destino a dónde redireccionar
		// 8. Borrar session y cookies de RCLV
		if (req.session && req.session.RCLV) delete req.session.RCLV;
		if (req.cookies && req.cookies.RCLV) res.clearCookie("RCLV");
		// 9. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect(RCLV.destino);
	},
};
