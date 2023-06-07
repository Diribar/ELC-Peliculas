"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
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
	guarda: async (req, res) => {
		// Variables
		let datos = req.query;
		let userID = req.session.usuario.id;
		// Completa y procesa la info
		datos = procesos.datosLink(datos);
		let mensaje;

		// Obtiene el link y el id de la edicion
		let link = await BD_genericas.obtienePorCondicionConInclude("links", {url: datos.url}, "statusRegistro");
		let edicID = link ? await BD_especificas.obtieneELC_id("links_edicion", {link_id: link.id, editadoPor_id: userID}) : "";

		// Si el link no existía, lo crea
		if (!link) {
			datos.creadoPor_id = userID;
			datos.sugeridoPor_id = userID;
			link = await BD_genericas.agregaRegistro("links", datos);
			procsCRUD.cambioDeStatus("links", link);
			mensaje = "Link creado";
		}
		// Si es un link propio y en status creado, lo actualiza
		else if (link.creadoPor_id == userID && link.statusRegistro.creado) {
			await BD_genericas.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			procsCRUD.cambioDeStatus("links", link);
			mensaje = "Link actualizado";
		}
		// Guarda la edición
		else {
			if (edicID) datos.id = edicID;
			mensaje = await procsCRUD.guardaActEdicCRUD({entidad: "links", original: link, edicion: datos, userID});
		}

		// Fin
		return res.json(mensaje);
	},
	elimina: async (req, res) => {
		// Proceso
		// - Los links en status 'creado' y del usuario => se eliminan definitivamente
		// - Los demás --> se inactivan
		// Variables
		const {url, motivo_id} = req.query;
		const userID = req.session.usuario.id;
		const revisor = req.session.usuario.rolUsuario.revisorEnts;
		let link = url ? await BD_genericas.obtienePorCondicionConInclude("links", {url}, "statusRegistro") : "";
		let respuesta = {};

		// Si el 'url' no existe, interrumpe la función
		if (!url) respuesta = {mensaje: "Falta el 'url' del link", reload: true};
		// El link no existe en la BD
		else if (!link) respuesta = {mensaje: "El link no existe en la base de datos", reload: true};
		// El link se elimina definitivamente
		else if (
			// El link está en status 'creado" y por el usuario
			(link.statusRegistro.creado && link.creadoPor_id == userID) ||
			// El link está en status 'inactivo" y es un revisor
			(link.statusRegistro.inactivo && revisor)
		) {
			await BD_genericas.eliminaPorId("links", link.id);
			link.statusRegistro_id = inactivo_id;
			procsCRUD.cambioDeStatus("links", link);
			respuesta = {mensaje: "El link fue eliminado con éxito", ocultar: true};
		}
		// El link existe y no tiene status 'aprobado'
		else if (!link.statusRegistro.aprobado) respuesta = {mensaje: "En este status no se puede inactivar", reload: true};
		// No existe el motivo
		else if (!motivo_id) respuesta = {mensaje: "Falta el motivo por el que se inactiva", reload: true};
		// El link existe, tiene status 'aprobado' y motivo
		else {
			// Inactivar
			let datos = {
				sugeridoPor_id: userID,
				sugeridoEn: comp.fechaHora.ahora(),
				motivo_id,
				statusRegistro_id: inactivar_id,
			};
			await BD_genericas.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			procsCRUD.cambioDeStatus("links", link);
			respuesta = {mensaje: "El link fue inactivado con éxito", ocultar: true, pasivos: true};
		}

		// Fin
		return res.json(respuesta);
	},
	recupera: async (req, res) => {
		// Variables
		let datos = req.query;
		let userID = req.session.usuario.id;
		let respuesta = {};
		// Completar la info
		// Obtiene el link
		let link = await BD_genericas.obtienePorCondicionConInclude("links", {url: datos.url}, "statusRegistro");
		// Obtiene el mensaje de la tarea realizada
		respuesta = !link // El link original no existe
			? {mensaje: "El link no existe", reload: true}
			: link.statusRegistro.recuperar // El link ya estaba en status recuperar
			? {mensaje: "El link ya estaba en status 'recuperar'", reload: true}
			: respuesta;
		if (!respuesta.mensaje) {
			datos = {statusRegistro_id: recuperar_id, sugeridoPor_id: userID};
			await BD_genericas.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			procsCRUD.cambioDeStatus("links", link);
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
			: link.statusRegistro.creado
			? {mensaje: "El link está en status creado", reload: true}
			: link.statusRegistro.aprobado
			? {mensaje: "El link está en status aprobado", reload: true}
			: link.statusRegistro.inactivo
			? {mensaje: "El link está en status inactivo", reload: true}
			: link.sugeridoPor_id != userID
			? {mensaje: "El último cambio de status fue sugerido por otra persona", reload: true}
			: respuesta;
		if (!respuesta.mensaje) {
			// Actualiza el status del link
			let datos = link.statusRegistro.inactivar
				? {statusRegistro_id: aprobado_id, motivo_id: null}
				: {statusRegistro_id: inactivo_id};
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
