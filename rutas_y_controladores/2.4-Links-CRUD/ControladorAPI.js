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
	linksGuardar: async (req, res) => {
		// Variables
		let datos = req.query;
		return res.json(datos);
		let userID = req.session.usuario.id;
		// Averiguar si hay errores de validación
		let errores = await validar.links(datos);
		if (errores.hay) req.session.links = datos;
		else {
			// Procesar los datos en la operación que corresponda
			datos.alta
				? await procesar.altaDeLink(req, datos)
				: await procesar.guardarEdicionDeLink(userID, datos);
			delete req.session.links;
		}
		// Redireccionar
		return res.redirect("/links/abm/?entidad=" + datos.prodEntidad + "&id=" + datos.prodID);
	},

	linksEliminar: async (req, res) => {
		// Proceso
		// - Los links en status 'creado' y del usuario => se eliminan definitivamente
		// - Los demás --> se inactivan
		// Definir las variables
		let respuesta = {};
		let {url, motivo_id} = req.query;
		let userID = req.session.usuario.id;
		let entidad = "links";
		let link
		// Averiguar si no existe el 'url'
		if (!url) respuesta.mensaje = "Falta el 'url' del link";
		else {
			// Averiguar si el link no existe en la BD
			link = await BD_genericas.obtenerPorCamposConInclude("links", {url: url}, [
				"status_registro",
			]);
			if (!link) {
				// Consecuencias si el link no existe en la BD
				respuesta.mensaje = "El link no existe en la base de datos";
				respuesta.reload = true;
			}
		}
		if (!respuesta.mensaje) {
			if (link.status_registro.creado && link.creado_por_id == userID) {
				// En status 'creado" y por el usuario --> se eliminan definitivamente
				BD_genericas.eliminarRegistro(entidad, linkID);
				respuesta.mensaje = "El link fue eliminado con éxito";
				respuesta.resultado = true;
			} else if (link.status_registro.gr_inactivos) {
				// El link existe y tiene status 'gr_inactivos'
				respuesta.mensaje = "El link está en status inactivo";
			} else if (!link.status_registro.gr_pasivos) {
				// El link existe y tiene status 'aprobado'
				if (!motivo_id) respuesta.mensaje = "Falta el motivo por el que se inactiva";
				else {
					procesar.inactivar(entidad, linkID, userID, motivo_id);
					respuesta.mensaje = "El link fue inactivado con éxito";
					respuesta.resultado = true;
				}
			}
		}
		return res.json(respuesta);
	},
};
