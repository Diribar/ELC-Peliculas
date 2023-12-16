"use strict";
// Variables
const valida = require("./IN-FN-Validar");

// *********** Controlador ***********
module.exports = {
	institucional: (req, res) => {
		// Variables
		const url = req.path.slice(1);
		const vistas = Object.keys(vistasInstitucs);
		const vistaActual = vistasInstitucs[url];
		const indice = vistas.indexOf(url);

		// Vistas anterior y posterior
		const urlAnt = indice ? vistas[indice - 1] : null;
		const urlPost = indice < vistas.length - 1 ? vistas[indice + 1] : "inicio";

		// Fin
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			...vistaActual,
			...{urlAnt, urlPost, indice, vistas: vistas.length - 1},
		});
	},
	contactanos: {
		form: async (req, res) => {
			// Variables
			const tema = "institucional";
			const codigo = "contactanos";
			const titulo = "Contactanos";
			const urlAnterior = req.session.urlAnterior;

			// Obtiene información para la vista
			const dataEntry = req.session.contactanos ? req.session.contactanos : {};

			// Va a la vista
			return res.render("CMP-0Estructura", {tema, codigo, titulo, dataEntry, urlAnterior});
		},
		guardar: async (req, res) => {
			// Revisa errores
			const errores = await valida.contactanos(req.body);
			req.session.contactanos = req.body; // actualiza el contenido del formulario en 'session'

			// Si hay errores, redirige a la vista de errores
			if (errores.hay) {
				const informacion = {
					mensajes: [Object.values(errores)[0]],
					iconos: [variables.vistaEntendido("/institucional/contactanos")],
				};
				return res.render("CMP-0Estructura", {informacion});
			}

			// Variables
			const {asunto, comentario} = req.body;
			const usuario = req.session.usuario;
			const emailELC = "sp2015w@gmail.com";
			const asuntoMail = variables.asuntosContactanos.find((n) => n.codigo == asunto).descripcion;
			let mailEnviado, destino, datos;

			// Envía el mail a ELC
			datos = {
				email: emailELC,
				asunto: asuntoMail,
				comentario: comentario + "<br><br>" + usuario.nombre + " " + usuario.apellido + "<br>" + usuario.email,
			};
			mailEnviado = await comp.enviaMail(datos);
			if (!mailEnviado) destino = "/institucional/contactanos/envio-fallido";
			// Envía el email al usuario
			else {
				datos = {
					email: usuario.email,
					asunto: "Mail enviado a ELC",
					comentario:
						'Hemos enviado tu e-mail al equipo de ELC, con el asunto "' +
						asuntoMail +
						'", y el siguiente comentario:<br><em>' +
						comentario +
						"</em>",
				};
				comp.enviaMail(datos);
				destino = "/institucional/contactanos/envio-exitoso";
			}

			// Fin
			return res.redirect(destino);
		},
		envioExitoso: (req, res) => {
			// Variables
			const direccion = req.session.urlSinLogin;
			if (!req.session.contactanos) return res.redirect(direccion);
			const {asunto, comentario} = req.session.contactanos;
			const asuntoMail = variables.asuntosContactanos.find((n) => n.codigo == asunto).descripcion;
			delete req.session.contactanos;

			// Información
			const informacion = {
				mensajes: [
					"Hemos enviado tu mensaje al equipo de ELC, con el asunto '" + asuntoMail + "'",
					"Incluimos tu nombre y dirección de mail, para que puedas recibir una respuesta",
				],
				iconos: [{...variables.vistaEntendido(direccion), titulo: "Entendido"}],
				titulo: "Envío exitoso de mail",
				check: true,
			};

			// Vista
			return res.render("CMP-0Estructura", {informacion});
		},
		envioFallido: (req, res) => {
			// Variables
			const informacion = {
				mensajes: [
					"No pudimos enviar el mail.",
					"Revisá tu conexión a internet y volvé a intentarlo.",
					"Con el ícono de abajo regresás a la vista anterior.",
				],
				iconos: [{...variables.vistaEntendido("/institucional/contactanos"), titulo: "Entendido"}],
				titulo: "Envío fallido de mail",
			};

			// Vista
			return res.render("CMP-0Estructura", {informacion});
		},
	},
};
