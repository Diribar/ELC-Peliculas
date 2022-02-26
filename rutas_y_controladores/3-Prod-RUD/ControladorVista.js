// ************ Requires *************
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");
let varias = require("../../funciones/Varias/varias");
let variables = require("../../funciones/Varias/variables");
let validarProd = require("../../funciones/Prod-Agregar/3-Validar");

// *********** Controlador ***********
module.exports = {
	edicForm: async (req, res) => {
		// DETALLE - EDICIÓN
		// Tema y Código
		let tema = "producto";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.indexOf("/"));
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		// Redireccionar si se encuentran errores en la entidad y/o el prodID
		let errorEnQuery = varias.revisarQuery(entidad, prodID);
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
		let prodOriginal = await BD_varias.obtenerPorIdConInclude(entidad, prodID, includes).then(
			(n) => {
				return n ? n.toJSON() : "";
			}
		);
		// Problema: PRODUCTO NO ENCONTRADO
		if (!prodOriginal) return res.send("Producto no encontrado");
		// Problema: PRODUCTO NO APROBADO
		let noAprobada = !prodOriginal.status_registro.aprobado;
		let usuario = req.session.usuario;
		let otroUsuario = prodOriginal.creado_por_id != usuario.id;
		if (noAprobada && otroUsuario) {
			if (
				entidad != "capitulos" ||
				!(entidad == "capitulos" && prodOriginal.coleccion.creado_por_id == usuario.id)
			) {
				req.session.noAprobado = prodOriginal;
				res.cookie("noAprobado", req.session.noAprobado, {maxAge: 24 * 60 * 60 * 1000});
				return res.send("Producto no aprobado");
			}
		}
		// Quitarle los campos 'null'
		let campos = Object.keys(prodOriginal);
		for (i = campos.length - 1; i >= 0; i--) {
			if (prodOriginal[campos[i]] === null) delete prodOriginal[campos[i]];
		}
		// Obtener los datos editados
		let prodEditado = await BD_varias.obtenerPor3CamposConInclude(
			"productos_edic",
			"ELC_entidad",
			entidad,
			"ELC_id",
			prodOriginal.id,
			"editado_por_id",
			usuario.id,
			includes.slice(0, -2)
		).then((n) => {
			return n ? n.toJSON() : "";
		});
		// Información sobre la versión original y editada
		let existeEdicion = !!prodEditado;
		let version = req.query.verOriginal == "true" || !existeEdicion ? "original" : "edicion";
		// Generar los datos a mostrar en la vista
		if (version == "edicion") {
			// Quitarle los campos 'null'
			let campos = Object.keys(prodEditado);
			for (i = campos.length - 1; i >= 0; i--) {
				if (prodEditado[campos[i]] === null) delete prodEditado[campos[i]];
			}
			// Preparar la info a cruzar
			edicion = {...prodEditado};
			delete edicion.id;
			// Cruzar la info
			prodCombinado = {...prodOriginal, ...edicion};
		} else prodCombinado = {...prodOriginal};
		// Obtener avatar
		let imagen = prodCombinado.avatar;
		var avatar = imagen
			? (imagen.slice(0, 4) != "http"
					? version == "edicion" && prodEditado.avatar
						? "/imagenes/3-ProdRevisar/"
						: "/imagenes/2-Productos/"
					: "") + imagen
			: "/imagenes/8-Agregar/IM.jpg";
		// Obtener los países
		let paises = prodOriginal.paises_id
			? await varias.paises_idToNombre(prodOriginal.paises_id)
			: "";
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
							(prodEditado.capturado_en - new Date() + 1000 * 60 * 60) / 1000 / 60
						)
				  )
				: false;
		} else var [camposDD1, camposDD2, BD_paises, BD_idiomas, camposDP, tiempo] = [];
		// Obtener datos para la vista
		if (entidad == "capitulos")
			prodCombinado.capitulos = await BD_especificas.obtenerCapitulos(
				prodCombinado.coleccion_id,
				prodCombinado.temporada
			);
		// Ir a la vista
		return res.render("0-RUD", {
			tema,
			codigo,
			titulo,
			producto,
			entidad,
			prodID,
			registro: prodCombinado,
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
			vista: req.baseUrl + req.path,
		});
	},

	edicAct: async (req, res) => {
		// Obtener los datos identificatorios del producto
		let entidad = req.body.entidad;
		let prodID = req.body.id;
		// Redireccionar si se encuentran errores en la entidad y/o el prodID
		let errorEnQuery = varias.revisarQuery(entidad, prodID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Obtener el userID
		let usuario = req.session.usuario;
		let userID = usuario.id;
		// Problema: USUARIO CON OTROS PRODUCTOS CAPTURADOS

		// Problema: EL USUARIO NO TIENE UNA EDICION DE ESTE PRODUCTO
		let prodEditado = await BD_varias.obtenerPor3Campos(
			"productos_edic",
			"ELC_entidad",
			entidad,
			"ELC_id",
			prodID,
			"editado_por_id",
			userID
		);
		if (!prodEditado) return res.send("No tenés una edicion de este producto");
		// Problema: PRODUCTO 'CAPTURADO'

		// Obtener el registro 'Original'
		let prodOriginal = await BD_varias.obtenerPorId(entidad, prodID).then((n) => n.dataValues);
		// Obtener el 'avatar' --> prioridades: data-entry, edición, original
		let avatar = req.file
			? req.file.filename
			: prodEditado.avatar
			? prodEditado.avatar
			: prodOriginal.avatar;
		if (req.file && req.file.filename) {
			// Mover el archivo a 3-ProdRevisar
			// Eliminar archivo 3-ProdRevisar/prodEditado.avatar
		}
		// Unir 'Original' y 'Edición'
		let prodCombinado = {...prodOriginal, ...req.body, avatar};
		// return res.send([prodCombinado, req.body]);
		// Averiguar si hay errores de validación DD
		let camposDD = variables
			.camposDD()
			.filter((n) => n[entidad])
			.map((n) => n.campo);
		let erroresDD = await validarProd.datosDuros(camposDD, prodCombinado)
		// Averiguar si hay errores de validación DP
		let camposDP = await variables.camposDP().then(n=>n.map(m=>m.campo))
		for (i = camposDP.length - 1; i >= 0; i--) {
			if (
				camposDP[i] == "fe_valores_id" ||
				camposDP[i] == "entretiene_id" ||
				camposDP[i] == "calidad_tecnica_id"
			)
				camposDP.splice(i, 1);
		}
		let erroresDP = await validarProd.datosPers(camposDP, prodCombinado)
		//return res.send([erroresDD, erroresDP])
		// Si hay errores de validación, redireccionar
		if (erroresDD.hay || erroresDP.hay) {
			// Session para data-entry
			req.session.edicion = req.body;
			// Redireccionar
			return res.redirect("/producto/edicion/?entidad=" + entidad + "&id=" + prodID);
		}

		// Si no hay errores,
		// Obtener los campos del form
		// Quitar coincidencias de 'edicion' con 'original'

		// Quitar vacíos de 'editar'

		//

		// Terminar
		return res.send(["Actualizar", req.body]);
	},

	edicElim: async (req, res) => {
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let ID = req.query.id;
		// Redireccionar si se encuentran errores en la entidad y/o el ID
		let errorEnQuery = varias.revisarQuery(entidad, ID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Terminar
		return res.send(["Eliminar", entidad, ID]);
	},

	linksForm: async (req, res) => {
		// DETALLE - ALTAS - BAJAS
		// Tema y Código
		let tema = "producto";
		let codigo = "links";
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let ID = req.query.id;
		// Redireccionar si se encuentran errores en la entidad y/o el ID
		let errorEnQuery = varias.revisarQuery(entidad, ID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Definir los campos include
		let includes = [
			"link_tipo",
			"link_prov",
			"creado_por",
			"alta_analizada_por",
			"baja_analizada_por",
			"status_registro",
		];
		// Obtener el 'campo_id'
		let campo_id =
			entidad == "peliculas"
				? "pelicula_id"
				: entidad == "colecciones"
				? "coleccion_id"
				: "capitulo_id";
		// Obtener el producto y los links_provs
		let [registroProd, links_prods, provs] = await Promise.all([
			BD_varias.obtenerPorIdConInclude(
				entidad,
				ID,
				entidad == "capitulos" ? "coleccion" : ""
			).then((n) => {
				return n ? n.toJSON() : "";
			}),

			BD_varias.obtenerTodosPorCampoConInclude("links_prods", campo_id, ID, includes),
			BD_varias.obtenerTodos("links_provs", "orden").then((n) => n.map((m) => m.dataValues)),
		]);
		// Problema: PRODUCTO NO ENCONTRADO
		if (!registroProd) return res.send("Producto no encontrado");
		// Obtener el usuario
		let usuario = req.session.req.session.usuario;
		// Obtener los links del producto. Se incluyen:
		// linksAprob: Aprobados + Creados por el usuario
		let linksAprob = [
			...links_prods.filter((n) => n.status_registro.aprobado),
			...links_prods.filter((n) => n.status_registro.creado && n.creado_por_id == usuario.id),
		];
		// linksBorr --> incluye el motivo y el comentario
		let linksBorr = links_prods.filter(
			(n) => n.status_registro.sugerido_borrar || n.status_registro.borrado
		);
		if (linksBorr.length) {
			for (i = 0; i < linksBorr; i++) {
				let registro_borrado = await BD_varias.obtenerPor2CamposConInclude(
					"registros_borrados",
					"ELC_id",
					linksBorr[i].id,
					"ELC_entidad",
					"links_prods",
					["motivo"]
				);
				linksBorr[i].motivo = registro_borrado.motivo.nombre;
				linksBorr[i].comentario = registro_borrado.comentario;
			}
		}
		// Configurar el Producto y el Título
		let producto = varias.producto(entidad);
		let titulo = "Links de" + (entidad == "capitulos" ? "l " : " la ") + producto;
		// Obtener el avatar
		let registroEditado = await BD_varias.obtenerPor3Campos(
			"productos_edic",
			"ELC_entidad",
			entidad,
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
			? (imagenEd.slice(0, 4) != "http" ? "/imagenes/3-ProdRevisar/" : "") + imagenEd
			: imagenOr
			? (imagenOr.slice(0, 4) != "http" ? "/imagenes/2-Productos/" : "") + imagenOr
			: "/imagenes/8-Agregar/IM.jpg";
		// Obtener los tipos de links
		let links_tipos = await BD_varias.obtenerTodos("links_tipos", "id").then((n) =>
			n.map((m) => m.dataValues)
		);
		// Obtener datos para la vista
		if (entidad == "capitulos")
			registroProd.capitulos = await BD_especificas.obtenerCapitulos(
				registroProd.coleccion_id,
				registroProd.temporada
			);
		// Ir a la vista
		//return res.send(registroProd);
		return res.render("0-RUD", {
			tema,
			codigo,
			titulo,
			linksAprob,
			linksBorr,
			provs,
			registro: registroProd,
			producto,
			entidad,
			ID,
			avatar,
			usuario,
			links_tipos,
			vista: req.baseUrl + req.path,
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
		let errorEnQuery = varias.revisarQuery(entidad, ID);
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
