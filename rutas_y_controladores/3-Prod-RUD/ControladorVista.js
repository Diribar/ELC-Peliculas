// ************ Requires *************
let BD_varias = require("../../funciones/BD/varias");
let varias = require("../../funciones/Varias/varias");
let variables = require("../../funciones/Varias/variables");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
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
			"borrada",
		];
		if (entidad == "capitulos") includes.push("coleccion");
		// Obtener los datos del producto
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
		// Generar los datos a mostrar en la vista
		if (registroEditado) {
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
		let rutaAvatar = "/imagenes/" + (registroEditado ? "3-ProductosEditados/" : "2-Productos/");
		let avatar = registroCombinado.avatar
			? entidad == "capitulos"
				? registroCombinado.avatar
				: rutaAvatar + registroCombinado.avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// Obtener los países
		let paises = registro.paises_id ? await varias.paises_idToNombre(registro.paises_id) : "";
		// Configurar el Título
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "editar" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? "l " : " la ") +
			varias.producto(entidad);
		// Info exclusiva para la vista de Editar
		if (codigo == "editar") {
			let camposDD = variables
				.camposDD()
				.filter((n) => n[entidad])
				.filter((n) => !n.omitirRutinaVista);
			var camposDD1 = camposDD.filter((n) => n.antesDePais);
			var camposDD2 = camposDD.filter((n) => !n.antesDePais && n.campo != "produccion");
			var camposDD3 = camposDD.filter((n) => n.campo == "produccion");
			var BD_paises = await BD_varias.obtenerTodos("paises", "nombre");
			var BD_idiomas = await BD_varias.obtenerTodos("idiomas", "nombre");
			var datosPers = await variables.datosPersSelect();
		} else var [camposDD1, camposDD2, BD_paises, BD_idiomas, datosPers] = [];
		// Ir a la vista
		return res.render("0-RUD", {
			tema,
			codigo,
			titulo,
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
			datosPers,
			errores: {},
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
	if (!entidad || !ID) errorEnQuery = "Producto no encontrado";
	// Entidad inexistente
	producto = varias.producto(entidad);
	if (!producto) errorEnQuery = "Producto no encontrado";
	return errorEnQuery;
};
