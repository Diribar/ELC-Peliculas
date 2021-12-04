// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/RCLV-Errores");
let BD_varias = require("../../funciones/BD/varias");

// *********** Controlador ***********
module.exports = {
	home: (req, res) => {
		tema = "home";
		return res.render("Home", {tema});
	},

	nosotros: (req, res) => {
		tema = "institucional";
		codigo = "nosotros";
		return res.render("Home", {
			tema,
			codigo,
		});
	},

	RCLV: (req, res) => {
		// 1.1. Si se perdió la info anterior, volver a 'Palabra Clave'
		aux = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
		if (!aux) return res.redirect("/producto/agregar/palabras-clave");
		// 1.2. Guardar el data entry en session y cookie
		let datosPers = {...aux, ...req.query};
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, {maxAge: 24 * 60 * 60 * 1000});
		// 1.3 Si existe 'req.query', recargar la página
		return datosPers.entidad_RCLV == "historicos_personajes"
			? res.redirect("/agregar/personaje-historico")
			: res.redirect("/agregar/hecho-historico");
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
		tema = "RCLV";
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
		let paises = await BD_varias.obtenerTodos("paises", "nombre");
		let vocacion_iglesia = await BD_varias.obtenerTodos("vocacion_iglesia", "orden");
		// 6. Render
		//return res.send(errores);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: datosRCLV,
			errores,
			meses,
			paises,
			vocacion_iglesia,
		});
	},

	RCLV_Grabar: async (req, res) => {
		//return res.send(req.body)
		// 1. Feedback de la instancia anterior o Data Entry propio
		datosPers = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers
			? req.cookies.datosPers
			: "";
		if (!datosPers) return res.redirect("/producto/agregar/palabras-clave");
		if (!req.session.datosPers) req.session.datosPers = datosPers;
		// 2. Generar información
		let entidad = datosPers.entidad_RCLV;
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
		// 5. Borrar session y cookies innecesarios
		if (req.session && req.session[entidad]) delete req.session[entidad];
		if (req.cookies && req.cookies[entidad]) res.clearCookie([entidad]);
		// 6. Preparar la info a guardar
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
		// 7. Crear el registro en la BD
		let {id} = await BD_varias.agregarRegistro(datos);
		//return res.send(id+"");
		// 8. Guardar el id en 'Datos Personalizados'
		campo = (entidad == "historicos_personajes" ? "personaje" : "hecho") + "_historico_id";
		req.session.datosPers[campo] = id;
		res.cookie(datosPers[campo], id, {maxAge: 24 * 60 * 60 * 1000});
		// 9. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/producto/agregar/datos-personalizados");
	},
};
