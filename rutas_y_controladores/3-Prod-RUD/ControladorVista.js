// ************ Requires *************
let BD_varias = require("../../funciones/BD/varias");
let varias = require("../../funciones/Varias/varias");
let variables = require("../../funciones/Varias/variables");

// *********** Controlador ***********
module.exports = {
	detalleEdicion: async (req, res) => {
		// Tema y Código
		let tema = "producto";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.indexOf("/"));
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let ID = req.query.id;
		// Redireccionar si se encuentran errores en la entidad y/o el ID
		let errorEnQuery = revisarQuery(entidad, ID);
		if (errorEnQuery) return res.send(errorEnQuery);
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
		];
		if (entidad == "capitulos") includes.push("coleccion");
		// Obtener los datos originales del producto
		let registro = await BD_varias.obtenerPorIdConInclude(entidad, ID, includes).then((n) => {
			return n ? n.toJSON() : "";
		});
		// Problema: PRODUCTO NO ENCONTRADO
		if (!registro) return res.send("Producto no encontrado");
		// Problema: PRODUCTO NO APROBADO
		let noAprobada = !registro.status_registro.aprobada;
		let usuario = req.session.req.session.usuario;
		let otroUsuario = !usuario || registro.creada_por_id != usuario.id;
		if (noAprobada && otroUsuario) {
			req.session.noAprobado = registro;
			res.cookie("noAprobado", req.session.noAprobado, {maxAge: 24 * 60 * 60 * 1000});
			return res.send("Producto noaprobado");
		}
		// Quitarle los campos 'null'
		let campos = Object.keys(registro);
		for (i = campos.length - 1; i >= 0; i--) {
			if (registro[campos[i]] === null) delete registro[campos[i]];
		}
		// Obtener los datos editados
		let registroEditado = await BD_varias.obtenerPorCamposConInclude(
			entidad + "Edicion",
			"ELC_id",
			registro.id,
			"editada_por_id",
			usuario.id,
			includes.slice(0, -2)
		).then((n) => {
			return n ? n.toJSON() : "";
		});
		// Información sobre la versión original y editada
		let existeEdicion = !!registroEditado;
		let version = req.query.verOriginal == "true" || !existeEdicion ? "original" : "edicion";
		// Generar los datos a mostrar en la vista
		if (version == "edicion") {
			// Quitarle los campos 'null'
			let campos = Object.keys(registroEditado);
			for (i = campos.length - 1; i >= 0; i--) {
				if (registroEditado[campos[i]] === null) delete registroEditado[campos[i]];
			}
			// Preparar la info a cruzar
			edicion = {...registroEditado};
			delete edicion.id;
			delete edicion.ELC_id;
			// Cruzar la info
			registroCombinado = {...registro, ...edicion};
		} else registroCombinado = {...registro};
		// Obtener avatar
		let imagen = registroCombinado.avatar;
		var avatar = imagen
			? (imagen.slice(0, 4) != "http"
					? version == "edicion" && registroEditado.avatar
						? "/imagenes/3-ProductosEditados/"
						: "/imagenes/2-Productos/"
					: "") + imagen
			: "/imagenes/8-Agregar/IM.jpg";
		// Obtener los países
		let paises = registro.paises_id ? await varias.paises_idToNombre(registro.paises_id) : "";
		// Configurar el Título
		let producto = varias.producto(entidad);
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? "l " : " la ") +
			producto;
		// Info exclusiva para la vista de Edicion
		if (codigo == "edicion") {
			let camposDD = variables
				.camposDD()
				.filter((n) => n[entidad])
				.filter((n) => !n.omitirRutinaVista);
			var camposDD1 = camposDD.filter((n) => n.antesDePais);
			var camposDD2 = camposDD.filter((n) => !n.antesDePais && n.campo != "produccion");
			var camposDD3 = camposDD.filter((n) => n.campo == "produccion");
			var BD_paises = await BD_varias.obtenerTodos("paises", "nombre");
			var BD_idiomas = await BD_varias.obtenerTodos("idiomas", "nombre");
			var camposDP = await variables.camposDP();
			var tiempo = existeEdicion
				? Math.max(
						1,
						parseInt(
							(registroEditado.capturada_en - new Date() + 1000 * 60 * 60) / 1000 / 60
						)
				  )
				: false;
		} else var [camposDD1, camposDD2, BD_paises, BD_idiomas, camposDP, tiempo] = [];
		// Ir a la vista
		return res.render("0-RUD", {
			tema,
			codigo,
			titulo,
			producto,
			entidad,
			ID,
			registro: registroCombinado,
			avatar,
			paises,
			camposDD1,
			camposDD2,
			camposDD3,
			BD_paises,
			BD_idiomas,
			camposDP,
			errores: {},
			existeEdicion,
			version,
			tiempo,
		});
	},

	links: async (req, res) => {
		// Tema y Código
		let tema = "producto";
		let codigo = "links";
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let ID = req.query.id;
		// Redireccionar si se encuentran errores en la entidad y/o el ID
		let errorEnQuery = revisarQuery(entidad, ID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Definir los campos include
		let includes = ["link_tipo", "link_prov", "creado_por", "alta_analizada_por", "revisado_por"];
		// Obtener el 'campo_id'
		let campo_id =
			entidad == "peliculas"
				? "pelicula_id"
				: entidad == "colecciones"
				? "coleccion_id"
				: "capitulo_id";
		// Obtener los links, links_provs, producto
		let [links, link_provs, registroProd] = await Promise.all([
			BD_varias.obtenerTodosPorCampoConInclude("links_prod", campo_id, ID, includes),
			BD_varias.obtenerTodos("links_provs", "orden").then((n) => n.map((m) => m.dataValues)),
			BD_varias.obtenerPorId(entidad, ID).then((n) => {
				return n ? n.toJSON() : "";
			}),
		]);
		if (registroProd == null)
			return res.send("No tenemos en nuestra Base de Datos un producto con esa 'id'");
		// Configurar el Producto y Título
		let producto = varias.producto(entidad);
		let titulo = "Links de la " + producto;
		// Obtener el usuario
		let usuario = req.session.req.session.usuario;
		let registroEditado = await BD_varias.obtenerPorCampos(
			entidad + "Edicion",
			"ELC_id",
			ID,
			"editada_por_id",
			usuario.id
		).then((n) => {
			return n ? n.toJSON() : "";
		});
		// Obtener el avatar
		let imagenOr = registroProd.avatar;
		let imagenEd = registroEditado.avatar;
		let avatar = imagenEd
			? (imagenEd.slice(0, 4) != "http" ? "/imagenes/3-ProductosEditados/" : "") + imagenEd
			: imagenOr
			? (imagenOr.slice(0, 4) != "http" ? "/imagenes/2-Productos/" : "") + imagenOr
			: "/imagenes/8-Agregar/IM.jpg";
		// Obtener
		let links_tipos = await BD_varias.obtenerTodos("links_tipos", "id").then(n=>n.map((m) => m.dataValues))
		// Ir a la vista
		return res.render("0-RUD", {
			tema,
			codigo,
			titulo,
			links,
			link_provs,
			registro: registroProd,
			producto,
			entidad,
			ID,
			avatar,
			usuario,
			links_tipos,
		});
	},

	revisar: (req, res) => {
		// Tema y Código
		let tema = "producto";
		let codigo = "revisar";
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let ID = req.query.id;
		// Redireccionar si se encuentran errores en la entidad y/o el ID
		let errorEnQuery = revisarQuery(entidad, ID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Configurar el Título
		let producto = varias.producto(entidad);
		let titulo = "Revisión de" + (entidad == "capitulos" ? "l " : " la ") + producto;
		// Ir a la vista
		return res.render("0-RUD", {
			tema,
			codigo,
			titulo,
		});
	},

	calificala: (req, res) => {
		return res.send("Estoy en calificala");
	},

	eliminar: (req, res) => {
		return res.send("Estoy en eliminar");
	},
};

let revisarQuery = (entidad, ID) => {
	let errorEnQuery = "";
	// Sin entidad y/o ID
	if (!entidad) errorEnQuery = "Falta el dato de la 'entidad'";
	if (!ID) errorEnQuery = "Falta el dato del 'ID'";
	// Entidad inexistente
	producto = varias.producto(entidad);
	if (!producto) errorEnQuery = "La entidad ingresada no es válida";
	return errorEnQuery;
};
