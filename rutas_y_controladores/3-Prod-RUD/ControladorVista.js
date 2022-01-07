// ************ Requires *************
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");
let varias = require("../../funciones/Varias/varias");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		// 1. Tema y Código
		tema = "producto";
		codigo = "detalle";
		// Obtener los datos identificatorios de la película
		let entidad = req.query.entidad;
		let ID = req.query.id;
		// Definir los campos include
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
		if (entidad == "capitulos") includes.push("coleccion");
		// Obtener los datos del producto
		let producto = await BD_especificas.obtenerProductoPorIdConInclude(entidad, ID, includes);
		// Problema 1: PRODUCTO NO ENCONTRADO
		if (!producto) return res.redirect("/producto/no-encontrado");
		// Problema 2: PRODUCTO NO APROBADO
		let noAprobada = !producto.status_registro.aprobada;
		let usuario = req.session.req.session.usuario;
		let otroUsuario = !usuario || producto.creada_por_id != usuario.id;
		if (noAprobada && otroUsuario) {
			req.session.noAprobado = {status_registro: {nombre: producto.status_registro.nombre}};
			res.cookie("noAprobado", req.session.noAprobado, {maxAge: 24 * 60 * 60 * 1000});
			return res.redirect("/producto/no-aprobado");
		}
		// Continuar...
		return res.send(producto);
		if (entidad == "capitulos") {
			avatar = producto.avatar;
			producto.paises_id = await BD_varias.obtenerPorParametro(
				"colecciones",
				"id",
				producto.coleccion_id
			).then((n) => n.paises_id);
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
		let paises = producto.paises_id ? await varias.paises_idToNombre(producto.paises_id) : "";
		// Ir a la vista
		//return res.send(paises);
		//return res.send(producto);
		return res.render("0-Producto", {
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
