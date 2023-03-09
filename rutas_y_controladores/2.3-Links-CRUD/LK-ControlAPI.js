"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
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
		return res.json(links_provs);
	},
	guardar: async (req, res) => {
		// Variables
		let datos = req.query;
		let userID = req.session.usuario.id;
		// Completa y procesa la info
		datos = procesos.datosLink(datos);
		let mensaje;

		// Obtiene el link y el id de la edicion
		let link = await BD_genericas.obtienePorCamposConInclude("links", {url: datos.url}, "status_registro");
		let edicion_id = link
			? await BD_especificas.obtieneELC_id("links_edicion", {link_id: link.id, editado_por_id: userID})
			: "";

		// Si el link no existía, lo crea
		if (!link) {
			datos.creado_por_id = userID;
			datos.sugerido_por_id = userID;
			link = await BD_genericas.agregaRegistro("links", datos);
			procsCRUD.cambioDeStatus("links", link);
			mensaje = "Link creado";
		}
		// Si es un link propio y en status creado, lo actualiza
		else if (link.creado_por_id == userID && link.status_registro.creado) {
			await BD_genericas.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			procsCRUD.cambioDeStatus("links", link);
			mensaje = "Link actualizado";
		}
		// Guarda la edición
		else {
			if (edicion_id) datos.id = edicion_id;
			mensaje = await procsCRUD.guardaActEdicCRUD({entidad: "links", original: link, edicion: datos, userID});
		}

		// Fin
		return res.json(mensaje);
	},
	eliminar: async (req, res) => {
		// Proceso
		// - Los links en status 'creado' y del usuario => se eliminan definitivamente
		// - Los demás --> se inactivan
		// Variables
		let {url, motivo_id} = req.query;
		let userID = req.session.usuario.id;
		let respuesta = {};
		let link;
		// Averigua si no existe el 'url'
		if (!url) respuesta = {mensaje: "Falta el 'url' del link", reload: true};
		else {
			// Obtiene el link
			link = await BD_genericas.obtienePorCamposConInclude("links", {url: url}, ["status_registro"]);
			// El link no existe en la BD
			if (!link) respuesta = {mensaje: "El link no existe en la base de datos", reload: true};
			// El link está en status 'creado" y por el usuario --> se elimina definitivamente
			else if (link.status_registro.creado && link.creado_por_id == userID) {
				await BD_genericas.eliminaPorId("links", link.id);
				link = {...link, status_registro_id: inactivo_id};
				procsCRUD.cambioDeStatus("links", link);
				respuesta = {mensaje: "El link fue eliminado con éxito", ocultar: true};
			}
			// El link existe y no tiene status 'aprobado'
			else if (!link.status_registro.aprobado) respuesta = {mensaje: "En este status no se puede inactivar", reload: true};
			// No existe el motivo
			else if (!motivo_id) respuesta = {mensaje: "Falta el motivo por el que se inactiva", reload: true};
			// El link existe y tiene status 'aprobado'
			else {
				// Inactivar
				let datos = {
					sugerido_por_id: userID,
					sugerido_en: comp.ahora(),
					motivo_id,
					status_registro_id: inactivar_id,
				};
				await BD_genericas.actualizaPorId("links", link.id, datos);
				link = {...link, ...datos};
				procsCRUD.cambioDeStatus("links", link);
				respuesta = {mensaje: "El link fue inactivado con éxito", ocultar: true, pasivos: true};
			}
			return res.json(respuesta);
		}
	},
	recuperar: async (req, res) => {
		// Variables
		let datos = req.query;
		let userID = req.session.usuario.id;
		let respuesta = {};
		// Completar la info
		// Obtiene el link
		let link = await BD_genericas.obtienePorCamposConInclude("links", {url: datos.url}, "status_registro");
		// Obtiene el mensaje de la tarea realizada
		respuesta = !link // El link original no existe
			? {mensaje: "El link no existe", reload: true}
			: link.status_registro.recuperar // El link ya estaba en status recuperar
			? {mensaje: "El link ya estaba en status 'recuperar'", reload: true}
			: respuesta;
		if (!respuesta.mensaje) {
			datos = {status_registro_id: recuperar_id, sugerido_por_id: userID};
			await BD_genericas.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			procsCRUD.cambioDeStatus("links", link);
			respuesta = {mensaje: "Link recuperado", activos: true, ocultar: true};
		}
		// Fin
		return res.json(respuesta);
	},
	deshacer: async (req, res) => {
		// Variables
		let datos = req.query;
		let userID = req.session.usuario.id;
		let respuesta = {};
		// Obtiene el link
		let link = await BD_genericas.obtienePorCamposConInclude("links", {url: datos.url}, "status_registro");
		// Obtiene el mensaje de la tarea realizada
		respuesta = !link // El link original no existe
			? {mensaje: "El link no existe", reload: true}
			: link.status_registro.creado
			? {mensaje: "El link está en status creado", reload: true}
			: link.status_registro.aprobado
			? {mensaje: "El link está en status aprobado", reload: true}
			: link.status_registro.inactivo
			? {mensaje: "El link está en status inactivo", reload: true}
			: link.sugerido_por_id != userID
			? {mensaje: "El último cambio de status fue sugerido por otra persona", reload: true}
			: respuesta;
		if (!respuesta.mensaje) {
			// Actualiza el status del link
			let datos = link.status_registro.inactivar
				? {status_registro_id: aprobado_id, motivo_id: null}
				: {status_registro_id: inactivo_id};
			await BD_genericas.actualizaPorId("links", link.id, datos);
			// Actualiza los campos del producto asociado
			link = {...link, ...datos};
			procsCRUD.cambioDeStatus("links", link);
			// Fin
			respuesta = {mensaje: "Link llevado a su status anterior", activos: true, pasivos: true, ocultar: true};
		}
		// Fin
		return res.json(respuesta);
	},
};
