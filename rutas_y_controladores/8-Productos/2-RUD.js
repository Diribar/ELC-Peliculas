// ************ Requires *************
//const BD_peliculas = require("../../funciones/BD/peliculas");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		// Obtener los datos de la película
		let ID = req.params.id
		let producto = await BD_peliculas.obtenerPorID_Peli(ID);
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
