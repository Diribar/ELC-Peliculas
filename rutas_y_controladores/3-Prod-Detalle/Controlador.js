// ************ Requires *************
let BD_varias = require("../../funciones/BD/varias");
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
			"idioma_original",
			"en_castellano",
			"en_color",
			"categoria",
			"subcategoria",
			"publico_sugerido",
			"personaje_historico",
			"hecho_historico",
			"creada_por",
			"status_registro",
			"editada_por",
			"borrada_motivo",
		];
		entidad == "capitulos" ? includes.push("coleccion") : includes.push("paises");
		let producto = await BD_especificas.filtrarProductoPorIdConInclude(entidad, ID, includes);
		//return res.send(producto)
		if (entidad == "capitulos") {
			avatar = producto.avatar;
			producto.paises = await BD_especificas.filtrarProductoPorIdConInclude(
				"colecciones",
				producto.coleccion_id,
				"paises"
			).then(n=>n.paises)
			//return res.send(producto.paises);
		} else
			avatar = producto.avatar
				? "/imagenes/2-Productos/" + producto.avatar
				: "/imagenes/8-Agregar/Desamb-IM.jpg";
		// Obtener el título
		titulo =
			entidad == "peliculas"
				? "Película"
				: entidad == "colecciones"
				? "Colección"
				: "Capítulo";
		// Obtener los paises
		let paises = [];
		//return res.send(producto);
		let BD_paises = await BD_varias.obtenerTodos("paises", "nombre");
		for (pais of producto.paises) {
			nombre = BD_paises.find((n) => n.id == pais.pais_id).nombre;
			paises.push(nombre);
		}
		paises = paises.join(", ");
		//return res.send(paises);
		// Ir a la vista
		//return res.send(producto);
		//return res.send(paises);
		return res.render("Home", {
			tema,
			codigo,
			titulo,
			entidad,
			ID,
			producto,
			avatar,
			paises,
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
