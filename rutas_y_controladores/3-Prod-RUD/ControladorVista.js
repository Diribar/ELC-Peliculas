// ************ Requires *************
let BD_varias = require("../../funciones/BD/Varias");
let BD_especificas = require("../../funciones/BD/Especificas");
let varias = require("../../funciones/Varias/Varias");
let variables = require("../../funciones/Varias/Variables");
let validar = require("../../funciones/Prod-RUD/2-Validar");

// *********** Controlador ***********
module.exports = {
	detalleEdicionForm: async (req, res) => {
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
		if (funcionNoAprobado(prodOriginal, entidad, userID)) {
			req.session.noAprobado = prodOriginal;
			res.cookie("noAprobado", req.session.noAprobado, {maxAge: 24 * 60 * 60 * 1000});
			return res.send("Producto no aprobado");
		}
		// User la versión 'session' (si existe) en vez de la guardada
		if (req.session.edicion && req.session.edicion.entidad == entidad && req.session.edicion.id == prodID)
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
		let paises = prodOriginal.paises_id ? await varias.paises_idToNombre(prodOriginal.paises_id) : "";
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
			var camposDD2 = camposDD.filter((n) => !n.antesDePais && n.nombreDelCampo != "produccion");
			var camposDD3 = camposDD.filter((n) => n.nombreDelCampo == "produccion");
			var BD_paises = await BD_varias.obtenerTodos("paises", "nombre");
			var BD_idiomas = await BD_varias.obtenerTodos("idiomas", "nombre");
			var camposDP = await variables.camposDP().then((n) => n.filter((m) => m.grupo != "calificala"));
			var tiempo = prodEditado.editado_en
				? Math.max(10, parseInt((prodEditado.editado_en - new Date() + 1000 * 60 * 60) / 1000 / 60))
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
			Producto: prodCombinado,
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
	edicionGuardar: async (req, res) => {
		// Obtener los datos identificatorios del producto
		let entidad = req.body.entidad;
		let prodID = req.body.id;
		// Redireccionar si se encuentran errores en la entidad y/o el prodID
		let errorEnQuery = varias.revisarQuery(entidad, prodID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Obtener el userID
		let userID = req.session.usuario.id;
		// Problema: USUARIO CON OTROS PRODUCTOS CAPTURADOS

		// Obtener el producto 'Original'
		let prodOriginal = await BD_varias.obtenerPorIdConInclude(entidad, prodID, ["status_registro"]).then(
			(n) => n.toJSON()
		);
		// Obtener el producto 'Editado' guardado, si lo hubiera
		let prodEditado = await BD_varias.obtenerPor3Campos(
			"productos_edic",
			"elc_entidad",
			entidad,
			"elc_id",
			prodID,
			"editado_por_id",
			userID
		).then((n) => {
			n ? n.toJSON() : "";
		});
		// Verificar si el producto está capturado
		if (prodEditado) {
			// Problema: EDICION 'CAPTURADA'
		}
		// Obtener el 'avatar' --> prioridades: data-entry, edición, original
		let avatar = req.file
			? req.file.filename
			: prodEditado && prodEditado.avatar
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
			// Se necesita para preservar la hora en la que se creó la edición
			let edicion = {...prodEditado, ...req.body, avatar};
			// Quitar de 'edicion' los campos innecesarios
			delete edicion.id;
			edicion = BD_especificas.quitarLosCamposSinContenido(edicion);
			edicion = BD_especificas.quitarDeEdicionLasCoincidenciasConOriginal(prodOriginal, edicion);
			// Completar los datos de edicion
			edicion = {
				...edicion,
				elc_id: prodID,
				elc_entidad: entidad,
				editado_por_id: userID,
				entidad: "productos_edic",
				status_registro_id: await determinarStatusRegistroId(prodOriginal, prodEditado),
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
	edicionEliminar: async (req, res) => {
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
		// DETALLE - ABM
		// Tema y Código
		let tema = "producto";
		let codigo = "links";
		// Obtener los datos identificatorios del producto y del usuario
		let prodEntidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Redireccionar si se encuentran errores en la prodEntidad y/o el prodID
		let errorEnQuery = varias.revisarQuery(prodEntidad, prodID);
		if (errorEnQuery) return res.send(errorEnQuery);
		// Obtener el producto
		let [, Producto] = await BD_especificas.obtenerVersionesDeProducto(prodEntidad, prodID, userID);
		// Problema: PRODUCTO NO ENCONTRADO
		if (!Producto) return res.send("Producto no encontrado");
		// Obtener información de BD
		let linksCombinados = await obtenerLinksCombinados(prodEntidad, prodID, userID);
		let linksProveedores = await BD_varias.obtenerTodos("links_proveedores", "orden").then((n) =>
			n.map((m) => m.toJSON())
		);
		let linksTipos = await BD_varias.obtenerTodos("links_tipos", "id").then((n) =>
			n.map((m) => m.toJSON())
		);

		// Separar entre 'activos' e 'inactivos'
		let [linksActivos, linksInactivos] = await ActivosInactivos(linksCombinados);
		// Configurar el producto, el título y el avatar
		let producto = varias.producto(prodEntidad);
		let titulo = "Links de" + (prodEntidad == "capitulos" ? "l " : " la ") + producto;
		let avatar = await obtenerAvatar(prodEntidad, prodID, userID, Producto);
		// Obtener datos para la vista
		if (prodEntidad == "capitulos")
			Producto.capitulos = await BD_especificas.obtenerCapitulos(
				Producto.coleccion_id,
				Producto.temporada
			);
		let dataEntry = req.session.links ? req.session.links : "";
		let motivos = await BD_varias.obtenerTodos("motivos_para_borrar", "orden")
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => n.filter((m) => m.links))
			.then((n) =>
				n.map((m) => {
					return {id: m.id, comentario: m.comentario};
				})
			);
		// Ir a la vista
		//return res.send(linksActivos);
		return res.render("0-RUD", {
			tema,
			codigo,
			titulo,
			linksActivos,
			linksInactivos,
			provs: linksProveedores,
			Producto,
			producto,
			entidad: prodEntidad,
			prodID,
			userID,
			links_tipos: linksTipos,
			vista: req.baseUrl + req.path,
			dataEntry,
			avatar,
			calidades: [144, 240, 360, 480, 720, 1080],
			motivos,
			haceUnaHora: varias.funcionHaceUnaHora(),
		});
	},
	linksAltasEditar: async (req, res) => {
		let datos = limpiarLosDatos(req.body);
		// Procesar los datos en la operación que corresponda
		let respuesta = datos.alta ? await altaDeLink(req, datos) : await edicionDeLink(req, datos);
		// Fin
		if (respuesta) return res.send(respuesta);
		//return res.send(datos)
		return res.redirect("/producto/links/?entidad=" + datos.prodEntidad + "&id=" + datos.prodID);
	},

	revisar: (req, res) => {
		return res.send("revisar");
	},

	calificala: (req, res) => {
		return res.send("Estoy en calificala");
	},

	eliminar: (req, res) => {
		return res.send("Estoy en eliminar");
	},
};

// FUNCIONES --------------------------------------------------
let entidad_id = (prodEntidad) => {
	return prodEntidad == "peliculas"
		? "pelicula_id"
		: prodEntidad == "colecciones"
		? "coleccion_id"
		: "capitulo_id";
};
let productoConLinksWeb = async (prodEntidad, prodID) => {
	// Obtener el producto con include a links
	let producto = await BD_varias.obtenerPorIdConInclude(prodEntidad, prodID, [
		"links_gratuitos_cargados",
		"links_gratuitos_en_la_web",
		"links",
		"status_registro",
	]).then((n) => n.toJSON());

	// Obtener los links gratuitos de películas del producto
	let links = await BD_varias.obtenerTodosPorCampoConInclude(
		"links_originales",
		entidad_id(prodEntidad),
		prodID,
		["status_registro", "link_tipo"]
	)
		.then((n) => n.map((m) => m.toJSON()))
		.then((n) => n.filter((n) => n.gratuito))
		.then((n) => n.filter((n) => n.link_tipo.pelicula));

	// Obtener los links 'Aprobados' y 'TalVez'
	let linksActivos = links.length ? links.filter((n) => n.status_registro.aprobado) : false;
	let linksTalVez = links.filter((n) => n.status_registro.creado || n.status_registro.editado);
	if (!linksActivos.length && !linksTalVez.length) return;

	// Obtener los ID de si, no y TalVez
	si_no_parcial = await BD_varias.obtenerTodos("si_no_parcial", "id").then((n) => n.map((m) => m.toJSON()));
	let si = si_no_parcial.find((n) => n.si).id;
	let talVez = si_no_parcial.find((n) => !n.si && !n.no).id;
	let no = si_no_parcial.find((n) => n.no).id;

	// Acciones si existen 'linksActivos'
	if (linksActivos.length) {
		let datos = {links_gratuitos_cargados_id: si, links_gratuitos_en_la_web_id: si};
		BD_varias.actualizarRegistro(prodEntidad, prodID, datos);
		return;
	} else if (producto.links_gratuitos_en_la_web_id == si) {
		let datos = {links_gratuitos_en_la_web_id: talVez};
		BD_varias.actualizarRegistro(prodEntidad, prodID, datos);
	}

	// Acciones si existen 'linksTalVez'
	if (linksTalVez.length) {
		let datos = {links_gratuitos_cargados_id: talVez};
		BD_varias.actualizarRegistro(prodEntidad, prodID, datos);
		return;
	}

	// Acciones si no se cumplen los anteriores
	let datos = {links_gratuitos_cargados_id: no};
	BD_varias.actualizarRegistro(prodEntidad, prodID, datos);
	return;
};
let obtenerLinksCombinados = async (prodEntidad, prodID, userID) => {
	// Definir valores necesarios
	let campo_id = entidad_id(prodEntidad);
	let includes = ["link_tipo", "link_prov", "status_registro"];
	// Obtener los linksOriginales
	let linksOriginales = await BD_varias.obtenerTodosPorCampoConInclude(
		"links_originales",
		campo_id,
		prodID,
		includes
	).then((n) => n.map((m) => m.toJSON()));
	// Combinarlos con la edición, si existe
	includes.splice(includes.indexOf("link_prov"), 1);
	let linksCombinados = linksOriginales;
	// Rutina de combinación
	for (let i = 0; i < linksOriginales.length; i++) {
		// Obtener el duplicado
		linkEditado = await BD_varias.obtenerPor2CamposConInclude(
			"links_edicion",
			"elc_id",
			linksOriginales[i].id,
			"editado_por_id",
			userID,
			includes
		).then((n) => (n ? n.toJSON() : null));
		// Hacer la combinación
		if (linkEditado) {
			delete linkEditado.id;
			linksCombinados[i] = {...linksOriginales[i], ...linkEditado};
		}
		linksCombinados[i] = BD_especificas.quitarLosCamposSinContenido(linksCombinados[i]);
	}
	// Fin
	return linksCombinados;
};
let obtenerLinkCombinado = async (elc_id, userID) => {
	let linkEditado = await BD_varias.obtenerPor2CamposConInclude(
		"links_edicion",
		"elc_id",
		elc_id,
		"editado_por_id",
		userID
	).then((n) => (n ? n.toJSON() : ""));
	// Hacer la combinación
	// Si existe 'linkEditado', se preserva su 'id'
	let linkCombinado = {...linkOriginal, ...linkEditado};
	// Fin
	return linkCombinado;
};
let ActivosInactivos = async (linksOriginales) => {
	if (!linksOriginales.length) return [[], []];
	// linksActivos: Aprobados + Creados por el usuario
	let linksActivos = linksOriginales.filter(
		(n) => n.status_registro.creado || n.status_registro.editado || n.status_registro.aprobado
	);
	// linksInactivos --> incluye el motivo
	let linksInactivos = linksOriginales.filter(
		(n) =>
			n.status_registro.sugerido_borrar ||
			n.status_registro.sugerido_desborrar ||
			n.status_registro.borrado
	);
	for (i = 0; i < linksInactivos.length; i++) {
		let registro_borrado = await BD_varias.obtenerPor2CamposConInclude(
			"registros_borrados",
			"elc_id",
			linksInactivos[i].id,
			"elc_entidad",
			"links_originales",
			["motivo"]
		);
		linksInactivos[i].motivo = registro_borrado.motivo.nombre;
	}
	return [linksActivos, linksInactivos];
};
let obtenerAvatar = async (prodEntidad, prodID, userID, Producto) => {
	let registroEditado = await BD_varias.obtenerPor3Campos(
		"productos_edic",
		"elc_entidad",
		prodEntidad,
		"elc_id",
		prodID,
		"editado_por_id",
		userID
	).then((n) => {
		return n ? n.toJSON() : "";
	});
	let imagenOr = Producto.avatar;
	let imagenEd = registroEditado.avatar;
	return imagenEd
		? (imagenEd.slice(0, 4) != "http" ? "/imagenes/3-ProdRevisar/" : "") + imagenEd
		: imagenOr
		? (imagenOr.slice(0, 4) != "http" ? "/imagenes/2-Productos/" : "") + imagenOr
		: "/imagenes/8-Agregar/IM.jpg";
};
let funcionNoAprobado = (prodOriginal, prodEntidad, userID) => {
	let noAprobada = !prodOriginal.status_registro.aprobado;
	let otroUsuario = prodOriginal.creado_por_id != userID;
	return (
		noAprobada &&
		otroUsuario &&
		(prodEntidad != "capitulos" ||
			(prodEntidad == "capitulos" && prodOriginal.coleccion.creado_por_id != userID))
	);
};
let altaDeLink = async (req, datos) => {
	// Redireccionar si se encuentran errores en la prodEntidad y/o el prodID
	errorEnQuery = varias.revisarQuery(datos.prodEntidad, datos.prodID);
	if (errorEnQuery) return errorEnQuery;
	// Averiguar si hay errores de validación
	let errores = await validar.links(datos);
	if (errores.hay) {
		req.session.links = datos;
	} else {
		// Si no hubieron errores de validación...
		if (!datos.parte) datos.parte = "-";
		// Generar información para el nuevo registro
		let userID = req.session.usuario.id;
		datos = {
			...datos,
			entidad: "links_originales",
			[entidad_id(datos.prodEntidad)]: datos.prodID,
			creado_por_id: userID,
		};
		// Agregar el 'link' a la BD
		await BD_varias.agregarRegistro(datos);
		// Eliminar req.session.edicion
		req.session.links = {};
		// Adecuar el producto respecto al link
		productoConLinksWeb(datos.prodEntidad, datos.prodID);
	}
	return "";
};
let edicionDeLink = async (req, datos) => {
	// Redireccionar si se encuentran errores en la prodEntidad y/o el prodID
	errorEnQuery = varias.revisarQuery(datos.prodEntidad, datos.prodID);
	if (errorEnQuery) return errorEnQuery;
	// Averiguar si hay errores de validación
	let errores = await validar.links(datos);
	if (errores.hay) req.session.links = datos;
	else {
		// Si no hubieron errores de validación...
		// Adecuar la información del formulario
		if (!datos.parte) datos.parte = "-";
		// Averiguar si el link está en 'creado' y por este usuario
		let linkOriginal = await BD_varias.obtenerPorIdConInclude("links_originales", datos.id, [
			"status_registro",
		]).then((n) => n.toJSON());
		let userID = req.session.usuario.id;
		if (linkOriginal.status_registro.creado && linkOriginal.creado_por_id == userID) {
			// Editados reemplaza el original
			// 1. Obtener el link 'Original Nuevo'
			linkOriginalNuevo = {...linkOriginal, ...datos};
			//return linkOriginalNuevo
			// 2. Actualizarlo en la BD
			await BD_varias.actualizarRegistro("links_originales", datos.id, linkOriginalNuevo)
		} else {
			// Editados se guarda en versión edición
			// 1. Obtener el link 'Edición Nueva'
			// 1.1. Obtener el link 'combinado'
			let linkCombinado = await obtenerLinkCombinado((elc_id = linkOriginal.id), userID);
			// 1.2. Adecuar la información del formulario
			datos.entidad = "links_edicion";
			// 1.3. Obtener el link 'Edición Nueva'
			var linkEdicionNueva = {...linkCombinado, ...datos};
			// 1.4. Quitar los coincidencias con el original
			linkEdicionNueva = BD_especificas.quitarDeEdicionLasCoincidenciasConOriginal(
				linkOriginal,
				linkEdicionNueva
			);
			// 2. Temas de 'id'...
			// 2.1. Elimina el id de la edición nueva, porque no se necesita y puede entorpecer
			delete linkEdicionNueva.id;
			// 2.2. Si el linkCombinado incluye una edición previa, se toma su 'id' para eliminarla
			if (linkEdicionNueva.elc_id)
				await BD_varias.eliminarRegistro("links_edicion", (id = linkCombinado.id));
			else {
				// 3. De lo contrario, se completa la info
				linkEdicionNueva = {
					...linkEdicionNueva,
					elc_id: linkOriginal.id,
					editado_por_id: userID,
					status_registro_id: await determinarStatusRegistroId(linkOriginal, null),
				};
			}
			// 3. Agregar 'edición' a la BD
			await BD_varias.agregarRegistro(linkEdicionNueva);
		}
	}
	return "";
	// return linkEdicionNueva
};
let limpiarLosDatos = (datos) => {
	// Adecuaciones iniciales al objeto 'datos'
	datos.alta = datos.numeroFila == datos.calidad.length - 1 || typeof datos.calidad == "string";
	if (datos.alta) delete datos.id;
	delete datos.motivo_id;
	// Obtener los datos de la fila que necesitamos
	for (campo in datos) {
		if (typeof datos[campo] == "object") datos[campo] = datos[campo][datos.numeroFila];
	}
	// Quitar campos innecesarios
	datos = BD_especificas.quitarLosCamposSinContenido(datos);
	// Fin
	return datos;
};
let determinarStatusRegistroId = async (prodOriginal, prodEditado) => {
	let status_registro = await BD_varias.obtenerTodos("status_registro_ent", "orden");
	return prodEditado
		? // 1. Si existe la 'edicion guardada' --> lo copia
		  prodEditado.status_registro_id
		: prodOriginal.status_registro.creado
		? // 2.1. Si el status de 'original' es 'creada' --> lo copia
		  prodOriginal.status_registro_id
		: prodOriginal.status_registro.aprobado
		? // 2.2. Si el status de 'original' es 'aprobado' --> 'edicion'
		  status_registro.find((n) => n.editado).id
		: "";
};
