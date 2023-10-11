"use strict";
// Variables
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./LK-FN-Procesos");
const valida = require("./LK-FN-Validar");

// *********** Controlador ***********
module.exports = {
	// Links
	valida: async (req, res) => {
		// Averigua los errores solamente para esos campos
		let errores = await valida.links(req.query);
		// Devuelve el resultado
		return res.json(errores);
	},
	obtieneProvs: (req, res) => {
		return res.json(linksProvs);
	},
	// ABM
	guarda: async (req, res) => {
		// Variables
		const userID = req.session.usuario.id;
		const datos = await procesos.datosLink(req.query);
		let mensaje;

		// Obtiene el link y el id de la edicion
		let link = await BD_genericas.obtienePorCondicionConInclude("links", {url: datos.url}, "statusRegistro");
		const edicID = link ? await BD_especificas.obtieneELC_id("linksEdicion", {link_id: link.id, editadoPor_id: userID}) : "";

		// Si el link no existía, lo crea
		if (!link) {
			datos.creadoPor_id = userID;
			datos.statusSugeridoPor_id = userID;
			link = await BD_genericas.agregaRegistro("links", datos);
			procsCRUD.revisiones.accionesPorCambioDeStatus("links", link);
			mensaje = "Link creado";
		}
		// Si es un link propio y en status creado, lo actualiza
		else if (link.creadoPor_id == userID && link.statusRegistro_id == creado_id) {
			await BD_genericas.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			procsCRUD.revisiones.accionesPorCambioDeStatus("links", link);
			mensaje = "Link actualizado";
		}
		// Guarda la edición
		else {
			if (edicID) datos.id = edicID;
			mensaje = await procsCRUD.guardaActEdicCRUD({entidad: "links", original: link, edicion: datos, userID});
			if (mensaje) mensaje = "Edición guardada";
		}

		// Fin
		return res.json(mensaje);
	},
	inactivaElimina: async (req, res) => {
		// Variables
		const {url, motivo_id} = req.query;
		const userID = req.session.usuario.id;
		const revisorLinks = req.session.usuario.rolUsuario.revisorLinks;
		const ahora = comp.fechaHora.ahora();
		let link = url ? await BD_genericas.obtienePorCondicionConInclude("links", {url}, "statusRegistro") : "";
		let respuesta = {};

		// Si el campo 'url' no tiene valor, interrumpe la función
		if (!url) respuesta = {mensaje: "Falta el 'url' del link", reload: true};
		// El link no existe en la BD
		else if (!link) respuesta = {mensaje: "El link no existe en la base de datos", reload: true};
		// El link se elimina definitivamente
		else if (
			(link.statusRegistro_id == creado_id && link.creadoPor_id == userID) || // El link está en status 'creado' y por el usuario
			(link.statusRegistro_id == inactivo_id && revisorLinks) // El link está en status 'inactivo' y es un revisorLinks
		) {
			await BD_genericas.eliminaPorId("links", link.id); // Elimina el registro original
			BD_genericas.eliminaTodosPorCondicion("histStatus", {entidad: "links", entidad_id: link.id}); // elimina el historial de cambios de status
			BD_genericas.eliminaTodosPorCondicion("histEdics", {entidad: "links", entidad_id: link.id}); // elimina el historial de cambios de edición
			link.statusRegistro_id = inactivo_id;
			procsCRUD.revisiones.accionesPorCambioDeStatus("links", link);
			respuesta = {mensaje: "El link fue eliminado con éxito", ocultar: true};
		}
		// El link existe y no tiene status 'aprobado'
		else if (!aprobados_ids.includes(link.statusRegistro_id))
			respuesta = {mensaje: "En este status no se puede inactivar", reload: true};
		// No existe el motivo
		else if (!motivo_id) respuesta = {mensaje: "Falta el motivo por el que se inactiva", reload: true};
		// El link existe, tiene status 'aprobado' y motivo
		else {
			// Inactivar
			let datos = {
				statusSugeridoPor_id: userID,
				statusSugeridoEn: ahora,
				motivo_id,
				statusRegistro_id: inactivar_id,
			};
			await BD_genericas.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			procsCRUD.revisiones.accionesPorCambioDeStatus("links", link);
			respuesta = {mensaje: "El link fue inactivado con éxito", ocultar: true, pasivos: true};
		}

		// Fin
		return res.json(respuesta);
	},
	recupera: async (req, res) => {
		// Variables
		let datos = req.query;
		const userID = req.session.usuario.id;
		const ahora = comp.fechaHora.ahora();
		let respuesta = {};

		// Obtiene el link
		let link = await BD_genericas.obtienePorCondicionConInclude("links", {url: datos.url}, "statusRegistro");

		// Obtiene el mensaje de la tarea realizada
		respuesta = !link // El link original no existe
			? {mensaje: "El link no existe", reload: true}
			: link.statusRegistro_id != inactivo_id // El link no está en status 'inactivo'
			? {mensaje: "El link no está en status 'inactivo'", reload: true}
			: respuesta;
		if (!respuesta.mensaje) {
			datos = {statusSugeridoEn: ahora, statusSugeridoPor_id: userID, statusRegistro_id: recuperar_id};
			await BD_genericas.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			procsCRUD.revisiones.accionesPorCambioDeStatus("links", link);
			respuesta = {mensaje: "Link recuperado", activos: true, ocultar: true};
		}
		// Fin
		return res.json(respuesta);
	},
	deshace: async (req, res) => {
		// Variables
		let datos = req.query;
		let userID = req.session.usuario.id;
		let respuesta = {};

		// Obtiene el link
		let link = await BD_genericas.obtienePorCondicionConInclude("links", {url: datos.url}, "statusRegistro");

		// Obtiene el mensaje de la tarea realizada
		respuesta = !link // El link original no existe
			? {mensaje: "El link no existe", reload: true}
			: link.statusRegistro_id == creado_id
			? {mensaje: "El link está en status creado", reload: true}
			: link.statusRegistro_id == aprobado_id
			? {mensaje: "El link está en status aprobado", reload: true}
			: link.statusRegistro_id == inactivo_id
			? {mensaje: "El link está en status inactivo", reload: true}
			: link.statusSugeridoPor_id != userID
			? {mensaje: "El último cambio de status fue sugerido por otra persona", reload: true}
			: respuesta;
		if (!respuesta.mensaje) {
			// Actualiza el status del link
			let datos =
				link.statusRegistro_id == inactivar_id
					? {statusRegistro_id: aprobado_id, motivo_id: null}
					: {statusRegistro_id: inactivo_id};
			await BD_genericas.actualizaPorId("links", link.id, datos);

			// Actualiza los campos del producto asociado
			link = {...link, ...datos};
			procsCRUD.revisiones.accionesPorCambioDeStatus("links", link);

			// Fin
			respuesta = {mensaje: "Link llevado a su status anterior", activos: true, pasivos: true, ocultar: true};
		}
		// Fin
		return res.json(respuesta);
	},
};
