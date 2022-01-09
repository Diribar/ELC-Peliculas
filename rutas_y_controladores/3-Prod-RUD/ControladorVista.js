// ************ Requires *************
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");
let varias = require("../../funciones/Varias/varias");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		// Tema y Código
		tema = "producto";
		codigo = "detalle";
		// Obtener los datos identificatorios del producto **************************
		let entidad = req.query.entidad;
		let ID = req.query.id;
		// Obtener los datos del producto *******************************************
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
			"status_registro",
			"editada_por",
			// A partir de acá, van los campos exclusivos de 'Original'
			"creada_por",
			"borrada",
		];
		if (entidad == "capitulos") includes.push("coleccion");
		// Obtener los datos
		let producto = await BD_varias.obtenerPorIdConInclude(entidad, ID, includes).then((n) => {
			return n ? n.toJSON() : "";
		});
		// Problema 1: PRODUCTO NO ENCONTRADO
		if (!producto) return res.redirect("/error/producto-no-encontrado");
		// Problema 2: PRODUCTO NO APROBADO
		let noAprobada = !producto.status_registro.aprobada;
		let usuario = req.session.req.session.usuario;
		let otroUsuario = !usuario || producto.creada_por_id != usuario.id;
		if (noAprobada && otroUsuario) {
			req.session.noAprobado = {status_registro: {nombre: producto.status_registro.nombre}};
			res.cookie("noAprobado", req.session.noAprobado, {maxAge: 24 * 60 * 60 * 1000});
			return res.redirect("/error/producto-no-aprobado");
		}
		// Quitarle los campos 'null'
		let campos = Object.keys(producto);
		for (i = campos.length - 1; i >= 0; i--) {
			if (producto[campos[i]] === null) delete producto[campos[i]];
		}
		// Obtener el título ********************************************************
		titulo =
			entidad == "peliculas"
				? "Película"
				: entidad == "colecciones"
				? "Colección"
				: "Capítulo";
		// Obtener los datos del producto editado ***********************************
		// Definir los campos include
		includes.splice(-2);
		// Obtener los datos
		let prodEditado = await BD_varias.obtenerPorParametrosConInclude(
			entidad + "Edicion",
			"ELC_id",
			producto.id,
			"editada_por_id",
			usuario.id,
			includes
		).then((n) => {
			return n ? n.toJSON() : "";
		});
		// Generar los datos a mostrar en la vista
		if (prodEditado) {
			// Quitarle los campos 'null'
			let campos = Object.keys(prodEditado);
			for (i = campos.length - 1; i >= 0; i--) {
				if (prodEditado[campos[i]] === null) delete prodEditado[campos[i]];
			}
			// Preparar la info a cruzar
			edicion = {...prodEditado};
			delete edicion.id;
			delete edicion.ELC_id;
			// Cruzar la info
			detalle = {...producto, ...edicion};
		} else detalle = {...producto};
		//return res.send(detalle);
		// Obtener avatar
		let rutaAvatar = prodEditado ? "/imagenes/3-ProductosEditados/" : "/imagenes/2-Productos/";
		let avatar = detalle.avatar
			? entidad == "capitulos"
				? detalle.avatar
				: rutaAvatar + detalle.avatar
			: "/imagenes/8-Agregar/Desamb-IM.jpg";
		// Obtener los países
		let paises = producto.paises_id ? await varias.paises_idToNombre(producto.paises_id) : "";
		// Ir a la vista
		return res.render("0-Producto", {
			tema,
			codigo,
			titulo,
			entidad,
			ID,
			producto: detalle,
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
