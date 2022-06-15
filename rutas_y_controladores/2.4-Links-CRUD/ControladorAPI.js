"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const procesar = require("../../funciones/3-Procesos/3-RUD");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const validar = require("../../funciones/4-Validaciones/RUD");

// *********** Controlador ***********
module.exports = {
	// Links
	validar: async (req, res) => {
		// Averigua los errores solamente para esos campos
		let errores = await validar.links(req.query);
		// Devuelve el resultado
		return res.json(errores);
	},
	obtenerProvs: async (req, res) => {
		let provs = await BD_genericas.obtenerTodos("links_provs", "orden");
		return res.json(provs);
	},
	guardar: async (req, res) => {
		// Variables
		let datos = req.query;
		let userID = req.session.usuario.id;
		// Completar la info
		let producto_id = funciones.obtenerEntidad_id(datos.prodEntidad);
		datos[producto_id] = datos.prodID;
		datos.prov_id = await obtenerProveedorID(datos.url);
		// Obtener el link
		let link = await BD_genericas.obtenerPorCamposConInclude(
			"links",
			{url: datos.url},
			"status_registro"
		);
		// Obtener el mensaje de la tarea realizada
		let mensaje = !link
			? await crear_link(datos, userID) // El link original no existe --> se lo debe crear
			: link.creado_por_id == userID && link.status_registro.creado // ¿Link propio en status creado?
			? await actualizar_link(link, datos) // Actualizar el link original
			: await edicion_link(link, datos, userID); // Edicion
		// Fin
		return res.json(mensaje);
	},
	eliminar: async (req, res) => {
		// Proceso
		// - Los links en status 'creado' y del usuario => se eliminan definitivamente
		// - Los demás --> se inactivan
		// Definir las variables
		let {prodEntidad, prodID, url, motivo_id} = req.query;
		let userID = req.session.usuario.id;
		let respuesta = {};
		let link;
		// Averiguar si no existe el 'url'
		if (!url) respuesta = {mensaje: "Falta el 'url' del link", reload: true};
		else {
			// Obtener el link
			link = await BD_genericas.obtenerPorCamposConInclude("links", {url: url}, ["status_registro"]);
			// El link no existe en la BD
			if (!link) respuesta = {mensaje: "El link no existe en la base de datos", reload: true};
			// El link está en status 'creado" y por el usuario --> se elimina definitivamente
			else if (link.status_registro.creado && link.creado_por_id == userID) {
				respuesta = {mensaje: "El link fue eliminado con éxito", ocultar: true};
				await BD_genericas.eliminarPorId("links", link.id);
				procesar.actualizarProdConLinkGratuito("links", prodID);
			}
			// El link existe y no tiene status 'aprobado'
			else if (!link.status_registro.aprobado)
				respuesta = {mensaje: "En este status no se puede inactivar", reload: true};
			// El link existe y tiene status 'aprobado'
			// No existe el motivo
			else if (!motivo_id)
				respuesta = {mensaje: "Falta el motivo por el que se inactiva", reload: true};
			else {
				// Inactivar
				await procesar.inactivar("links", link.id, userID, motivo_id);
				procesar.actualizarProdConLinkGratuito(prodEntidad, prodID);
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
		let recuperar_id = req.session.status_registro.find((n) => n.recuperar).id;
		// Obtener el link
		let link = await BD_genericas.obtenerPorCamposConInclude(
			"links",
			{url: datos.url},
			"status_registro"
		);
		// Obtener el mensaje de la tarea realizada
		respuesta = !link // El link original no existe
			? {mensaje: "El link no existe", reload: true}
			: link.status_registro.recuperar // El link ya estaba en status recuperar
			? {mensaje: "El link ya estaba en status 'recuperar'", reload: true}
			: respuesta;
		if (!respuesta.mensaje) {
			await BD_genericas.actualizarPorId("links", link.id, {
				status_registro_id: recuperar_id,
				sugerido_por_id: userID,
			});
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
		// Completar la info
		let aprobado_id = req.session.status_registro.find((n) => n.aprobado).id;
		let inactivo_id = req.session.status_registro.find((n) => n.inactivo).id;
		// Obtener el link
		let link = await BD_genericas.obtenerPorCamposConInclude(
			"links",
			{url: datos.url},
			"status_registro"
		);
		// Obtener el mensaje de la tarea realizada
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
			let objeto = {sugerido_por_id: null, sugerido_en: null, motivo_id: null};
			if (link.status_registro.inactivar)
				await BD_genericas.actualizarPorId("links", link.id, {
					...objeto,
					status_registro_id: aprobado_id,
				});
			if (link.status_registro.recuperar)
				await BD_genericas.actualizarPorId("links", link.id, {
					...objeto,
					status_registro_id: inactivo_id,
				});
			respuesta = {
				mensaje: "Link llevado a su status anterior",
				activos: true,
				pasivos: true,
				ocultar: true,
			};
		}
		// Fin
		return res.json(respuesta);
	},
};

let obtenerProveedorID = async (url) => {
	// Obtener el proveedor
	let proveedores = await BD_genericas.obtenerTodos("links_provs", "id");
	// Averigua si algún 'distintivo de proveedor' está incluido en el 'url'
	let proveedor = proveedores.filter((n) => !n.generico).find((n) => url.includes(n.url_distintivo));
	// Si no se reconoce el proveedor, se asume el 'desconocido'
	proveedor = proveedor ? proveedor : proveedores.find((n) => n.generico);
	return proveedor.id;
};
let crear_link = async (datos, userID) => {
	datos.creado_por_id = userID;
	await BD_genericas.agregarRegistro("links", datos);
	procesar.actualizarProdConLinkGratuito(datos.prodEntidad, datos.prodID);
	return "Link agregado";
};
let actualizar_link = async (link, datos) => {
	await BD_genericas.actualizarPorId("links", link.id, datos);
	procesar.actualizarProdConLinkGratuito(datos.prodEntidad, datos.prodID);
	return "Link original actualizado";
};
let edicion_link = async (link, datos, userID) => {
	// Depurar para dejar solamente las novedades de la edición
	datos = funciones.quitarLasCoincidenciasConOriginal(link, datos);
	// Obtener nuevamente el 'producto_id', que se pierde en el paso anterior
	let producto_id = funciones.obtenerEntidad_id(datos.prodEntidad);
	// Si existe una edición de ese link y de ese usuario --> eliminarlo
	let objeto = {link_id: link.id, editado_por_id: userID};
	let registro = await BD_genericas.obtenerPorCampos("links_edicion", objeto);
	if (registro) await BD_genericas.eliminarPorId("links_edicion", registro.id);
	// Averiguar si hay algún campo con novedad
	delete datos.prodEntidad;
	delete datos.prodID;
	if (!Object.keys(datos).length) return "Edición sin novedades respecto al original";
	// Preparar la información
	datos = {
		...datos,
		link_id: link.id,
		[producto_id]: link[producto_id],
		editado_por_id: userID,
	};
	// Agregar la nueva edición
	await BD_genericas.agregarRegistro("links_edicion", datos);
	// Fin
	return "Edición guardada";
};
