module.exports = {
	home: (req,res) => {
		return res.redirect("/productos")
	},
	nosotros: (req,res) => {
		return res.render("1-Nosotros")
	},
};
