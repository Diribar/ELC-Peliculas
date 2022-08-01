"use strict";
// ************ Requires ************
const validar = require("../../funciones/4-Validaciones/RCLV");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const procesar = require("../../funciones/3-Procesos/3-RUD");

module.exports = {
	redireccionar: (req, res) => {
		//return res.send(req.query)
		// Se usa sobretodo para:
		// 	1. Estandarizar la ruta entre 'Agregar' y 'Edición'
		//	2. Guardar cookies
		let datosRCLV = {
			origen: req.query.origen,
			RCLV_entidad: req.query.RCLV_entidad,
		};
		let vistaRCLV = req.query.vistaRCLV;
		let RCLV_id = req.query.RCLV_id ? req.query.RCLV_id : "";
		if (datosRCLV.origen == "prodAgregar") {
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
			datosRCLV.destino = "/producto/agregar/datos-personalizados";
		} else if (datosRCLV.origen == "prodEdicion") {
			// Completar RCLV
			datosRCLV.prodEntidad = req.query.entidad;
			datosRCLV.prodID = req.query.id;
			datosRCLV.destino =
				"/producto/edicion/?entidad=" + datosRCLV.prodEntidad + "&id=" + datosRCLV.prodID;
		}
		// Producto a RCLV
		datosRCLV.RCLV_nombre = funciones.obtenerEntidadNombre(datosRCLV.RCLV_entidad);
		// Session y Cookie para RCLV
		req.session.datosRCLV = datosRCLV;
		res.cookie("datosRCLV", datosRCLV, {maxAge: unDia});
		// Redirigir
		let ruta = "/rclv/" + vistaRCLV;
		let url = "/?entidad=" + datosRCLV.RCLV_entidad + (RCLV_id ? "&id=" + RCLV_id : "");
		return res.redirect(ruta + url);
	},

	altaEdicForm: async (req, res) => {
		//return res.send(req.query)
		// ALTA - EDICIÓN / Puede venir de agregarProd o edicionProd
		// 1. Si se perdió la info anterior, ir a inicio
		let datosRCLV = req.session.datosRCLV ? req.session.datosRCLV : req.cookies.datosRCLV;
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
			return res.render("Errores", informacion);
		}
		// 2. Variables
		let url = req.url.slice(1);
		let agregar_edicion = url.slice(0, url.indexOf("/"));
		let tema = "rclv_" + agregar_edicion;
		let RCLV_entidad = req.query.entidad;
		let dataEntry = datosRCLV;
		// 3. Pasos exclusivos para Datos Personalizados
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
		// 4. Variables para la vista
		let meses = await BD_genericas.obtenerTodos("meses", "id");
		if (RCLV_entidad == "personajes") {
			var procesos_canonizacion = await BD_genericas.obtenerTodos("procesos_canonizacion", "orden");
			procesos_canonizacion = procesos_canonizacion.filter((m) => m.id.length == 3);
			var roles_iglesia = await BD_genericas.obtenerTodos("roles_iglesia", "orden");
			roles_iglesia = roles_iglesia.filter((m) => m.id.length == 3);
			var apariciones_marianas = await BD_genericas.obtenerTodos("hechos", "nombre");
			apariciones_marianas = apariciones_marianas.filter((n) => n.ap_mar);
		}
		let titulo = (agregar_edicion == "agregar" ? "Agregar - " : "Edición - ") + datosRCLV.RCLV_nombre;
		let tituloCuerpo =
			(agregar_edicion == "agregar"
				? "Agregá un " + dataEntry.RCLV_nombre + " a"
				: "Editá el " + dataEntry.RCLV_nombre + " de") + " nuestra Base de Datos";
		// 6. Pasos exclusivos para edición
		if (agregar_edicion == "edicion") {
			let RCLV_id = req.query.id;
			dataEntry = {
				...(await BD_genericas.obtenerPorId(RCLV_entidad, RCLV_id)),
				...dataEntry,
			};
			if (dataEntry.dia_del_ano_id) {
				let dia_del_ano = await BD_genericas.obtenerTodos("dias_del_ano", "id").then((n) =>
					n.find((m) => m.id == dataEntry.dia_del_ano_id)
				);
				dataEntry.dia = dia_del_ano.dia;
				dataEntry.mes_id = dia_del_ano.mes_id;
			}
		}
		//return res.send(dataEntry)
		// 7. Render
		return res.render("0-Estructura-Gral", {
			tema,
			entidad: RCLV_entidad,
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

	altaGrabar: async (req, res) => {
		// Puede venir de agregarProd o edicionProd
		// 1. Si se perdió la info anterior => error
		let datosRCLV = req.session.datosRCLV ? req.session.datosRCLV : req.cookies.datosRCLV;
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
			req.session.datosRCLV = datosRCLV;
			res.cookie("datosRCLV", datosRCLV, {maxAge: unDia});
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
		let {id: RCLV_id} = await BD_genericas.agregarRegistro(datosRCLV.RCLV_entidad, datos);
		// Averiguar el campo para el RCLV-ID
		let RCLV_entidad_id = funciones.obtenerEntidad_id(datosRCLV.RCLV_entidad);
		// Agregar el RCLV_entidad_id al origen
		if (datosRCLV.origen == "prodAgregar") {
			req.session.datosPers[RCLV_entidad_id] = RCLV_id;
			res.cookie("datosPers", req.session.datosPers, {maxAge: unDia});
		} else if (datosRCLV.origen == "prodEdicion")
			await procesar.guardar_o_actualizar_Edicion(datosRCLV.entidad, datosRCLV.prodID, userID, {
				[RCLV_entidad_id]: RCLV_id,
			});
		// 8. Borrar session y cookies de RCLV
		if (req.session && req.session.datosRCLV) delete req.session.datosRCLV;
		if (req.cookies && req.cookies.datosRCLV) res.clearCookie("RCLV");
		// 9. Redireccionar a la siguiente instancia
		return res.redirect(datosRCLV.destino);
	},

	edicionGrabar: async (req, res) => {
		// Puede venir de agregarProd o edicionProd
		//return res.send([req.query,req.body])
		// 1. Si se perdió la info anterior => error
		let datosRCLV = req.session.datosRCLV ? req.session.datosRCLV : req.cookies.datosRCLV;
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
		// Obtener los datos identificatorios del RCLV
		let RCLV_entidad = req.query.entidad;
		let RCLV_id = req.query.id;
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
							link: "/producto/agregar/datos-personalizados",
							titulo: "Regresar al entorno de Agregar Productos",
						},
					],
				};
				return res.render("Errores", informacion);
			}
			if (!req.session.datosPers) req.session.datosPers = datosPers;
		}
		datosRCLV = {...datosRCLV, ...req.body, entidad: RCLV_entidad, id: RCLV_id};
		// 3. Averiguar si hay errores de validación y tomar acciones
		//return res.send(datosRCLV);
		let errores = await validar.consolidado(datosRCLV);
		if (errores.hay) {
			req.session.datosRCLV = datosRCLV;
			res.cookie("datosRCLV", datosRCLV, {maxAge: unDia});
			return res.redirect(req.url);
		}
		// 4. Preparar la información a guardar
		let datos = {
			...datosRCLV,
			editado_por_id: req.session.usuario.id,
			editado_en: funciones.ahora(),
		};
		if (RCLV_entidad == "personajes") {
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
		// 6. Actualizar el registro RCLV en la BD
		await BD_genericas.actualizarPorId(RCLV_entidad, RCLV_id, datos);
		// 8. Borrar session y cookies de RCLV
		if (req.session && req.session.datosRCLV) delete req.session.datosRCLV;
		if (req.cookies && req.cookies.datosRCLV) res.clearCookie("datosRCLV");
		// 9. Redireccionar a la siguiente instancia
		return res.redirect(datosRCLV.destino);
	},

	detalle: async (req, res) => {
		return res.send(req.query);
	},

	edicion: async (req, res) => {
		return res.send(req.query);
	},
};
