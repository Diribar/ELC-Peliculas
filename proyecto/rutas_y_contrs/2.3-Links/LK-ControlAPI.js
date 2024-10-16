"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");
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
	obtieneEmbededLink: async (req, res) => {
		// Variables
		const {linkID, linkUrl} = req.query;

		// Obtiene el link y el proveedor
		const link = linkID
			? await baseDeDatos.obtienePorId("links", linkID)
			: await baseDeDatos.obtienePorCondicion("links", {url: linkUrl});
		const provEmbeded = provsEmbeded.find((n) => n.id == link.prov_id);

		// Acciones si es embeded
		const urlEmbedded = provEmbeded ? "//" + link.url.replace(provEmbeded.embededQuitar, provEmbeded.embededPoner) : "";

		// Fin
		return res.json(urlEmbedded);
	},

	// ABM
	guarda: async (req, res) => {
		// Variables
		const usuario_id = req.session.usuario.id;
		const datos = await procesos.datosLink(req.query);
		let mensaje;

		// Obtiene el link y el id de la edicion
		let link = await baseDeDatos.obtienePorCondicion("links", {url: datos.url}, "statusRegistro");
		const edicion = link
			? await baseDeDatos.obtienePorCondicion("linksEdicion", {link_id: link.id, editadoPor_id: usuario_id})
			: null;

		// Si el link no existía, lo crea
		if (!link) {
			datos.creadoPor_id = usuario_id;
			datos.statusSugeridoPor_id = usuario_id;
			link = await baseDeDatos.agregaRegistroIdCorrel("links", datos);
			await procsFM.accsEnDepsPorCambioDeStatus("links", link);
			mensaje = "Link creado";
		}
		// Si es un link propio y en status creado, lo actualiza
		else if (link.creadoPor_id == usuario_id && link.statusRegistro_id == creado_id) {
			await baseDeDatos.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			await procsFM.accsEnDepsPorCambioDeStatus("links", link);
			mensaje = "Link actualizado";
		}
		// Guarda la edición
		else {
			if (edicion) datos.id = edicion.id;
			mensaje = await procsFM.guardaActEdic({entidad: "links", original: link, edicion: datos, usuario_id});
			if (mensaje) mensaje = "Edición guardada";
			await comp.linksVencPorSem.actualizaCantLinksPorSem();
		}

		// Fin
		return res.json(mensaje);
	},
	inactivaElimina: async (req, res) => {
		// Variables
		const {url, motivo_id} = req.query;
		const usuario_id = req.session.usuario.id;
		const revisorLinks = req.session.usuario.rolUsuario.revisorLinks;
		const ahora = comp.fechaHora.ahora();
		let link = url ? await baseDeDatos.obtienePorCondicion("links", {url}, "statusRegistro") : "";
		let respuesta = {};

		// Si el campo 'url' no tiene valor, interrumpe la función
		if (!url) respuesta = {mensaje: "Falta el 'url' del link", reload: true};
		// El link no existe en la BD
		else if (!link) respuesta = {mensaje: "El link no existe en la base de datos", reload: true};
		// El link se elimina definitivamente
		else if (
			(link.statusRegistro_id == creado_id && link.creadoPor_id == usuario_id) || // El link está en status 'creado' y por el usuario
			(link.statusRegistro_id == inactivo_id && revisorLinks) // El link está en status 'inactivo' y es un revisorLinks
		) {
			await baseDeDatos.eliminaPorId("links", link.id); // Elimina el registro original
			baseDeDatos.eliminaPorCondicion("statusHistorial", {entidad: "links", entidad_id: link.id}); // elimina el historial de cambios de status
			baseDeDatos.eliminaPorCondicion("histEdics", {entidad: "links", entidad_id: link.id}); // elimina el historial de cambios de edición
			link.statusRegistro_id = inactivo_id;
			await procsFM.accsEnDepsPorCambioDeStatus("links", link);
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
			const datos = {
				statusSugeridoPor_id: usuario_id,
				statusSugeridoEn: ahora,
				motivo_id,
				statusRegistro_id: inactivar_id,
			};
			await baseDeDatos.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			await procsFM.accsEnDepsPorCambioDeStatus("links", link);
			respuesta = {mensaje: "El link fue inactivado con éxito", ocultar: true, pasivos: true};
		}

		// Fin
		return res.json(respuesta);
	},
	recupera: async (req, res) => {
		// Variables
		let datos = req.query;
		const usuario_id = req.session.usuario.id;
		const ahora = comp.fechaHora.ahora();
		let respuesta = {};

		// Obtiene el link
		let link = await baseDeDatos.obtienePorCondicion("links", {url: datos.url}, "statusRegistro");

		// Obtiene el mensaje de la tarea realizada
		respuesta = !link // El link original no existe
			? {mensaje: "El link no existe", reload: true}
			: link.statusRegistro_id != inactivo_id // El link no está en status 'inactivo'
			? {mensaje: "El link no está en status 'inactivo'", reload: true}
			: respuesta;

		// Acciones si no hay ningún error
		if (!respuesta.mensaje) {
			datos = {
				statusSugeridoEn: ahora,
				statusSugeridoPor_id: usuario_id,
				statusRegistro_id: recuperar_id,
			};
			await baseDeDatos.actualizaPorId("links", link.id, datos);
			link = {...link, ...datos};
			await procsFM.accsEnDepsPorCambioDeStatus("links", link);
			respuesta = {mensaje: "Link recuperado", activos: true, ocultar: true};
		}

		// Fin
		return res.json(respuesta);
	},
	deshace: async (req, res) => {
		// Variables
		const datos = req.query;
		const usuario_id = req.session.usuario.id;
		let respuesta = {};

		// Obtiene el link
		let link = await baseDeDatos.obtienePorCondicion("links", {url: datos.url}, "statusRegistro");

		// Obtiene el mensaje de la tarea realizada
		respuesta = !link // El link original no existe
			? {mensaje: "El link no existe", reload: true}
			: link.statusRegistro_id == creado_id
			? {mensaje: "El link está en status creado", reload: true}
			: link.statusRegistro_id == aprobado_id
			? {mensaje: "El link está en status aprobado", reload: true}
			: link.statusRegistro_id == inactivo_id
			? {mensaje: "El link está en status inactivo", reload: true}
			: link.statusSugeridoPor_id != usuario_id
			? {mensaje: "El último cambio de status fue sugerido por otra persona", reload: true}
			: respuesta;

		// Acciones si no hay mensaje de error
		if (!respuesta.mensaje) {
			// Actualiza el status del link
			const nuevosDatos =
				link.statusRegistro_id == inactivar_id
					? {statusRegistro_id: aprobado_id, motivo_id: null}
					: {statusRegistro_id: inactivo_id};
			await baseDeDatos.actualizaPorId("links", link.id, nuevosDatos);

			// Actualiza los campos del producto asociado
			link = {...link, ...nuevosDatos};
			await procsFM.accsEnDepsPorCambioDeStatus("links", link);

			// Respuesta
			respuesta = {mensaje: "Link llevado a su status anterior", activos: true, pasivos: true, ocultar: true};
		}

		// Fin
		return res.json(respuesta);
	},
	altaBaja: async (req, res) => {
		// Variables
		const {url} = req.query;
		const link = await baseDeDatos.obtienePorCondicion("links", {url}, variables.entidades.asocProds);

		// Más variables
		const datos = procesos.variables({link, req});
		const {id, statusRegistro_id, statusCreado, decisAprob, datosLink, campoDecision} = datos;
		const {motivo_id, revId, statusOriginalPor_id, statusOriginal_id, statusFinal_id} = datos;

		// CONSECUENCIAS - Actualiza el registro del link
		await baseDeDatos.actualizaPorId("links", id, datosLink);

		// CONSECUENCIAS - Acciones si no es un 'creadoAprob' convertido en 'aprobado'
		if (statusOriginal_id != creadoAprob_id || statusFinal_id != aprobado_id) {
			// Agrega un registro en el statusHistorial
			let datosHist = {
				entidad_id: id,
				entidad: "links",
				statusOriginal_id: link.statusRegistro_id,
				statusFinal_id: statusRegistro_id,
				statusOriginalPor_id,
				statusFinalPor_id: revId,
				statusOriginalEn: statusCreado ? link.creadoEn : link.statusSugeridoEn,
				aprobado: decisAprob,
			};
			let motivo;
			if (motivo_id) {
				motivo = statusMotivos.find((n) => n.id == motivo_id);
				datosHist.motivo_id = motivo_id;
				datosHist.duracion = Number(motivo.duracion);
				datosHist.comentario = motivo.descripcion;
			}
			baseDeDatos.agregaRegistro("statusHistorial", datosHist);

			// Aumenta el valor de linksAprob/rech en el registro del usuario
			baseDeDatos.aumentaElValorDeUnCampo("usuarios", statusOriginalPor_id, campoDecision, 1);

			// Penaliza al usuario si corresponde
			if (motivo) comp.penalizacAcum(statusOriginalPor_id, motivo, "links");
		}

		// CONSECUENCIAS - Actualiza los productos en los campos de 'links'
		await procsFM.accsEnDepsPorCambioDeStatus("links", {...link, statusRegistro_id});

		// Fin
		return res.json("");
	},
};
