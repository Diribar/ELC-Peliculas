// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/RCLV-Errores");
let BD_varias = require("../../funciones/BD/varias");
let procesar = require("../../funciones/Prod-RUD/1-Procesar");

// *********** Controlador ***********
module.exports = {
	home: (req, res) => {
		tema = "miscelaneas";
		codigo = "inicio";
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Inicio",
		});
	},

	nosotros: (req, res) => {
		tema = "miscelaneas";
		codigo = "nosotros";
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Quiénes somos",
		});
	},

	RCLV: (req, res) => {
		// Detectar el origen
		let origen = req.query.origen;
		let RCLV = {origen};
		if (origen == "datosPers") {
			// 1. Si se perdió la info anterior, volver a 'Palabra Clave'
			let datosPers = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
			if (!datosPers) return res.redirect("/producto/agregar/palabras-clave");
			// Obtener los datos actualizados del formulario
			let datosActualizados = {...req.query};
			delete datosActualizados.origen;
			delete datosActualizados.entidad_RCLV;
			// Session y Cookie actualizados
			datosPers = {...datosPers, ...datosActualizados};
			req.session.datosPers = datosPers;
			res.cookie("datosPers", datosPers, {maxAge: 24 * 60 * 60 * 1000});
			// Completar RCLV
			RCLV.entidad_RCLV = datosPers.entidad_RCLV;
			RCLV.destino = "/producto/agregar/datos-personalizados";
		} else if (origen == "edicion") {
			// Completar RCLV
			RCLV.entidad = req.query.entidad;
			RCLV.producto_id = req.query.id;
			RCLV.entidad_RCLV = req.query.entidad_RCLV;
			RCLV.destino = "/producto/edicion/?entidad=" + RCLV.entidad + "&id=" + RCLV.producto_id;
		}
		// Producto a RCLV
		RCLV.producto_RCLV =
			RCLV.entidad_RCLV == "RCLV_personajes_historicos"
				? "Personaje Histórico"
				: RCLV.entidad_RCLV == "RCLV_hechos_historicos"
				? "Hecho Histórico"
				: RCLV.entidad_RCLV == "RCLV_valores"
				? "Valor"
				: "";
		// Session y Cookie para RCLV
		req.session.RCLV = RCLV;
		res.cookie("RCLV", RCLV, {maxAge: 24 * 60 * 60 * 1000});
		// Redirigir
		return res.redirect("/agregar/" + RCLV.entidad_RCLV);
	},

	RCLV_Form: async (req, res) => {
		// 1. Si se perdió la info anterior, ir a inicio
		let RCLV = req.session.RCLV ? req.session.RCLV : req.cookies.RCLV;
		if (!RCLV)
			return res.send(
				"Se perdió información crítica. Tenga cuidado de no completar este formulario en 2 pestañas distintas, o que no pase 1 día sin completarlo."
			);
		// 2. Tema y Código
		tema = "miscelaneas";
		codigo = RCLV.entidad_RCLV;
		// Pasos exclusivos para Datos Personalizados
		if (RCLV.origen == "datosPers") {
			datosPers = req.session.datosPers
				? req.session.datosPers
				: req.cookies.datosPers
				? req.cookies.datosPers
				: "";
			if (!datosPers) return res.redirect("/producto/agregar/datos-duros");
			if (!req.session.datosPers) req.session.datosPers = datosPers;
		}
		// 4. Errores
		let errores = req.session.erroresRCLV ? req.session.erroresRCLV : "";
		// 5. Bases de Datos para la vista
		let meses = await BD_varias.obtenerTodos("meses", "id");
		if (codigo == "RCLV_personajes_historicos") {
			procesos_canonizacion = await BD_varias.obtenerTodos(
				"procesos_canonizacion",
				"orden"
			).then((n) => n.filter((m) => m.id.length == 3));
			roles_iglesia = await BD_varias.obtenerTodos("roles_iglesia", "orden").then((n) =>
				n.filter((m) => m.id.length == 3)
			);
		} else {
			procesos_canonizacion = [];
			roles_iglesia = [];
		}
		// 6. Render
		//return res.send(errores);
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Agregar - " + RCLV.producto_RCLV,
			link: req.originalUrl,
			dataEntry: RCLV,
			errores,
			meses,
			roles_iglesia,
			procesos_canonizacion,
		});
	},

	RCLV_Grabar: async (req, res) => {
		// 1. Si se perdió la info anterior, ir a inicio
		let RCLV = req.session.RCLV ? req.session.RCLV : req.cookies.RCLV;
		if (!RCLV)
			return res.send(
				"Se perdió información crítica. Tenga cuidado de no completar este formulario en 2 pestañas distintas, o que no pase 1 día sin completarlo."
			);
		// Pasos exclusivos para Datos Personalizados
		if (RCLV.origen == "datosPers") {
			datosPers = req.session.datosPers
				? req.session.datosPers
				: req.cookies.datosPers
				? req.cookies.datosPers
				: "";
			if (!datosPers)
				return res.send(
					"Se perdió información crítica. Tenga cuidado de que no pase 1 día sin completarlo."
				);
			if (!req.session.datosPers) req.session.datosPers = datosPers;
		}
		// 2. Generar información
		if (RCLV.entidad_RCLV == "RCLV_personajes_historicos" && req.body.enProcCan == "0") {
			delete req.body.proceso_canonizacion_id;
			delete req.body.rol_iglesia_id;
		}
		RCLV = {...req.body, ...RCLV};
		// 3. Averiguar si hay errores de validación
		let errores = await validarRCLV.RCLV_consolidado({...RCLV, entidad: RCLV.entidad_RCLV});
		// 4. Acciones si hay errores
		if (errores.hay) {
			req.session.RCLV = RCLV;
			res.cookie(RCLV, RCLV, {maxAge: 24 * 60 * 60 * 1000});
			req.session.erroresRCLV = errores;
			return res.redirect(req.url);
		}
		// Si no hay errores...
		// 5. Preparar la info a guardar
		datos = {
			...RCLV,
			creada_por_id: req.session.usuario.id,
		};
		// Obtener el día del año
		if (!RCLV.desconocida)
			datos.dia_del_ano_id = await BD_varias.obtenerTodos("dias_del_ano", "id")
				.then((n) => n.find((m) => m.mes_id == RCLV.mes_id && m.dia == RCLV.dia))
				.then((n) => n.id);

		// 6. Crear el registro en la BD
		let {id: RCLV_id} = await BD_varias.agregarRegistro({
			...datos,
			entidad: RCLV.entidad_RCLV,
		});
		// Averiguar el campo para el RCLV-ID
		campo = RCLV.entidad_RCLV.includes("personaje")
			? "personaje_historico_id"
			: RCLV.entidad_RCLV.includes("hecho")
			? "hecho_historico_id"
			: "valor"
		// Agregar el RCLV_id al origen
		if (RCLV.origen == "datosPers") {
			req.session.datosPers[campo] = RCLV_id;
			res.cookie("datosPers", req.session.datosPers, {maxAge: 24 * 60 * 60 * 1000});
		} else if (RCLV.origen == "edicion") {
			await procesar.guardar_o_actualizar_Edicion(RCLV.entidad, RCLV.producto_id, {
				[campo]: RCLV_id,
			});
		}
		// Obtener el destino a dónde redireccionar
		// 8. Borrar session y cookies de RCLV
		if (req.session && req.session.RCLV) delete req.session.RCLV;
		if (req.cookies && req.cookies.RCLV) res.clearCookie("RCLV");
		// 9. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect(RCLV.destino);
	},

	prodNoEncontrado: (req, res) => {
		return res.send("Producto no encontrado");
	},

	prodNoAprobado: (req, res) => {
		// Tomar datos de session o cookies
		noAprobado = req.session.noAprobado
			? req.session.noAprobado
			: req.cookies.noAprobado
			? req.cookies.noAprobado
			: "";
		let frase = "El producto no está aprobado para ser mostrado. Status actual: ";
		return res.send(frase + noAprobado.status_registro.nombre);
		return res.send("El producto no está aprobado para ser mostrado. Status actual: ");
	},

	session: (req, res) => {
		return res.send(req.session);
	},

	cookies: (req, res) => {
		return res.send(req.cookies);
	},
};
