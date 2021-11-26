// ************ Requires *************
let BD_varias = require("../../funciones/BD/varias");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		// 1. Tema y Código
		tema = "producto";
		codigo = "detalle";
		// Obtener los datos de la película
		let entidad = req.query.entidad;
		let ID = req.query.id;
		let producto = await BD_varias.obtenerPorId(entidad, ID);
		let avatar =
			producto.avatar.substring(0, 5) != "https"
				? "/imagenes/2-Productos/" + producto.avatar
				: producto.avatar;
		// Ir a la vista
		return res.render("Home", {
			tema,
			codigo,
			entidad,
			ID,
			producto,
			avatar,
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
