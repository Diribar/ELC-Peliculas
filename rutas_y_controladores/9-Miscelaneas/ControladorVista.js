// ************ Requires ************
let validarRV = require("../../funciones/varias/RelacVida-errores");

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
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
			errores,
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
