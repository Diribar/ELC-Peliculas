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
		// Breve Descripción
		breve_descripcion = await BD_varios.ObtenerTodos(
			"breve_descripcion",
			"nombre"
		);
		laico = breve_descripcion.filter((m) => m.grupo_id == 1);
		os = breve_descripcion.filter((m) => m.grupo_id == 2);
		// Canonización
		sc = await BD_varios.ObtenerTodos("status_canonizacion", "orden");
		// Render
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
			errores,
			meses,
			dias_del_ano,
			laico,
			os,
			sc,
		});
	},

	personajeHistoricoGrabar: (req, res) => {},

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

	hechoHistoricoGrabar: (req, res) => {},
};
