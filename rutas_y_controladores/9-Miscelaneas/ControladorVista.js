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

	personajeHistoricoForm: async (req, res) => {
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
		if (Object.keys(req.query).length) {
			return res.redirect("/agregar/personaje-historico");
		}
		// Temas propios de 'Personaje Histórico'
		tema = "relacionConLaVida";
		codigo = "personaje";
		data_entry = req.session.personajeHistorico
			? req.session.personajeHistorico
			: "";
		let errores = req.session.errores
			? req.session.errores
			: data_entry
			? await validarRV.personaje(data_entry)
			: "";
		// Meses y Días del año
		meses = await BD_varios.ObtenerTodos("meses", "id");
		dias_del_ano = await BD_varios.ObtenerTodos("dias_del_ano", "id");
		// Render
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
			errores,
			meses,
			dias_del_ano,
		});
	},

	personajeHistoricoGrabar: async (req, res) => {
		// 1. Guardar el data entry en session y cookie
		let personaje = req.body;
		//return res.send(req.body)
		req.session.personaje = personaje;
		res.cookie("personaje", personaje, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2. Averiguar si hay errores de validación
		let errores = await validarRV.personaje(personaje);
		// 3. Acciones si hay errores
		if (errores.hay) {
			// return res.send(errores);
			req.session.errores = errores;
			return res.redirect("/agregar/personaje-historico");
		}
		// 3. Preparar la info a guardar
		datos = {
			nombre: personaje.nombre,
			creada_por_id: req.session.usuario.id,
		};
		if (
			personaje.mes_id &&
			personaje.dia &&
			personaje.desconocida == undefined
		) {
			dia_del_ano_id = await BD_varios.ObtenerTodos("dias_del_ano", "id")
				.then((n) => n.filter((m) => m.mes_id == personaje.mes_id))
				.then((n) => n.filter((m) => m.dia == personaje.dia))
				.then((n) => n[0].id);
			datos.dia_del_ano_id = dia_del_ano_id;
		}
		// 4. Crear el registro en la BD
		producto = await BD_varios.agregarPersonajeHistorico(datos);
		let { id } = await BD_varios.ObtenerPorParametro(
			"historicos_personajes",
			"nombre",
			datos.nombre
		);
		//return res.send(id+"");
		// 5. Guardar el id en 'Datos Personalizados'
		req.session.datosPers.personaje_historico_id = id;
		res.cookie("datosPers.personaje_historico_id", id, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 5. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/productos/datos-personalizados");
	},

	hechoHistoricoForm: (req, res) => {
		tema = "relacionConLaVida";
		codigo = "hecho";
		data_entry = req.session.hechoHistorico
			? req.session.hechoHistorico
			: "";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
			errores,
		});
	},

	hechoHistoricoGrabar: (req, res) => {
		return res.send("hechoHistoricoGrabar");
	},
};
