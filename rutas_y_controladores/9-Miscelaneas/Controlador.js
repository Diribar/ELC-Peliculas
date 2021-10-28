module.exports = {
	home: (req, res) => {
		return res.redirect("/productos");
	},
	nosotros: (req, res) => {
		return res.render("1-Nosotros");
	},
	personajeHistorico: (req, res) => {
		tema = "relacionConLaVida";
		codigo = "personaje";
		data_entry = req.session.personajeHistorico
			? req.session.personajeHistorico
			: null;
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
		});
	},

	hechoHistorico: (req, res) => {
		tema = "relacionConLaVida";
		codigo = "hecho";
		data_entry = req.session.hechoHistorico
			? req.session.hechoHistorico
			: null;
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
		});
	},
};
