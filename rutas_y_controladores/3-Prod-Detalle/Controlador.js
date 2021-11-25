// ************ Requires *************
//const BD_peliculas = require("../../funciones/BD/peliculas");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		titulo = "Detalle";
		nombre = "Información General";
		informacion = req.query;
		// Obtener los datos de la película
		let ID = req.params.id;
		let producto = await BD_peliculas.obtenerPorID_Peli(ID);
		// Ir a la vista
		return res.render("0-CRUD", {
			titulo,
			nombre,
			ID,
			producto,
		});
	},

	editar: (req, res) => {
		return res.send("Estoy en editar");
	},

	calificala: (req, res) => {
		return res.send("Estoy en calificala");
	},

	eliminar: (req, res) => {
		return res.send("Estoy en eliminar");
	},
};
