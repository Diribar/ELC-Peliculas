// ************ Requires *************
let BD_especificas = require("../../funciones/BD/especificas");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		// 1. Tema y Código
		tema = "producto";
		codigo = "detalle";
		// Obtener los datos de la película
		let entidad = req.query.entidad;
		let ID = req.query.id;
		let includes = [
			"en_castellano",
			"categoria",
			"subcategoria",
			"publico_sugerido",
			"personaje_historico",
			"hecho_historico",
			"creada_por",
			"status_registro_producto",
			"editada_por",
			"borrada_motivo",
		];
		let producto = await BD_especificas.obtenerProductoPorIdConInclude(entidad, ID, includes);
		let avatar =
			producto.avatar.substring(0, 5) != "https"
				? "/imagenes/2-Productos/" + producto.avatar
				: producto.avatar;
		// Ir a la vista
		//return res.send(producto);
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
