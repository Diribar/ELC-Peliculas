module.exports = {
	home: (req,res) => {
		return res.redirect("/peliculas")
	},
	nosotros: (req,res) => {
		return res.render("1-Nosotros")
	},
};
