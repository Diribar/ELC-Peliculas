// ************ Requires *************
let BD_varias = require("../../funciones/BD/Varias");
let BD_especificas = require("../../funciones/BD/Especificas");
let varias = require("../../funciones/Varias/Varias");
let variables = require("../../funciones/Varias/Variables");
let validar = require("../../funciones/Prod-RUD/2-Validar");
const {camposDD} = require("../../funciones/Varias/Variables");

// *********** Controlador ***********
module.exports = {
	detEdicForm: async (req, res) => {
		// DETALLE - EDICIÓN
		// Tema y Código
		let tema = "producto";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.indexOf("/"));
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Redireccionar si se encuentran errores en la entidad y/o el prodID
		let errorEnQuery = varias.revisarQuery(entidad, prodID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Obtener los datos ORIGINALES y EDITADOS del producto
		let [prodOriginal, prodEditado] = await BD_especificas.obtenerVersionesDeProducto(
			entidad,
			prodID,
			userID
		);
		// Problema: PRODUCTO NO ENCONTRADO
		if (!prodOriginal) return res.send("Producto no encontrado");
		// Problema: PRODUCTO NO APROBADO
		let noAprobada = !prodOriginal.status_registro.aprobado;
		let otroUsuario = prodOriginal.creado_por_id != userID;
		if (noAprobada && otroUsuario) {
			if (
				entidad != "capitulos" ||
				!(entidad == "capitulos" && prodOriginal.coleccion.creado_por_id == userID)
			) {
				req.session.noAprobado = prodOriginal;
				res.cookie("noAprobado", req.session.noAprobado, {maxAge: 24 * 60 * 60 * 1000});
				return res.send("Producto no aprobado");
			}
		}
		// User la versión 'session' (si existe) en vez de la guardada
		if (
			req.session.edicion &&
			req.session.edicion.entidad == entidad &&
			req.session.edicion.id == prodID
		)
			prodEditado = {...prodEditado, ...req.session.edicion};
		// Generar los datos a mostrar en la vista
		prodCombinado = {...prodOriginal, ...prodEditado};
		// Obtener avatar
		let imagen = prodCombinado.avatar;
		let avatar = imagen
			? (imagen.slice(0, 4) != "http"
					? prodEditado.avatar
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
			var camposDD = variables
				.camposDD()
				.filter((n) => n[entidad])
				.filter((n) => !n.omitirRutinaVista);
			var camposDD1 = camposDD.filter((n) => n.antesDePais);
			var camposDD2 = camposDD.filter(
				(n) => !n.antesDePais && n.nombreDelCampo != "produccion"
			);
			var camposDD3 = camposDD.filter((n) => n.nombreDelCampo == "produccion");
			var BD_paises = await BD_varias.obtenerTodos("paises", "nombre");
			var BD_idiomas = await BD_varias.obtenerTodos("idiomas", "nombre");
			var camposDP = await variables
				.camposDP()
				.then((n) => n.filter((m) => m.grupo != "calificala"));
			var tiempo = prodEditado.capturado_en
				? Math.max(
						10,
						parseInt(
							(prodEditado.capturado_en - new Date() + 1000 * 60 * 60) / 1000 / 60
						)
				  )
				: false;
		} else var [camposDD1, camposDD2, BD_paises, BD_idiomas, camposDP, tiempo] = [];
		// Averiguar si hay errores de validación
		let errores = await validar.edicion("", {...prodCombinado, entidad});
		// Obtener datos para la vista
		if (entidad == "capitulos")
			prodCombinado.capitulos = await BD_especificas.obtenerCapitulos(
				prodCombinado.coleccion_id,
				prodCombinado.temporada
			);
		// Ir a la vista
		//return res.send(prodOriginal)
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
			errores,
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

		// Obtener el producto editado anterior, si lo hubiera
		let prodEditado = await BD_varias.obtenerPor3Campos(
			"productos_edic",
			"ELC_entidad",
			entidad,
			"ELC_id",
			prodID,
			"editado_por_id",
			userID
		).then((n) => (n ? n.dataValues : ""));
		// Verificar si el producto está capturado
		if (prodEditado) {
			// Problema: EDICION 'CAPTURADA'
		}
		// Obtener el producto 'Original'
		let prodOriginal = await BD_varias.obtenerPorIdConInclude(entidad, prodID, [
			"status_registro",
		]).then((n) => n.dataValues);
		// Obtener el 'avatar' --> prioridades: data-entry, edición, original
		let avatar = req.file
			? req.file.filename
			: prodEditado.avatar
			? prodEditado.avatar
			: prodOriginal.avatar;
		// Unir 'Edición' y 'Original'
		let prodCombinado = {...prodOriginal, ...prodEditado, ...req.body, avatar};
		// Averiguar si hay errores de validación
		let errores = await validar.edicion("", {...prodCombinado, entidad});
		if (errores.hay) {
			if (req.file) delete prodCombinado.avatar;
			if (req.file) varias.borrarArchivo(req.file.filename, req.file.path);
			req.session.edicion = prodCombinado;
		} else {
			// Si no hubieron errores de validación...
			// Actualizar los archivos avatar
			if (req.file) {
				// Mover el archivo actual a su ubicación para ser revisado
				varias.moverImagenCarpetaDefinitiva(prodCombinado.avatar, "3-ProdRevisar");
				// Eliminar el anterior archivo de imagen
				if (prodEditado.avatar)
					varias.borrarArchivo(prodEditado.avatar, "./public/imagenes/3-ProdRevisar");
			}
			// Unir las 2 ediciones en una sola
			let edicion = {...prodEditado, ...req.body, avatar};
			delete edicion.id;
			// Quitar de 'edicion' las coincidencias con 'original' que vienen del 'req.body'
			let campos = Object.keys({...req.body, avatar});
			for (campo of campos) {
				if (edicion[campo] == prodOriginal[campo]) delete edicion[campo];
			}
			// Eliminar de edicion los campos null
			campos = Object.keys(edicion);
			for (campo of campos) {
				if (edicion[campo] == null) delete edicion[campo];
			}
			// Determinar el 'status_registro_id'
			let status_registro = await BD_varias.obtenerTodos("status_registro_prod", "orden");
			// 1. Si existe la 'edicion guardada' --> lo copia
			// 2. Si no existe la 'edicion guardada',
			// 2.1. Si el status de 'original' es 'creada' --> lo copia
			// 2.2. Si el status de 'original' es 'aprobado' --> 'edicion'
			let status_registro_id = prodEditado
				? prodEditado.status_registro_id
				: prodOriginal.status_registro.creado
				? prodOriginal.status_registro_id
				: prodOriginal.status_registro.aprobado
				? status_registro.find((n) => n.editado).id
				: "";
			// Completar los datos de edicion
			edicion = {
				...edicion,
				ELC_id: prodID,
				ELC_entidad: entidad,
				editado_por_id: req.session.usuario.id,
				capturado_por_id: req.session.usuario.id,
				entidad: "productos_edic",
				status_registro_id,
			};
			// Eliminar prodEditado (si existía) de la BD
			if (prodEditado) await BD_varias.eliminarRegistro("productos_edic", prodEditado.id);
			// Agregar 'edición' a la BD
			await BD_varias.agregarRegistro(edicion);
			// Eliminar req.session.edicion
			req.session.edicion = {};
		}
		return res.redirect("/producto/edicion/?entidad=" + entidad + "&id=" + prodID);
	},
	edicElim: async (req, res) => {
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let ID = req.query.id;
		// Redireccionar si se encuentran errores en la entidad y/o el ID
		let errorEnQuery = varias.revisarQuery(entidad, ID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Pendiente...
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
		let prodID = req.query.id;
		// Redireccionar si se encuentran errores en la entidad y/o el prodID
		let errorEnQuery = varias.revisarQuery(entidad, prodID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Definir los campos include
		let includes = ["link_tipo", "link_prov", "status_registro"];
		// Obtener el 'campo_id'
		let campo_id =
			entidad == "peliculas"
				? "pelicula_id"
				: entidad == "colecciones"
				? "coleccion_id"
				: "capitulo_id";
		// Obtener el producto, los links_provs, los provs y los tipos de links
		let [registroProd, links_prods, provs, links_tipos] = await Promise.all([
			BD_varias.obtenerPorIdConInclude(
				entidad,
				prodID,
				entidad == "capitulos" ? "coleccion" : ""
			).then((n) => {
				return n ? n.toJSON() : "";
			}),
			BD_varias.obtenerTodosPorCampoConInclude("links_prods", campo_id, prodID, includes),
			BD_varias.obtenerTodos("links_provs", "orden").then((n) => n.map((m) => m.dataValues)),
			BD_varias.obtenerTodos("links_tipos", "id").then((n) => n.map((m) => m.dataValues)),
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
			prodID,
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
		// Obtener datos para la vista
		if (entidad == "capitulos")
			registroProd.capitulos = await BD_especificas.obtenerCapitulos(
				registroProd.coleccion_id,
				registroProd.temporada
			);
		let dataEntry = req.session.links ? req.session.links : "";
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
			prodID,
			usuario,
			links_tipos,
			vista: req.baseUrl + req.path,
			dataEntry,
			avatar,
			calidades: [144, 240, 360, 480, 720, 1080],
		});
	},
	linksGuardar: async (req, res) => {
		//return res.send(req.body)
		let datos = req.body;
		// Obtener los datos identificatorios del producto
		let entidad = datos.entidad;
		let prodID = datos.id;
		// Redireccionar si se encuentran errores en la entidad y/o el prodID
		let errorEnQuery = varias.revisarQuery(entidad, prodID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Obtener el userID
		let usuario = req.session.usuario;
		let userID = usuario.id;
		// Problema: USUARIO CON OTROS PRODUCTOS CAPTURADOS

		// Averiguar si hay errores de validación
		let errores = await validar.links(datos);
		if (errores.hay) {
			req.session.links = datos;
		} else {
			// Si no hubieron errores de validación...
			// Adecuar algunos campos y valores
			let entidad_id =
				entidad == "peliculas"
					? "pelicula_id"
					: entidad == "colecciones"
					? "coleccion_id"
					: "capitulo_id";
			datos = {
				...datos,
				[entidad_id]: prodID,
				entidad: "links_prods",
				creado_por_id: userID,
			};
			delete datos.id;
			// Agregar 'el link' a la BD
			//return res.send(datos);
			await BD_varias.agregarRegistro(datos);
			// Eliminar req.session.edicion
			req.session.links = {};
		}
		return res.redirect("/producto/links/?entidad=" + entidad + "&id=" + prodID);
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
