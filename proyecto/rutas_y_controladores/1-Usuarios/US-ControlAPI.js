"use strict";
// Definir variables
const valida = require("./US-FN-Validar");
const procesos = require("./US-FN-Procesos");

module.exports = {
	valida: {
		formatoMail: (req, res) => {
			let errores = valida.formatoMail(req.query.email);
			return res.json(errores);
		},
		login: async (req, res) => {
			const errores = await valida.login(req.query);
			return res.json(errores);
		},
		editables: async (req, res) => {
			const errores = await valida.editables(req.query);
			return res.json(errores);
		},
		perennes: async (req, res) => {
			const errores = await valida.perennesFE(req.query);
			return res.json(errores);
		},
	},
	altaMail: {
		validaMail: async (req, res) => {
			// Variables
			const {email} = req.query;
			const errores = await valida.altaMail(email);

			// Fin
			return res.json(errores);
		},
		envioDeMail: async (req, res) => {
			// Envía el mail con la contraseña
			const {email} = req.query;
			const {contrasena, mailEnviado} = await procesos.envioDeMailConContrasena(email);

			// Si no hubo errores con el envío del mensaje, crea el usuario
			if (mailEnviado)
				await BD_genericas.agregaRegistro("usuarios", {
					email,
					contrasena,
					statusRegistro_id: mailPendValidar_id,
					versionElcUltimoLogin: versionELC,
				});

			// Guarda el mail en 'session'
			req.session.email = email;

			// Devuelve la info
			return res.json(mailEnviado);
		},
	},
	olvidoContrasena: {
		validaMail: async (req, res) => {
			// Variables
			const {datos} = JSON.parse(req.query);
			const errores = await valida.olvidoContrasena.validaMail(datos);

			// Acciones si hay un error
			if (errores.hay) req.session["olvido-contrasena"] = errores;

			// Devuelve la info
			return res.json(errores);
		},
		envioDeMail: async (req, res) => {
			// Variables
			const {email} = req.query
			const usuario = email ? await BD_genericas.obtienePorCondicion("usuarios", {email}) : "";


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
