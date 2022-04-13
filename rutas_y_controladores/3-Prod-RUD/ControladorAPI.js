"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/BD/Genericas");
const BD_especificas = require("../../funciones/BD/Especificas");
const especificas = require("../../funciones/Varias/Especificas");
const validar = require("../../funciones/Prod-RUD/2-Validar");

// *********** Controlador ***********
module.exports = {
	// Tridente: Detalle - Edición del Producto - Links
	obtenerColCap: async (req, res) => {
		let {entidad, id} = req.query;
		let ID =
			entidad == "colecciones"
				? await BD_genericas.obtenerPorCampos("capitulos", {
						coleccion_id: id,
						temporada: 1,
						capitulo: 1,
				  }).then((n) => n.id)
				: await BD_genericas.obtenerPorId("capitulos", id).then((n) => n.coleccion_id);
		return res.json(ID);
	},
	obtenerCapAntPostID: async (req, res) => {
		let {id} = req.query;
		// Obtener la coleccion_id, la temporada y el capítulo
		let {coleccion_id, temporada, capitulo} = await BD_genericas.obtenerPorId("capitulos", id);
		// Averiguar los datos del capítulo anterior **********************
		// Obtener los datos del capítulo anterior (temporada y capítulo)
		let tempAnt = temporada;
		let capAnt = 0;
		if (temporada == 1 && capitulo == 1) capAnt = false;
		else if (capitulo > 1) capAnt = capitulo - 1;
		else {
			tempAnt = temporada - 1;
			// Obtener el último número de capítulo de la temporada anterior
			capAnt = await BD_genericas.obtenerTodosPorCampos("capitulos", {
				coleccion_id: coleccion_id,
				temporada: tempAnt,
			})
				.then((n) => n.map((m) => m.capitulo))
				.then((n) => Math.max(...n));
		}
		// Averiguar los datos del capítulo posterior ********************
		// Obtener datos de la colección y el capítulo
		let [ultCap, ultTemp] = await Promise.all([
			// Obtener el último número de capítulo de la temporada actual
			BD_genericas.obtenerTodosPorCampos("capitulos", {
				coleccion_id: coleccion_id,
				temporada: temporada,
			})
				.then((n) => n.map((m) => m.capitulo))
				.then((n) => Math.max(...n)),
			// Obtener el último número de temporada de la colección
			BD_genericas.obtenerPorId("colecciones", coleccion_id).then((n) => n.cant_temporadas),
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
				? BD_genericas.obtenerPorCampos("capitulos", {
						coleccion_id: coleccion_id,
						temporada: tempAnt,
						capitulo: capAnt,
				  }).then((n) => n.id)
				: false,
			capPost
				? BD_genericas.obtenerPorCampos("capitulos", {
						coleccion_id: coleccion_id,
						temporada: tempPost,
						capitulo: capPost,
				  }).then((n) => n.id)
				: false,
		]).then(([a, b]) => {
			return [a, b];
		});
		// // Enviar el resultado
		return res.json([capAntID, capPostID]);
	},
	obtenerCapID: async (req, res) => {
		let {coleccion_id, temporada, capitulo} = req.query;
		let ID = await BD_genericas.obtenerPorCampos("capitulos", {
			coleccion_id: coleccion_id,
			temporada: temporada,
			capitulo: capitulo,
		}).then((n) => n.id);
		return res.json(ID);
	},

	// Detalle
	obtenerCalificaciones: async (req, res) => {
		let {entidad, id, detalle} = req.query;
		let datos;
		let calificaciones = [];
		// Datos generales
		datos = await BD_genericas.obtenerPorId(entidad, id).then((n) =>
			n.fe_valores != null
				? [n.fe_valores / 100, n.entretiene / 100, n.calidad_tecnica / 100, n.calificacion / 100]
				: ""
		);
		if (datos) {
			let calificacionGral = {encabezado: "Gral.", valores: datos};
			calificaciones.push(calificacionGral);
		}
		// Datos particulares
		if (detalle) {
			let producto_id = especificas.entidad_id(entidad);
			datos = await BD_genericas.obtenerPorCampos("cal_registros", {
				usuario_id: req.session.usuario.id,
				[producto_id]: id,
			}).then((n) =>
				n
					? [n.fe_valores / 100, n.entretiene / 100, n.calidad_tecnica / 100, n.calificacion / 100]
					: ""
			);
			if (datos) {
				let calificacionUsuario = {encabezado: "Tuya", valores: datos};
				calificaciones.push(calificacionUsuario);
			}
		}
		return res.json(calificaciones);
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
		let userID = req.session.usuario.id;
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
		let provs = await BD_genericas.obtenerTodos("links_proveedores", "orden");
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
		let haceUnaHora = especificas.haceUnaHora();
		let usuario = req.session.usuario;
		// Descartar que no hayan errores con el 'link_id'
		if (!link_id) respuesta.mensaje = "Faltan datos";
		else {
			// El link_id existe
			let link = await BD_genericas.obtenerPorIdConInclude("links_originales", link_id, [
				"status_registro",
			]);
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
			} else if (link.status_registro.gr_pend_aprob) {
				// Sin "captura válida" y con status 'gr_pend_aprob'
				if (link.creado_por_id == usuario.id) {
					// Creados por el usuario --> se eliminan definitivamente
					BD_genericas.eliminarRegistro("links_originales", link_id);
					respuesta.mensaje = "El link fue eliminado con éxito";
					respuesta.resultado = true;
				} else {
					// Creados por otro usuario --> no se pueden inactivar
					respuesta.mensaje = "El link debe ser revisado, aún no se puede inactivar";
					respuesta.resultado = false;
				}
			} else if (link.status_registro.gr_aprobados) {
				// Sin "captura válida" y con status 'aprobado'
				if (motivo_id) {
					// Si explica el motivo, se inactiva
					funcionInactivar(motivo_id, usuario, link);
					respuesta.mensaje = "El link fue inactivado con éxito";
					respuesta.resultado = true;
				} else {
					// Si no figura el motivo --> Abortar con mensaje de error
					respuesta.mensaje = "Falta especificar el motivo";
					respuesta.resultado = false;
				}
			} else {
				// Sin "captura válida" y con status 'gr_inactivos'
				respuesta.mensaje = "El link está en status inactivo";
				respuesta.resultado = false;
			}
		}
		return res.json(respuesta);
	},
};

