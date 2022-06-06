"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");
const usuarios = require("../../funciones/3-Procesos/8-Usuarios");

module.exports = async (req, res, next) => {
	// Actualizar el usuario
	req.session.usuario = await BD_especificas.obtenerUsuarioPorMail(req.session.usuario.email);
	let usuario = req.session.usuario;
	// Variables
	let productos = await usuarios.productosCreadosPorUnUsuario(usuario.id);
	// Averiguar cuántos productos tiene en cada status
	let creado = productos.filter((n) => n.status_registro.creado).length;
	// Redireccionar si corresponde
	if (creado >= Math.max(1, usuario.cant_altas_aprob - usuario.cant_altas_rech + 2)) {
		let informacion = {
			mensajes: [
				"Gracias por los registros agregados anteriormente.",
				"Queremos analizar los registros que nos sugeriste agregar, antes de que sigas agregando otros.",
				"En cuanto los hayamos analizado, te habilitaremos para que ingreses más.",
				"La cantidad autorizada a ingresar irá aumentando a medida que tus propuestas sean aprobadas.",
			],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				{nombre: "fa-house", link: "/", titulo: "Solicitar el permiso"},
			],
		};
		return res.render("Errores", {informacion});
	}
	// Fin
	next();
};
