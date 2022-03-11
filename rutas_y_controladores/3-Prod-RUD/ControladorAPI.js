// ************ Requires *************
let validar = require("../../funciones/Prod-RUD/2-Validar");
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");
let varias = require("../../funciones/Varias/Varias");

// *********** Controlador ***********
module.exports = {
	// Tridente: Detalle - Edición del Producto - Links
	obtenerColCap: async (req, res) => {
		let {entidad, id} = req.query;
		let ID =
			entidad == "colecciones"
				? await BD_varias.obtenerPor3Campos(
						"capitulos",
						"coleccion_id",
						id,
						"temporada",
						1,
						"capitulo",
						1
				  )
						.then((n) => n.toJSON())
						.then((n) => n.id)
				: await BD_varias.obtenerPorId("capitulos", id)
						.then((n) => n.toJSON())
						.then((n) => n.coleccion_id);
		return res.json(ID);
	},
	obtenerCapAntPostID: async (req, res) => {
		let {id} = req.query;
		// Obtener la coleccion_id, la temporada y el capítulo
		let {coleccion_id, temporada, capitulo} = await BD_varias.obtenerPorId("capitulos", id).then((n) =>
			n.toJSON()
		);
		// Averiguar los datos del capítulo anterior **********************
		// Obtener los datos del capítulo anterior (temporada y capítulo)
		let tempAnt = temporada;
		let capAnt = 0;
		if (temporada == 1 && capitulo == 1) capAnt = false;
		else if (capitulo > 1) capAnt = capitulo - 1;
		else {
			tempAnt = temporada - 1;
			// Obtener el último número de capítulo de la temporada anterior
			capAnt = await BD_varias.obtenerTodosPor2Campos(
				"capitulos",
				"coleccion_id",
				coleccion_id,
				"temporada",
				tempAnt
			)
				.then((n) => n.map((n) => n.toJSON()))
				.then((n) => n.map((m) => m.capitulo))
				.then((n) => Math.max(...n));
		}
		// Averiguar los datos del capítulo posterior ********************
		// Obtener datos de la colección y el capítulo
		let [ultCap, ultTemp] = await Promise.all([
			// Obtener el último número de capítulo de la temporada actual
			BD_varias.obtenerTodosPor2Campos(
				"capitulos",
				"coleccion_id",
				coleccion_id,
				"temporada",
				temporada
			)
				.then((n) => n.map((m) => m.toJSON()))
				.then((n) => n.map((m) => m.capitulo))
				.then((n) => Math.max(...n)),
			// Obtener el último número de temporada de la colección
			BD_varias.obtenerPorId("colecciones", coleccion_id)
				.then((n) => n.toJSON())
				.then((n) => n.cant_temporadas),
		]).then(([a, b]) => {
			return [a, b];
		});
		// Obtener los datos del capítulo posterior (temporada y capítulo)
		let tempPost = temporada;
		let capPost = 0;
		if (temporada == ultTemp && capitulo == ultCap) capPost = false;
		else if (capitulo < ultCap) capPost = capitulo + 1;
		else {
			tempPost = temporada + 1;
			capPost = 1;
		}
		// Obtener los ID
		let [capAntID, capPostID] = await Promise.all([
			// Obtener el ID del capítulo anterior
			capAnt
				? BD_varias.obtenerPor3Campos(
						"capitulos",
						"coleccion_id",
						coleccion_id,
						"temporada",
						tempAnt,
						"capitulo",
						capAnt
				  )
						.then((n) => n.toJSON())
						.then((n) => n.id)
				: false,
			capPost
				? BD_varias.obtenerPor3Campos(
						"capitulos",
						"coleccion_id",
						coleccion_id,
						"temporada",
						tempPost,
						"capitulo",
						capPost
				  )
						.then((n) => n.toJSON())
						.then((n) => n.id)
				: false,
		]).then(([a, b]) => {
			return [a, b];
		});
		// // Enviar el resultado
		return res.json([capAntID, capPostID]);
	},
	obtenerCapID: async (req, res) => {
		let {coleccion_id, temporada, capitulo} = req.query;
		let ID = await BD_varias.obtenerPor3Campos(
			"capitulos",
			"coleccion_id",
			coleccion_id,
			"temporada",
			temporada,
			"capitulo",
			capitulo
		)
			.then((n) => n.toJSON())
			.then((n) => n.id);
		return res.json(ID);
	},

	// Edición del Producto
	validarEdicion: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		// Averigua los errores solamente para esos campos
		let errores = await validar.edicion(campos, req.query);
		// Devuelve el resultado
		return res.json(errores);
	},
	obtenerVersionesDelProducto: async (req, res) => {
		let {entidad, id: prodID} = req.query;
		userID = req.session.usuario.id;
		// Obtener los datos ORIGINALES y EDITADOS del producto
		let [prodOriginal, prodEditado] = await BD_especificas.obtenerVersionesDeProducto(
			entidad,
			prodID,
			userID
		);
		// Enviar los datos
		return res.json([prodOriginal, prodEditado]);
	},
	enviarAReqSession: async (req, res) => {
		if (req.query.avatar) delete req.query.avatar;
		req.session.edicion = req.query;
		return res.json();
	},
	obtenerDeReqSession: async (req, res) => {
		let {entidad, id: prodID} = req.query;
		let prodSession =
			req.session.edicion && req.session.edicion.entidad == entidad && req.session.edicion.id == prodID
				? req.session.edicion
				: "";
		return res.json(prodSession);
	},
	// Links
	linksValidar: async (req, res) => {
		// Averigua los errores solamente para esos campos
		let errores = await validar.links(req.query);
		// Devuelve el resultado
		return res.json(errores);
	},
	linksObtenerProvs: async (req, res) => {
		let provs = await BD_varias.obtenerTodos("links_proveedores", "orden").then((n) =>
			n.map((m) => m.toJSON())
		);
		return res.json(provs);
	},
	linksEliminar: async (req, res) => {
		// Proceso
		// - Con "captura válida", no se pueden tocar (borrar)
		//		- Sin "captura válida", links creados por el usuario y con status 'creado' --> se eliminan definitivamente
		// 			- Los links con status 'aprobado' --> se inactivan (motivo)
		//			- Sin "captura válida", links creados por otro autor --> se inactivan (motivo)

		// Definir las variables
		let respuesta = {};
		let {link_id, motivo_id} = req.query;
		let haceUnaHora = varias.funcionHaceUnaHora();
		let usuario = req.session.usuario;
		// Descartar que no hayan errores con el 'link_id'
		if (!link_id) respuesta.mensaje = "Faltan datos";
		else {
			let link = await BD_varias.obtenerPorIdConInclude("links_originales", link_id, [
				"status_registro",
			]).then((n) => n.toJSON());
			if (!link) {
				// Consecuencias si el link no existe en la BD
				respuesta.mensaje = "El link no existe en la base de datos";
				respuesta.resultado = false;
				respuesta.reload = true;
			} else if (link.capturado_en > haceUnaHora) {
				// Con "captura válida", no se pueden tocar (borrar)
				respuesta.mensaje = "El link está en revisión, no se puede eliminar";
				respuesta.resultado = false;
				respuesta.reload = true;
			} else if (link.creado_por_id == usuario.id && link.status_registro.creado) {
				// Sin "captura válida", links creados por el usuario y con status 'creado' --> se eliminan definitivamente
				BD_varias.eliminarRegistro("links_originales", link_id);
				respuesta.mensaje = "El link fue eliminado con éxito";
				respuesta.resultado = true;
			} else if (!motivo_id) {
				// Los demás casos son:
				//		- Links con status 'aprobado'
				//		- Links sin "captura válida" y creados por otro autor
				// 1. Si no figura el motivo --> Abortar con mensaje de error
				respuesta.mensaje = "Falta especificar el motivo";
				respuesta.resultado = false;
			} else {
				// Si explica el motivo, se inactiva
				funcionInactivar(motivo_id, usuario, link);
				respuesta.mensaje = "El link fue inactivado con éxito";
				respuesta.resultado = true;
			}
		}
		return res.json(respuesta);
	},
};

