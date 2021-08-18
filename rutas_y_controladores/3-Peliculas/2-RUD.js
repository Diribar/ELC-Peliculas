// ************ Requires *************
const BD_peliculas = require("../../modelos/bases_de_datos/BD_peliculas");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		// Obtener los datos de la película
		let ID = req.params.id
		let producto = await BD_peliculas.ObtenerPorID(ID);
		// Ir a la vista
		return res.render("0-CRUD", {
			titulo: "Detalle",
			nombre: "Información General",
			ID,
			producto,
		});
	},

	editarGuardar: (req, res) => {
		return res.send("Estoy en editarGuardar");
	},

	bajaGuardar: (req, res) => {
		return res.send("Estoy en bajaGuardar");
	},
};