let funcionInactivar = async (motivo_id, usuario, link) => {
	// Obtener la duración
	let duracion = await BD_genericas.obtenerPorId("altas_rech_motivos", motivo_id).then((n) => n.duracion);
	// Obtener el status_id de 'inactivar'
	let statusInactivar_id = await BD_genericas.obtenerPorCampos("status_registro", {inactivar: 1}).then(
		(n) => n.id
	);
	// Preparar los datos
	let datosParaLink = {
		editado_por_id: usuario.id,
		editado_en: new Date(),
		status_registro_id: statusInactivar_id,
	};
	// Actualiza el registro 'original' en la BD
	BD_genericas.actualizarPorId("links_originales", link.id, datosParaLink);
	// 3. Crea un registro en la BD de 'altas_rech'
	let datosParaBorrados = {
		entidad: "links_originales",
		entidad_id: link.id,
		motivo_id: motivo_id,
		duracion: 0, // porque todavía lo tiene que evaluar un revisor

		input_por_id: link.creado_por_id,
		input_en: link.creado_en,
		evaluado_por_id: datosParaLink.editado_por_id,
		evaluado_en: datosParaLink.editado_en,
		status_registro_id: datosParaLink.status_registro_id,
	};
	BD_genericas.agregarRegistro("altas_rech", datosParaBorrados);
};

// let obtenerLinksFusionados = async (link_id, usuario) => {
// 	let link_original = await BD_genericas.obtenerPorIdConInclude("links_originales", link_id, [
// 		"status_registro",
// 	]);
// 	link_edicion = await BD_genericas.obtenerPorCamposConInclude(
// 		"links_edicion",
// 		"elc_id",
// 		link_id,
// 		"editado_por_id",
// 		usuario.id,
// 	);
// 	if (link_edicion) {
// 		delete link_edicion.id;
// 		link_original = {...link_original, ...link_edicion};
// 	}
// 	// Quitarle los campos 'null'
// 	link_original = especificas.quitarLosCamposSinContenido(link_original);
// 	return link_original;
// };
