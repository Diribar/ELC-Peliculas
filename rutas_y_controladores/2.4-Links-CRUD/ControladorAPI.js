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
	linksEliminar: async (req, res) => {
		// Proceso
		// - Los links en status 'creado' y del usuario => se eliminan definitivamente
		// - Los demás --> se inactivan
		// Definir las variables
		let respuesta = {};
		let {link_id: linkID, motivo_id} = req.query;
		let userID = req.session.usuario.id;
		let entidad = "links_originales";
		// Descartar que no hayan errores
		if (!linkID) respuesta.mensaje = "Faltan el dato del ID del link";
		else {
			// El linkID existe
			let link = await BD_genericas.obtenerPorIdConInclude(entidad, linkID, ["status_registro"]);
			if (!link) {
				// Consecuencias si el link no existe en la BD
				respuesta.mensaje = "El link no existe en la base de datos";
				respuesta.reload = true;
			} else if (link.status_registro.creado && link.creado_por_id == userID) {
				// En status 'creado" y por el usuario --> se eliminan definitivamente
				BD_genericas.eliminarRegistro(entidad, linkID);
				respuesta.mensaje = "El link fue eliminado con éxito";
				respuesta.resultado = true;
			} else if (link.status_registro.gr_inactivos) {
				// El link existe y tiene status 'gr_inactivos'
				respuesta.mensaje = "El link está en status inactivo";
			} else if (link.status_registro.aprobado) {
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
