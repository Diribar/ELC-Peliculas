// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/RCLV-Errores");
let BD_varias = require("../../funciones/BD/varias");

// *********** Controlador ***********
module.exports = {
	home: (req, res) => {
		tema = "miscelaneas";
		codigo = "inicio";
		return res.render("Home", {tema, codigo});
	},

	nosotros: (req, res) => {
		tema = "miscelaneas";
		codigo = "nosotros";
		return res.render("Home", {
			tema,
			codigo,
		});
	},

	RCLV: (req, res) => {
		// 1. Si se perdió la info anterior, volver a 'Palabra Clave'
		aux = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
		if (!aux) return res.redirect("/producto/agregar/palabras-clave");
		// 2. Guardar el data entry en session y cookie
		let datosPers = {...aux, ...req.query};
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, {maxAge: 24 * 60 * 60 * 1000});
		// 3 Si existe 'req.query', recargar la página
		return datosPers.entidad_RCLV == "RCLV_personajes_historicos"
			? res.redirect("/agregar/RCLV_personajes_historicos")
			: res.redirect("/agregar/RCLV_hechos_historicos");
	},

	RCLV_Form: async (req, res) => {
		// 1. Feedback de la instancia anterior
		datosPers = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers
			? req.cookies.datosPers
			: "";
		if (!datosPers) return res.redirect("/producto/agregar/palabras-clave");
		if (!req.session.datosPers) req.session.datosPers = datosPers;
		//return res.send(req.session.datosPers);
		// 2. Tema y Código
		tema = "miscelaneas";
		codigo = datosPers.entidad_RCLV;
		// 3. Data-entry
		datosRCLV = req.session[codigo]
			? req.session[codigo]
			: req.cookies[codigo]
			? req.cookies[codigo]
			: {};
		datosRCLV = {...datosRCLV, entidad: codigo, producto: datosPers.producto_RCLV};
		// 4. Errores
		let errores = req.session.erroresRCLV ? req.session.erroresRCLV : "";
		// 5. Bases de Datos para la vista
		let meses = await BD_varias.obtenerTodos("meses", "id");
		let procesos_canonizacion = [];
		let roles_iglesia = [];
		if (codigo == "RCLV_personajes_historicos") {
			procesos_canonizacion = await BD_varias.obtenerTodos(
				"procesos_canonizacion",
				"orden"
			).then((n) => n.filter((m) => m.id.length == 3));
			roles_iglesia = await BD_varias.obtenerTodos("roles_iglesia", "orden").then((n) =>
				n.filter((m) => m.id.length == 3)
			);
		}
		// 6. Render
		//return res.send(errores);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: datosRCLV,
			errores,
			meses,
			roles_iglesia,
			procesos_canonizacion,
		});
	},

	RCLV_Grabar: async (req, res) => {
		//return res.send(req.body)
		// 1. Feedback de la instancia anterior
		datosPers = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers
			? req.cookies.datosPers
			: "";
		if (!datosPers) return res.redirect("/producto/agregar/palabras-clave");
		let entidad = datosPers.entidad_RCLV;
		if (!req.session.datosPers) req.session.datosPers = datosPers;
		// 2. Generar información
		if (entidad == "RCLV_personajes_historicos" && req.body.enProcCan == "0") {
			delete req.body.proceso_canonizacion_id;
			delete req.body.rol_iglesia_id;
		}
		let datosRCLV = {...req.body, entidad};
		// 3. Averiguar si hay errores de validación
		let errores = await validarRCLV.RCLV_consolidado(datosRCLV);
		// 4. Acciones si hay errores
		if (errores.hay) {
			req.session[entidad] = datosRCLV;
			res.cookie(entidad, datosRCLV, {maxAge: 24 * 60 * 60 * 1000});
			req.session.erroresRCLV = errores;
			return res.redirect(req.url);
		}
		// 5. Preparar la info a guardar
		datos = {
			...datosRCLV,
			entidad,
			creada_por_id: req.session.usuario.id,
		};
		if (!datosRCLV.desconocida) {
			datos.dia_del_ano_id = await BD_varias.obtenerTodos("dias_del_ano", "id")
				.then((n) => n.find((m) => m.mes_id == datosRCLV.mes_id && m.dia == datosRCLV.dia))
				.then((n) => n.id);
		}
		// 6. Crear el registro en la BD
		let {id} = await BD_varias.agregarRegistro(datos);
		//return res.send(id+"");
		// 7. Guardar el id en 'Datos Personalizados'
		campo = entidad.slice(11, -1) + "_historico_id";
		req.session.datosPers[campo] = id;
		res.cookie(datosPers[campo], id, {maxAge: 24 * 60 * 60 * 1000});
		// 8. Borrar session y cookies innecesarios
		if (req.session && req.session[entidad]) delete req.session[entidad];
		if (req.cookies && req.cookies[entidad]) res.clearCookie([entidad]);
		// 9. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/producto/agregar/datos-personalizados");
	},
};
