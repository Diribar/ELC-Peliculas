"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
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
	obtieneProvs: async (req, res) => {
		let provs = await BD_genericas.obtieneTodos("links_provs", "orden");
		return res.json(provs);
	},
	guardar: async (req, res) => {
		// Variables
		let datos = req.query;
		let userID = req.session.usuario.id;
		// Completa la info
		let producto_id = comp.obtieneEntidad_id(datos.prodEntidad);
		datos[producto_id] = datos.prodID;
		datos.prov_id = await obtieneProveedorID(datos.url);
		// Obtiene el link
		let link_original = await BD_genericas.obtienePorCamposConInclude(
			"links",
			{url: datos.url},
			"status_registro"
		);
		// Obtiene el mensaje de la tarea realizada
		let link_edicion = datos;
		let mensaje = !link_original
			? await comp.creaRegistro("links", datos, userID) // El link_original no existe --> se lo debe crear
			: link_original.creado_por_id == userID && link_original.status_registro.creado // ¿Link propio en status creado?
			? await comp.actualizaRegistro("links", link_original.id, link_edicion) // Actualizar el link_original
			: await comp.guardaEdicion("links", "links_edicion", link_original, link_edicion, userID); // Guardar la edición
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
		// Averigua si no existe el 'url'
		if (!url) respuesta = {mensaje: "Falta el 'url' del link", reload: true};
		else {
			// Obtiene el link
			link = await BD_genericas.obtienePorCamposConInclude("links", {url: url}, ["status_registro"]);
			// El link no existe en la BD
			if (!link) respuesta = {mensaje: "El link no existe en la base de datos", reload: true};
			// El link está en status 'creado" y por el usuario --> se elimina definitivamente
			else if (link.status_registro.creado && link.creado_por_id == userID) {
				respuesta = {mensaje: "El link fue eliminado con éxito", ocultar: true};
				await BD_genericas.eliminaPorId("links", link.id);
				procesos.prodCampoLG(prodEntidad, prodID);
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
				await comp.inactivaRegistro("links", link.id, userID, motivo_id);
				procesos.prodCampoLG(prodEntidad, prodID);
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
		let recuperar_id = status_registro.find((n) => n.recuperar).id;
		// Obtiene el link
		let link = await BD_genericas.obtienePorCamposConInclude(
			"links",
			{url: datos.url},
			"status_registro"
		);
		// Obtiene el mensaje de la tarea realizada
		respuesta = !link // El link original no existe
			? {mensaje: "El link no existe", reload: true}
			: link.status_registro.recuperar // El link ya estaba en status recuperar
			? {mensaje: "El link ya estaba en status 'recuperar'", reload: true}
			: respuesta;
		if (!respuesta.mensaje) {
			await BD_genericas.actualizaPorId("links", link.id, {
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
		let aprobado_id = status_registro.find((n) => n.aprobado).id;
		let inactivo_id = status_registro.find((n) => n.inactivo).id;
		// Obtiene el link
		let link = await BD_genericas.obtienePorCamposConInclude(
			"links",
			{url: datos.url},
			"status_registro"
		);
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
			let objeto = {sugerido_por_id: null, sugerido_en: null, motivo_id: null};
			if (link.status_registro.inactivar)
				await BD_genericas.actualizaPorId("links", link.id, {
					...objeto,
					status_registro_id: aprobado_id,
				});
			if (link.status_registro.recuperar)
				await BD_genericas.actualizaPorId("links", link.id, {
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

let obtieneProveedorID = async (url) => {
	// Obtiene el proveedor
	let proveedores = await BD_genericas.obtieneTodos("links_provs", "nombre");
	// Averigua si algún 'distintivo de proveedor' está incluido en el 'url'
	let proveedor = proveedores.filter((n) => !n.generico).find((n) => url.includes(n.url_distintivo));
	// Si no se reconoce el proveedor, se asume el 'desconocido'
	proveedor = proveedor ? proveedor : proveedores.find((n) => n.generico);
	return proveedor.id;
};
