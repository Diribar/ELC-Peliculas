"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/BD/Genericas");
const BD_especificas = require("../../funciones/BD/Especificas");
const especificas = require("../../funciones/Varias/Especificas");
const variables = require("../../funciones/Varias/Variables");
const validar = require("../../funciones/Prod-RUD/2-Validar");

// *********** Controlador ***********
module.exports = {
	detalleEdicionForm: async (req, res) => {
		// DETALLE - EDICIÓN
		// 1. Tema y Código
		let tema = "producto";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.lastIndexOf("/"));
		// 2. Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// 3. Obtener los datos ORIGINALES y EDITADOS del producto
		let [prodOriginal, prodEditado] = await BD_especificas.obtenerVersionesDeProducto(
			entidad,
			prodID,
			userID
		);
		// 4. Obtener avatar
		let avatar = prodEditado.avatar
			? "/imagenes/3-ProdRevisar/" + prodEditado.avatar
			: prodOriginal.avatar
			? prodOriginal.avatar.slice(0, 4) != "http"
				? "/imagenes/2-Productos/" + prodOriginal.avatar
				: prodOriginal.avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// Usar la versión 'session' (si existe) en vez de la edición guardada
		let prodSession =
			req.session.edicion && req.session.edicion.entidad == entidad && req.session.edicion.id == prodID
				? {...prodOriginal, ...prodEditado, ...req.session.edicion}
				: "";
		let prodCombinado = {...prodOriginal, ...prodEditado, ...prodSession};
		// 5. Configurar el título de la vista
		let productoNombre = especificas.entidadNombre(entidad);
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? "l " : " la ") +
			productoNombre;
		// 6. Obtener los países
		let paises = prodOriginal.paises_id
			? await especificas.paises_idToNombre(prodOriginal.paises_id)
			: "";
		// 7. Info para la vista de Edicion o Detalle
		let bloquesIzquierda, bloquesDerecha;
		let camposDD1, camposDD2, camposDD3, camposDP, BD_paises, BD_idiomas;
		if (codigo == "edicion") {
			// Variables de 'Detalle'
			// Variables de 'Edición'
			let camposDD = variables
				.camposDD()
				.filter((n) => n[entidad])
				.filter((n) => !n.omitirRutinaVista);
			camposDD1 = camposDD.filter((n) => n.antesDePais);
			camposDD2 = camposDD.filter((n) => !n.antesDePais && n.nombreDelCampo != "produccion");
			camposDD3 = camposDD.filter((n) => n.nombreDelCampo == "produccion");
			BD_paises = await BD_genericas.obtenerTodos("paises", "nombre");
			BD_idiomas = await BD_genericas.obtenerTodos("idiomas", "nombre");
			camposDP = await variables.camposDP().then((n) => n.filter((m) => m.grupo != "calificala"));
		} else {
			// Variables de 'Detalle'
			let statusResumido = especificas.statusResumido(
				prodCombinado.status_registro,
				prodCombinado.capturado_en,
				prodCombinado.captura_activa
			);
			let bloque1 = [
				{titulo: "País" + (paises.includes(",") ? "es" : ""), valor: paises ? paises : "Sin datos"},
				{
					titulo: "Idioma original",
					valor: prodCombinado.idioma_original ? prodCombinado.idioma_original.nombre : "Sin datos",
				},
				{
					titulo: "En castellano",
					valor: prodCombinado.en_castellano ? prodCombinado.en_castellano.productos : "Sin datos",
				},
				{
					titulo: "Es a color",
					valor: prodCombinado.en_color ? prodCombinado.en_color.productos : "Sin datos",
				},
			];
			let bloque2 = [
				{titulo: "Dirección", valor: prodCombinado.direccion ? prodCombinado.direccion : "Sin datos"},
				{titulo: "Guión", valor: prodCombinado.guion ? prodCombinado.guion : "Sin datos"},
				{titulo: "Música", valor: prodCombinado.musica ? prodCombinado.musica : "Sin datos"},
				{
					titulo: "Producción",
					valor: prodCombinado.produccion ? prodCombinado.produccion : "Sin datos",
				},
			];
			let bloque3 = [
				{titulo: "Actuación", valor: prodCombinado.actuacion ? prodCombinado.actuacion : "Sin datos"},
			];
			bloquesIzquierda = [bloque1, bloque2, bloque3];
			bloquesDerecha = [
				{
					titulo: "Público Sugerido",
					valor: prodCombinado.publico_sugerido
						? prodCombinado.publico_sugerido.nombre
						: "Sin datos",
				},
				{
					titulo: "Categoría",
					valor: prodCombinado.categoria ? prodCombinado.categoria.nombre : "Sin datos",
				},
				{
					titulo: "Sub-categoría",
					valor: prodCombinado.subcategoria ? prodCombinado.subcategoria.nombre : "Sin datos",
				},
			];
			if (prodCombinado.personaje_id != 1)
				bloquesDerecha.push({titulo: "Personaje Histórico", valor: prodCombinado.personaje.nombre});
			if (prodCombinado.hecho_id != 1)
				bloquesDerecha.push({titulo: "Hecho Histórico", valor: prodCombinado.hecho.nombre});
			if (prodCombinado.valor_id != 1)
				bloquesDerecha.push({titulo: "Valor", valor: prodCombinado.valor.nombre});
			bloquesDerecha.push({titulo: "Año de estreno", valor: prodCombinado.ano_estreno});
			if (entidad == "colecciones")
				bloquesDerecha.push({titulo: "Año de fin", valor: prodCombinado.ano_fin});
			else bloquesDerecha.push({titulo: "Duracion", valor: prodCombinado.duracion + " min."});
			bloquesDerecha.push({
				titulo: "Status",
				valor: statusResumido.nombre,
				id: statusResumido.id,
			});
			// Variables de 'Edición'
		}
		// Averiguar si hay errores de validación
		let errores = await validar.edicion("", {...prodCombinado, entidad, id: prodID});
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
			entidad,
			prodID,
			producto: prodCombinado,
			avatar,
			bloquesIzquierda,
			bloquesDerecha,
			camposDD1,
			camposDD2,
			camposDD3,
			BD_paises,
			BD_idiomas,
			camposDP,
			errores,
			vista: req.baseUrl + req.path,
			paises,
			productoNombre,
		});
	},
	edicionGuardar: async (req, res) => {
		// Obtener los datos identificatorios del producto
		let entidad = req.body.entidad;
		let prodID = req.body.id;
		// Obtener el userID
		let userID = req.session.usuario.id;
		// Obtener el producto 'Original'
		let [prodOriginal, prodEditado] = await BD_especificas.obtenerVersionesDeProducto(
			entidad,
			prodID,
			userID
		);
		// Obtener el 'avatar' --> prioridades: data-entry, edición, original
		let avatar = req.file
			? req.file.filename
			: prodEditado && prodEditado.avatar
			? prodEditado.avatar
			: prodOriginal.avatar;
		// Unir 'Edición' y 'Original'
		let prodCombinado = {...prodOriginal, ...prodEditado, ...req.body, avatar};
		delete prodCombinado.id;
		// Averiguar si hay errores de validación
		let errores = await validar.edicion("", {...prodCombinado, entidad, id: prodID});
		if (errores.hay) {
			if (req.file) delete prodCombinado.avatar;
			if (req.file) especificas.borrarArchivo(req.file.path, req.file.filename);
			req.session.edicion = prodCombinado;
		} else {
			// Si no hubieron errores de validación...
			// Actualizar los archivos avatar
			if (req.file) {
				// Mover el archivo actual a su ubicación para ser revisado
				especificas.moverImagenCarpetaDefinitiva(
					prodCombinado.avatar,
					"9-Provisorio",
					"3-ProdRevisar"
				);
				// Eliminar el anterior archivo de imagen
				if (prodEditado.avatar)
					especificas.borrarArchivo("./public/imagenes/3-ProdRevisar", prodEditado.avatar);
			}
			// Unir las 2 ediciones en una sola
			// Se necesita para preservar la hora en la que se creó la edición
			let edicion = {...prodEditado, ...req.body, avatar};
			// Quitar de 'edicion' los campos innecesarios
			delete edicion.id;
			edicion = BD_especificas.quitarLosCamposSinContenido(edicion);
			edicion = BD_especificas.quitarDeEdicionLasCoincidenciasConOriginal(prodOriginal, edicion);
			// Completar los datos de edicion
			let producto_id = especificas.entidad_id(entidad);
			edicion = {
				...edicion,
				["elc_" + producto_id]: prodID,
				editado_por_id: userID,
				entidad: "productos_edic",
			};
			// Eliminar prodEditado (si existía) de la BD
			if (prodEditado) await BD_genericas.eliminarRegistro("productos_edic", prodEditado.id);
			// Agregar 'edición' a la BD
			await BD_genericas.agregarRegistro(edicion.entidad, edicion);
			// Eliminar req.session.edicion
			req.session.edicion = {};
		}
		return res.redirect("/producto/edicion/?entidad=" + entidad + "&id=" + prodID);
	},
	edicionEliminar: async (req, res) => {
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let ID = req.query.id;
		// Pendiente...
		// No se puede eliminar la edición de un status "gr_pend_aprob"
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
		// Obtener el producto
		let [, prodEditado] = await BD_especificas.obtenerVersionesDeProducto(prodEntidad, prodID, userID);
		// Obtener información de BD
		let linksCombinados = await obtenerLinksCombinados(prodEntidad, prodID, userID);
		let linksProveedores = await BD_genericas.obtenerTodos("links_proveedores", "orden");
		let linksTipos = await BD_genericas.obtenerTodos("links_tipos", "id");
		// Separar entre 'gr_activos' y 'gr_inactivos'
		let [linksActivos, linksInactivos] = await ActivosInactivos(linksCombinados);
		// Configurar el producto, el título y el avatar
		let productoNombre = especificas.entidadNombre(prodEntidad);
		let titulo = "Links de" + (prodEntidad == "capitulos" ? "l " : " la ") + productoNombre;
		let avatar = await obtenerAvatar(prodEntidad, prodID, userID, prodEditado);
		// Obtener datos para la vista
		if (prodEntidad == "capitulos")
			prodEditado.capitulos = await BD_especificas.obtenerCapitulos(
				prodEditado.coleccion_id,
				prodEditado.temporada
			);
		let dataEntry = req.session.links ? req.session.links : "";
		let motivos = await BD_genericas.obtenerTodos("altas_rech_motivos", "orden")
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
			producto: prodEditado,
			entidad: prodEntidad,
			prodID,
			userID,
			links_tipos: linksTipos,
			vista: req.baseUrl + req.path,
			dataEntry,
			avatar,
			calidades: [144, 240, 360, 480, 720, 1080],
			motivos,
			haceUnaHora: especificas.haceUnaHora(),
		});
	},
	linksAltasEditar: async (req, res) => {
		let datos = limpiarLosDatos(req.body);
		// Averiguar si hay errores de validación
		let errores = await validar.links(datos);
		if (errores.hay) req.session.links = datos;
		else {
			// Procesar los datos en la operación que corresponda
			datos.alta ? await altaDeLink(req, datos) : await edicionDeLink(req, datos);
			// Estandarizar fechaRef en originales y editados del mismo "prodEntidad" y "prodId"
			estandarizarFechaRef(datos.prodEntidad, datos.prodID);
			delete req.session.links;
		}
		// Redireccionar
		return res.redirect("/producto/links/?entidad=" + datos.prodEntidad + "&id=" + datos.prodID);
	},

	calificala: (req, res) => {
		return res.send("Estoy en calificala");
	},

	eliminar: (req, res) => {
		return res.send("Estoy en eliminar");
	},
};

