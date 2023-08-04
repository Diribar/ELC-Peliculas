"use strict";
// Definir variables
const valida = require("./US-FN-Validar");
const procesos = require("./US-FN-Procesos");
const BD_genericas = require("../../funciones/2-BD/Genericas");

module.exports = {
	valida: {
		formatoMail: (req, res) => {
			let errores = valida.formatoMail(req.query.email);
			return res.json(errores);
		},
		mailRepetido: async (req, res) => {
			let errores = await valida.mailRepetido(req.query.email)
			return res.json(errores);
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
	envioDeMail: async (req, res) => {
		// Variables
		const email = req.query.email;
		req.body = {email};

		// Envía un mail con la contraseña
		const {ahora, contrasena, feedbackEnvioMail} = await procesos.enviaMailConContrasena(req);

		// Si no hubieron errores, agrega el usuario
		if (feedbackEnvioMail.OK)
			await BD_genericas.agregaRegistro("usuarios", {
				contrasena,
				fechaContrasena: ahora,
				email,
				statusRegistro_id: mailPendValidar_id,
			});

		// Guarda el mail en 'session'
		req.session.usuario = {email};

		// Fin
		return res.json(feedbackEnvioMail);
	},
};
