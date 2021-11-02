// ************ Requires ************
let validarRV = require("../../funciones/varias/RelacVida-errores");
let BD_varios = require("../../funciones/BD/varios");

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

	relacionConLaVida: (req, res) => {
		// 1.1. Si se perdió la info anterior, volver a 'Palabra Clave'
		aux = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers;
		if (!aux) return res.redirect("/agregar/productos/palabras-clave");
		// 1.2. Guardar el data entry en session y cookie
		let datosPers = { ...aux, ...req.query };
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 1.3 Si existe 'req.query', recargar la página
		return datosPers.rubro == "personaje"
			? res.redirect("/agregar/personaje-historico")
			: res.redirect("/agregar/hecho-historico");
	},

	RV_Form: async (req, res) => {
		// Feedback de la instancia anterior o Data Entry propio
		datosPers = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers
			? req.cookies.datosPers
			: "";
		if (!datosPers)
			return res.redirect("/agregar/productos/palabras-clave");
		!req.session.datosPers ? (req.session.datosPers = datosPers) : "";
		//return res.send(req.session.datosPers);
		tema = "relacionConLaVida";
		codigo = datosPers.rubro;
		// Data-entry
		data_entry = req.session[codigo + "Historico"]
			? req.session[codigo + "Historico"]
			: "";
		// Errores
		let errores = req.session.errores
			? req.session.errores
			: data_entry
			? await validarRV[codigo](data_entry)
			: "";
		// Meses del año
		meses = await BD_varios.ObtenerTodos("meses", "id");
		// Render
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
			errores,
			meses,
		});
	},

	RV_Grabar: async (req, res) => {
		// Feedback de la instancia anterior o Data Entry propio
		datosPers = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers
			? req.cookies.datosPers
			: "";
		if (!datosPers)
			return res.redirect("/agregar/productos/palabras-clave");
		!req.session.datosPers ? (req.session.datosPers = datosPers) : "";
		rubro = datosPers.rubro;
		// 1. Guardar el data entry en session y cookie
		let data_entry = req.body;
		data_entry.rubro = rubro;
		req.session[rubro] = data_entry;
		res.cookie(rubro, data_entry, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2. Averiguar si hay errores de validación
		let errores = await validarRV.relacionConLaVida(data_entry);
		// 3. Acciones si hay errores
		//return res.send(req.url);
		//return res.send(errores);
		if (errores.hay) {
			req.session.errores = errores;
			return res.redirect(req.url);
		}
		// 3. Preparar la info a guardar
		datos = {
			nombre: data_entry.nombre,
			creada_por_id: req.session.usuario.id,
		};
		if (
			data_entry.mes_id &&
			data_entry.dia &&
			data_entry.desconocida == undefined
		) {
			dia_del_ano_id = await BD_varios.ObtenerTodos("dias_del_ano", "id")
				.then((n) => n.filter((m) => m.mes_id == data_entry.mes_id))
				.then((n) => n.filter((m) => m.dia == data_entry.dia))
				.then((n) => n[0].id);
			datos.dia_del_ano_id = dia_del_ano_id;
		}
		// 4. Crear el registro en la BD
		let entidad = "historicos_" + rubro + "s";
		producto = await BD_varios.agregarPorParametro(datos, entidad);
		let { id } = await BD_varios.ObtenerPorParametro(
			entidad,
			"nombre",
			datos.nombre
		);
		//return res.send(id+"");
		// 5. Guardar el id en 'Datos Personalizados'
		req.session.datosPers[rubro + "_historico_id"] = id;
		res.cookie("datosPers." + rubro + "_historico_id", id, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 5. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/productos/datos-personalizados");
	},
};
