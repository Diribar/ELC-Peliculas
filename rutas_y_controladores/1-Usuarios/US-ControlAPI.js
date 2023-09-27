"use strict";
// Definir variables
const valida = require("./US-FN-Validar");
const procesos = require("./US-FN-Procesos");

module.exports = {
	valida: {
		formatoMail: (req, res) => {
			let error = valida.formatoMail(req.query.email);
			return res.json(error);
		},
		login: async (req, res) => {
			let errores = valida.login(req.query);
			return res.json(errores);
		},
		editables: async (req, res) => {
			let errores = await valida.editables(req.query);
			return res.json(errores);
		},
		identidad: async (req, res) => {
			let errores = await valida.identidadFE(req.query);
			return res.json(errores);
		},
	},
	fin: {
		altaMail: async (req, res) => {
			// Variables
			const email = req.query.email;

			// Validaciones
			const errores = await valida.altaMail(email);

			// Si error => return errores
			if (errores.hay) return res.json({errores});

			// Si no hubo errores con el valor del email, envía el mensaje con la contraseña
			const {ahora, contrasena, mailEnviado} = await procesos.envioDeMailConContrasena(email);

			// Si no hubo errores con el envío del mensaje, crea el usuario
			if (mailEnviado)
				await BD_genericas.agregaRegistro("usuarios", {
					email,
					contrasena,
					fechaContrasena: ahora,
					statusRegistro_id: stMailPendValidar_id,
				});

			// Guarda el mail en 'session'
			req.session.email = email;

			// Devuelve la info
			return res.json({errores, mailEnviado});
		},
		olvidoContrasena: async (req, res) => {
			// Variables
			const datos = JSON.parse(req.query.datos);
			const email = datos.email;
			const usuario = datos.email ? await procesos.usuarioDelMail(email) : "";

			// Validaciones
			const errores = await valida.olvidoContrasena({...datos, usuario});

			// Acciones si hay error
			if (errores.hay) {
				datos.errores = errores;
				req.session["olvido-contrasena"] = datos;
				return res.json({errores});
			}

			// Si no hubo errores con el valor del email, envía el mensaje con la contraseña
			const {ahora, contrasena, mailEnviado} = await procesos.envioDeMailConContrasena(email);

			// Si no hubo errores con el envío del mensaje, actualiza la contraseña del usuario
			if (mailEnviado)
				await BD_genericas.actualizaPorId("usuarios", usuario.id, {
					contrasena,
					fechaContrasena: ahora,
				});

			// Guarda el mail en 'session'
			req.session.email = email;

			// Borra los errores
			delete req.session["olvido-contrasena"];

			// Devuelve la info
			return res.json({errores, mailEnviado});
		},
	},
	videoConsVisto: async (req, res) => {
		// Variables
		const usuario = req.session.usuario;
		const userID = usuario ? usuario.id : null;

		// Si está logueado, actualiza el usuario
		if (userID && !usuario.videoConsVisto) {
			BD_genericas.actualizaPorId("usuarios", userID, {videoConsVisto: true});
			req.session.usuario.videoConsVisto = true;
		}

		// Fin
		return res.json();
	},
};