// FUNCIONES --------------------------------------------------
let obtenerLinksCombinados = async (prodEntidad, prodID, userID) => {
	// Definir valores necesarios
	let producto_id = especificas.entidad_id(prodEntidad);
	let includes = ["link_tipo", "link_prov", "status_registro"];
	// Obtener los linksOriginales
	let linksOriginales = await BD_genericas.obtenerTodosPorCampoConInclude(
		"links_originales",
		producto_id,
		prodID,
		includes
	);
	// Combinarlos con la edición, si existe
	includes.splice(includes.indexOf("link_prov"), 1);
	let linksCombinados = linksOriginales;
	// Rutina de combinación
	for (let i = 0; i < linksOriginales.length; i++) {
		// Obtener la edición
		linkEditado = await BD_genericas.obtenerPor2CamposConInclude(
			"links_edicion",
			"elc_id",
			linksOriginales[i].id,
			"editado_por_id",
			userID,
			includes.slice(0, -1)
		);
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
	let linkEditado = await BD_genericas.obtenerPor2CamposConInclude(
		"links_edicion",
		"elc_id",
		elc_id,
		"editado_por_id",
		userID
	);
	// Hacer la combinación
	// Si existe 'linkEditado', se preserva su 'id'
	let linkCombinado = {...linkOriginal, ...linkEditado};
	// Fin
	return linkCombinado;
};
let ActivosInactivos = async (linksOriginales) => {
	if (!linksOriginales.length) return [[], []];
	// linksActivos
	let linksActivos = linksOriginales.filter((n) => !n.status_registro.gr_inactivos);
	// linksInactivos
	let linksInactivos = linksOriginales.filter((n) => n.status_registro.gr_inactivos);
	// A los Inactivos, agregarles el motivo
	for (let i = 0; i < linksInactivos.length; i++) {
		let registro_borrado = await BD_genericas.obtenerPor2CamposConInclude(
			"registros_borrados",
			"elc_id",
			linksInactivos[i].id,
			"elc_entidad",
			"links_originales",
			"motivo"
		);
		linksInactivos[i].motivo = registro_borrado.motivo.nombre;
	}
	// Fin
	return [linksActivos, linksInactivos];
};
let obtenerAvatar = async (prodEntidad, prodID, userID, Producto) => {
	let producto_id = especificas.entidad_id(prodEntidad);
	let registroEditado = await BD_genericas.obtenerPor2Campos(
		"productos_edic",
		["elc_" + producto_id],
		prodID,
		"editado_por_id",
		userID
	);
	let imagenOr = Producto.avatar;
	let imagenEd = registroEditado.avatar;
	return imagenEd
		? (imagenEd.slice(0, 4) != "http" ? "/imagenes/3-ProdRevisar/" : "") + imagenEd
		: imagenOr
		? (imagenOr.slice(0, 4) != "http" ? "/imagenes/2-Productos/" : "") + imagenOr
		: "/imagenes/8-Agregar/IM.jpg";
};
let altaDeLink = async (req, datos) => {
	if (!datos.parte) datos.parte = "-";
	// Generar información para el nuevo registro
	let userID = req.session.usuario.id;
	let producto_id = especificas.entidad_id(datos.prodEntidad);
	datos = {
		...datos,
		[producto_id]: datos.prodID,
		creado_por_id: userID,
	};
	// Agregar el 'link' a la BD
	await BD_genericas.agregarRegistro("links_originales", datos);
	// Eliminar req.session.edicion
	delete req.session.links;
	// Adecuar el producto respecto al link
	productoConLinksWeb(datos.prodEntidad, datos.prodID);
};
let productoConLinksWeb = async (prodEntidad, prodID) => {
	// Obtener el producto con include a links
	let producto = await BD_genericas.obtenerPorIdConInclude(prodEntidad, prodID, [
		"links_gratuitos_cargados",
		"links_gratuitos_en_la_web",
		"links",
		"status_registro",
	]);

	// Obtener los links gratuitos de películas del producto
	let links = await BD_genericas.obtenerTodosPorCampoConInclude(
		"links_originales",
		especificas.entidad_id(prodEntidad),
		prodID,
		["status_registro", "link_tipo"]
	)
		.then((n) => n.filter((n) => n.gratuito))
		.then((n) => n.filter((n) => n.link_tipo.pelicula));

	// Obtener los links 'Aprobados' y 'TalVez'
	let linksTalVez = links.length ? links.filter((n) => n.status_registro.gr_pend_aprob) : [];
	let linksActivos = links.length ? links.filter((n) => n.status_registro.aprobado) : [];
	if (!linksActivos.length && !linksTalVez.length) return;

	// Obtener los ID de si, no y TalVez
	si_no_parcial = await BD_genericas.obtenerTodos("si_no_parcial", "id");
	let si = si_no_parcial.find((n) => n.si).id;
	let talVez = si_no_parcial.find((n) => !n.si && !n.no).id;
	let no = si_no_parcial.find((n) => n.no).id;

	// Acciones si existen 'linksActivos'
	if (linksActivos.length) {
		let datos = {links_gratuitos_cargados_id: si, links_gratuitos_en_la_web_id: si};
		BD_genericas.actualizarPorId(prodEntidad, prodID, datos);
		return;
	} else if (producto.links_gratuitos_en_la_web_id == si) {
		let datos = {links_gratuitos_en_la_web_id: talVez};
		BD_genericas.actualizarPorId(prodEntidad, prodID, datos);
	}

	// Acciones si existen 'linksTalVez'
	if (linksTalVez.length) {
		let datos = {links_gratuitos_cargados_id: talVez};
		BD_genericas.actualizarPorId(prodEntidad, prodID, datos);
		return;
	}

	// Acciones si no se cumplen los anteriores
	let datos = {links_gratuitos_cargados_id: no};
	BD_genericas.actualizarPorId(prodEntidad, prodID, datos);
	return;
};
let edicionDeLink = async (req, datos) => {
	// Adecuar la información del formulario
	if (!datos.parte) datos.parte = "-";
	// Averiguar si el link está en 'creado' y por este usuario
	let linkOriginal = await BD_genericas.obtenerPorIdConInclude(
		"links_originales",
		datos.id,
		"status_registro"
	);
	let userID = req.session.usuario.id;
	if (linkOriginal.status_registro.creado && linkOriginal.creado_por_id == userID) {
		// Editados reemplaza el original
		// 1. Obtener el link 'Original Nuevo'
		linkOriginalNuevo = {...linkOriginal, ...datos};
		//return linkOriginalNuevo
		// 2. Actualizarlo en la BD
		await BD_genericas.actualizarPorId("links_originales", datos.id, linkOriginalNuevo);
	} else {
		// Editados se guarda en versión edición
		// 1. Obtener el link 'Edición Nueva'
		// 1.1. Obtener el link 'combinado'
		let linkCombinado = await obtenerLinkCombinado(linkOriginal.id, userID);
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
			await BD_genericas.eliminarRegistro("links_edicion", (id = linkCombinado.id));
		else {
			// 3. De lo contrario, se completa la info
			linkEdicionNueva = {
				...linkEdicionNueva,
				elc_id: linkOriginal.id,
				editado_por_id: userID,
			};
		}
		// 3. Agregar 'edición' a la BD
		await BD_genericas.agregarRegistro("links_edicion", linkEdicionNueva);
	}
};
let limpiarLosDatos = (datos) => {
	// Adecuaciones iniciales al objeto 'datos'
	datos.alta = datos.numeroFila == datos.calidad.length - 1 || typeof datos.calidad == "string";
	if (datos.alta) delete datos.id;
	delete datos.motivo_id;
	// Obtener los datos de la fila que necesitamos
	for (let campo in datos) {
		if (typeof datos[campo] == "object") datos[campo] = datos[campo][datos.numeroFila];
	}
	// Quitar campos innecesarios
	datos = BD_especificas.quitarLosCamposSinContenido(datos);
	// Fin
	return datos;
};
let estandarizarFechaRef = async (prodEntidad, prodID) => {
	// Actualizar todos los originales
	let producto_id = especificas.entidad_id(prodEntidad);
	let fecha_referencia = new Date();
	// Actualizar linksOriginales
	BD_genericas.actualizarPorCampo("links_originales", producto_id, prodID, {fecha_referencia});
	// Actualizar linksEdicion
	BD_genericas.obtenerTodosPorCampo("links_originales", producto_id, prodID).then((n) =>
		n.map((m) =>
			BD_genericas.actualizarPorCampo("links_edicion", "elc_id", (elc_id = m.id), {
				fecha_referencia,
			})
		)
	);
};
