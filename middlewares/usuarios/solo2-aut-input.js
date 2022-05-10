"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	if (!usuario) return res.redirect("/usuarios/login");
	if (!usuario.rol_usuario.aut_input) {
		let linkUsuarioAutInput = "/usuarios/autorizado-input/solicitud";
		let informacion = {
			mensajes: [
				"Se requiere aumentar el nivel de confianza, para ingresar información a nuestro sistema. Podés gestionarlo vos mismo haciendo click abajo, en la flecha hacia la derecha.",
			],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				{nombre: "fa-circle-right", link: linkUsuarioAutInput, titulo: "Solicitar el permiso"},
			],
		};
		return res.render("Errores", {informacion});
	}
	if (usuario.penalizado_hasta && new Date(usuario.penalizado_hasta) > new Date(funciones.ahora())) {
		let hasta = new Date(usuario.penalizado_hasta);
		let fecha =
			hasta.getDate() + "/" + meses[hasta.getMonth()] + "/" + String(hasta.getFullYear()).slice(-2);
		let hora = hasta.getHours() + ":" + String(hasta.getMinutes() + 1).padStart(2, "0");
		let informacion = {
			mensajes: [
				"Necesitamos que la información que nos brindes esté más alineada con nuestro perfil y sea precisa",
				"Podrás volver a ingresar información el día " + fecha + ", a las " + hora + "hs.",
			],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				{nombre: "fa-house", link: "/", titulo: "Ir a la vista de inicio"},
			],
		};
		return res.render("Errores", {informacion});
	}
	next();
};
