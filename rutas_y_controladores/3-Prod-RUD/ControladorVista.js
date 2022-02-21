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
			"personaje",
			"hecho",
			"status_registro",
			"editado_por",
			// A partir de acá, van los campos exclusivos de 'Original'
			"creado_por",
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
		let otroUsuario = !usuario || registro.creado_por_id != usuario.id;
		if (noAprobada && otroUsuario) {
			if (
				entidad != "capitulos" ||
				!(entidad == "capitulos" && registro.coleccion.creado_por_id == usuario.id)
			) {
				req.session.noAprobado = registro;
				res.cookie("noAprobado", req.session.noAprobado, {maxAge: 24 * 60 * 60 * 1000});
				return res.send("Producto no aprobado");
			}
		}
		// Quitarle los campos 'null'
		let campos = Object.keys(registro);
		for (i = campos.length - 1; i >= 0; i--) {
			if (registro[campos[i]] === null) delete registro[campos[i]];
		}
		// Obtener los datos editados
		let registroEditado = await BD_varias.obtenerPor3CamposConInclude(
			"productos_edic",
			"ELC_entidad",
			entidad,
			"ELC_id",
			registro.id,
			"editado_por_id",
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
						10,
						parseInt(
							(registroEditado.capturado_en - new Date() + 1000 * 60 * 60) / 1000 / 60
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
		let includes = [
			"link_tipo",
			"link_prov",
			"creado_por",
			"alta_analizada_por",
			"revisado_por",
		];
		// Obtener el 'campo_id'
		let campo_id =
			entidad == "peliculas"
				? "pelicula_id"
				: entidad == "colecciones"
				? "coleccion_id"
				: "capitulo_id";
		// Obtener el producto y los links_provs
		let [registroProd, provs, linksABM] = await Promise.all([
			BD_varias.obtenerPorIdConInclude(entidad, ID, "links").then((n) => {
				return n ? n.toJSON() : "";
			}),
			BD_varias.obtenerTodos("links_provs", "orden").then((n) => n.map((m) => m.dataValues)),
			BD_varias.obtenerTodosPorCampoConInclude("links_prods_edic", campo_id, ID, includes),
		]);
		if (registroProd == "")
			return res.send("No tenemos en nuestra Base de Datos un producto con esa 'id'");
		// Obtener los links del producto
		let linksAprob = registroProd.links;
		//let 
		// if (links.length > 1)
		// 	links.sort((a, b) => {
		// 		return a < b ? -1 : a > b ? 1 : 0;
		// 	});
		// Configurar el Producto y el Título
		let producto = varias.producto(entidad);
		let titulo = "Links de" + (entidad == "capitulos" ? "l " : " la ") + producto;
		// Obtener el usuario
		let usuario = req.session.req.session.usuario;

		// Obtener el avatar
		let registroEditado = await BD_varias.obtenerPorCampos(
			"productos_edic",
			"ELC_id",
			ID,
			"editado_por_id",
			usuario.id
		).then((n) => {
			return n ? n.toJSON() : "";
		});
		let imagenOr = registroProd.avatar;
		let imagenEd = registroEditado.avatar;
		let avatar = imagenEd
			? (imagenEd.slice(0, 4) != "http" ? "/imagenes/3-ProductosEditados/" : "") + imagenEd
			: imagenOr
			? (imagenOr.slice(0, 4) != "http" ? "/imagenes/2-Productos/" : "") + imagenOr
			: "/imagenes/8-Agregar/IM.jpg";
		// Obtener los tipos de links
		let links_tipos = await BD_varias.obtenerTodos("links_tipos", "id").then((n) =>
			n.map((m) => m.dataValues)
		);
		// Ir a la vista
		return res.render("0-RUD", {
			tema,
			codigo,
			titulo,
			links,
			provs,
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
