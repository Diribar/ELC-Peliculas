"use strict";
// Variables
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
			const {email} = JSON.parse(req.query.datos);
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
	olvidoContr: {
		validaDatosPer: async (req, res) => {
			// Variables
			const datos = JSON.parse(req.query.datos);
			const {errores, usuario} = await valida.olvidoContr.datosPer(datos);

			// Acciones si hay un error
			if (errores.hay) {
			}

			// Devuelve la info
			return res.json(errores);
		},
		envioDeMail: async (req, res) => {
			// Variables
			const {email} = req.query;
			const usuario = email ? await BD_genericas.obtienePorCondicion("usuarios", {email}) : "";

			// Envía el mensaje con la contraseña
			const {contrasena, mailEnviado} = await procesos.envioDeMailConContrasena(email);

			// Si no hubo errores con el envío del email, actualiza la contraseña del usuario
			if (mailEnviado)
				await BD_genericas.actualizaPorId("usuarios", usuario.id, {
					contrasena,
					fechaContrasena: new Date().toISOString(),
				});

			// Guarda el mail en 'session' y borra los errores
			req.session.email = email;
			delete req.session.olvidoContr;

			// Fin
			return res.json(mailEnviado);
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