let funcionInactivar = async (motivo_id, usuario, link) => {
	// 1. Obtener datos clave
	let datosParaBD = {};
	// Obtener la duración
	let duracion = await BD_varias.obtenerPorId("motivos_para_borrar", motivo_id)
		.then((n) => n.toJSON())
		.then((n) => n.duracion);
	// Obtener el status_id de 'sugerido para borrar'
	let status_id = await BD_varias.obtenerPorCampo("status_registro_ent", "sugerido_borrar", 1)
		.then((n) => n.toJSON())
		.then((n) => n.id);
	// Averiguar si ya existe una edición del usuario
	let link_edicion = await BD_varias.obtenerPor2Campos(
		"links_edicion",
		"elc_id",
		link.id,
		"editado_por_id",
		usuario.id
	).then((n) => (n ? n.toJSON() : ""));
	// Preparar los datos
	datosParaBD = {
		entidad: "links_edicion",
		elc_id: link.id,
		editado_por_id: usuario.id,
		editado_en: new Date(),
		status_registro_id: status_id,
	};
	link_edicion
		? // Actualiza el registro 'edicion' en la BD
		  BD_varias.actualizarRegistro("links_edicion", link_edicion.id, datosParaBD)
		: // Crea un registro 'edicion' en la BD
		  BD_varias.agregarRegistro(datosParaBD);
	// 3. Actualiza la BD de 'registros_borrados'
	datosParaBD = {
		entidad: "registros_borrados",
		elc_id: link.id,
		elc_entidad: "links_originales",
		usuario_sancionado_id: link.creado_por_id,
		evaluado_por_usuario_id: usuario.id,
		motivo_id: motivo_id,
		duracion: duracion,
		status_registro_id: status_id,
	};
	BD_varias.agregarRegistro(datosParaBD);
};

let obtenerLinksFusionados = async (link_id, usuario) => {
	let link_original = await BD_varias.obtenerPorIdConInclude("links_originales", link_id, [
		"status_registro",
	]).then((n) => n.toJSON());
	link_edicion = await BD_varias.obtenerPor2CamposConInclude(
		"links_edicion",
		"elc_id",
		link_id,
		"editado_por_id",
		usuario.id,
		["status_registro"]
	).then((n) => (n ? n.toJSON() : ""));
	if (link_edicion) {
		delete link_edicion.id;
		link_original = {...link_original, ...link_edicion};
	}
	// Quitarle los campos 'null'
	link_original = BD_especificas.quitarLosCamposSinContenido(link_original);
	return link_original;
};
