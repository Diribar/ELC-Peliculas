"use strict";
// Definir variables
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	// Redireccionar si el usuario no está logueado
	if (!usuario) return res.redirect("/usuarios/login");
	// Redireccionar si el usuario no tiene el permiso necesario
	let informacion;
	if (!usuario.rol_usuario.aut_input)
		if (!usuario.status_registro.documento)
			informacion = {
				mensajes: [
					"Para ingresar información, se requiere aumentar el nivel de confianza.",
					"Podés gestionarlo haciendo click en la flecha hacia la derecha.",
				],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: req.session.urlSinAutInput,
						titulo: "Ir a la vista anterior",
					},
					{
						nombre: "fa-circle-right",
						link: "/usuarios/responsabilidad",
						titulo: "Solicitar el permiso",
					},
				],
				titulo: "Aviso",
				colorFondo: "verde",
			};
		else
			informacion = {
				mensajes: [
					"Para ingresar información, se requiere un permiso que ya nos solicitaste.",
					"Nos lo pediste el " +
						compartidas.fechaHorarioTexto(usuario.fecha_feedback_revisores) +
						".",
					"Tenés que esperar a que el equipo de Revisores valide tus datos personales con tu documento.",
					"Luego de la validación, recibirás un mail de feedback.",
					"En caso de estar aprobado, podrás ingresarnos información.",
				],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: req.session.urlSinAutInput,
						titulo: "Ir a la vista anterior",
					},
				],
				iconos: [variables.vistaEntendido(req.session.urlSinAutInput)],
				titulo: "Aviso",
				colorFondo: "gris",
			};

	// Si corresponde, mostrar el mensaje de error
	if (informacion) return res.render("MI-Cartel", {informacion});
	// Fin
	next();
};
