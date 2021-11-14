// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/RCLV-Errores");
let BD_varias = require("../../funciones/BD/varias");

// *********** Controlador ***********
module.exports = {
	home: (req, res) => {
		return res.redirect("/productos");
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
		aux = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers;
		if (!aux) return res.redirect("/agregar/producto/palabras-clave");
		// 1.2. Guardar el data entry en session y cookie
		let datosPers = { ...aux, ...req.query };
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, { maxAge: 24 * 60 * 60 * 1000 });
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
		if (!datosPers) return res.redirect("/agregar/producto/palabras-clave");
		if (!req.session.datosPers) req.session.datosPers = datosPers;
		//return res.send(req.session.datosPers);
		// 2. Tema y Código
		tema = "RCLV";
		codigo = datosPers.entidad_RCLV;
		// 3. Data-entry
		datosRCLV = req.session[codigo] ? req.session[codigo] : "";
		// Errores
		let errores = req.session.errores
			? req.session.errores
			: datosRCLV
			? await validarRCLV.RCLV(datosRCLV)
			: "";
		// Meses del año
		meses = await BD_varias.obtenerTodos("meses", "id");
		// Render
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			datosRCLV,
			errores,
			meses,
		});
	},

	RCLV_Grabar: async (req, res) => {
		// Feedback de la instancia anterior o Data Entry propio
		datosPers = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers
			? req.cookies.datosPers
			: "";
		if (!datosPers) return res.redirect("/agregar/producto/palabras-clave");
		if (!req.session.datosPers) req.session.datosPers = datosPers;
		// 1. Guardar el data entry en session y cookie
		let datosRCLV = { ...req.body, entidad: datosPers.entidad_RCLV };
		entidad = datosRCLV.entidad;
		req.session[entidad] = datosRCLV;
		res.cookie(entidad, datosRCLV, { maxAge: 24 * 60 * 60 * 1000 });
		// 2. Averiguar si hay errores de validación
		let errores = await validarRCLV.RCLV(datosRCLV);
		// 3. Acciones si hay errores
		if (errores.hay) {
			req.session.errores = errores;
			return res.redirect(req.url);
		}
		// 3. Preparar la info a guardar
		datos = {
			entidad: datosRCLV.entidad,
			nombre: datosRCLV.nombre,
			creada_por_id: req.session.usuario.id,
		};
		if (
			datosRCLV.mes_id &&
			datosRCLV.dia &&
			datosRCLV.desconocida == undefined
		) {
			dia_del_ano_id = await BD_varias.obtenerTodos("dias_del_ano", "id")
				.then((n) => n.filter((m) => m.mes_id == datosRCLV.mes_id))
				.then((n) => n.find((m) => m.dia == datosRCLV.dia))
				.then((n) => n.id);
			datos.dia_del_ano_id = dia_del_ano_id;
		}
		// 4. Crear el registro en la BD
		let { id } = await BD_varias.agregarRegistro(datos);
		//return res.send(id+"");
		// 5. Guardar el id en 'Datos Personalizados'
		campo =
			entidad == "historicos_personajes"
				? "personaje_historico_id"
				: "hecho_historico_id";
		req.session.datosPers[campo] = id;
		res.cookie("datosPers." + campo, id, { maxAge: 24 * 60 * 60 * 1000 });
		// 5. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/producto/datos-personalizados");
	},
};
