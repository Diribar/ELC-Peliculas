// ************ Requires *************
let validar = require("../../funciones/Prod-RUD/2-Validar");
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");

// *********** Controlador ***********
module.exports = {
	// Tridente
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
		let {coleccion_id, temporada, capitulo} = await BD_varias.obtenerPorId(
			"capitulos",
			id
		).then((n) => n.toJSON());
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

	// Edición
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
			req.session.edicion &&
			req.session.edicion.entidad == entidad &&
			req.session.edicion.id == prodID
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
		// Definir las variables
		let mensaje = "";
		let resultado = false;
		let link_id = req.query.id;
		// Descartar que no hayan errores con el 'link_id'
		if (!link_id) mensaje = "Faltan datos";
		else {
			let link = await BD_varias.obtenerPorId("links_productos", link_id);
			if (!link) {
				mensaje = "El link ya había sido quitado de la base de datos";
			} else if (link && link.creado_por_id == req.session.usuario.id) {
				// Si el usuario es el autor del link --> eliminarlo
				BD_varias.eliminarRegistro("links_productos", link_id);
				mensaje = "El link fue eliminado con éxito";
				resultado = true;
			} else if (link && link.creado_por_id != req.session.usuario.id) {
				// Si el usuario no es el autor del link --> sugerir_borrarlo
				// Verificar que figure el motivo
				req.query = {...req.query, motivo_id: 20};
				// En caso que no, abortar con mensaje de error
				if (!req.query.motivo_id) {
					mensaje = "Falta especificar el motivo";
					resultado = false;
				} else {
					// En caso que sí, continuar
					// 1. Obtener el status de borrado
					let status = await BD_varias.obtenerPorCampo(
						"status_registro_ent",
						"sugerido_borrar",
						1
					).then((n) => n.toJSON());
					// 2. Generar los datos
					let datos={}
					// 3. Actualizar el link original
					datos = {
						status_registro_id: status.id,
						editado_por_id: req.session.usuario.id,
						editado_en: new Date(),
					};
					BD_varias.actualizarRegistro("links_productos", link_id, datos);
					// 4. Actualizar la BD con el motivo
					datos = {
						entidad: "registros_borrados",
						ELC_id: link_id,
						ELC_entidad: "links_productos",
						motivo_id: req.query.motivo_id,
					};
					BD_varias.agregarRegistro(datos);
					// 5. Fin
					mensaje = "El link fue inactivado con éxito";
					resultado = true;
				}
			}
		}
		return res.json({mensaje, resultado});
	},
};
