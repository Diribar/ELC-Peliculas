"use strict";
// Definir variables
const valida = require("./US-FN-Validar");
const procesos = require("./US-FN-Procesos");

module.exports = {
	validaMail: async (req, res) => {
		let errores = await valida.altaMail(req.query.email);
		return res.json(errores);
	},
	enviaMail: async (req, res) => {
		// Envía un mail con la contraseña
		const {ahora, contrasena, feedbackEnvioMail} = await procesos.enviaMailConContrasena(req);

		// Si no hubieron errores, agrega el usuario
		if (!feedbackEnvioMail.OK)
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
	validaEditables: async (req, res) => {
		let errores = await valida.editables(req.query);
		return res.json(errores);
	},
	validaIdentidad: async (req, res) => {
		let errores = await valida.identidadFE(req.query);
		return res.json(errores);
	},
	validaLogin: async (req, res) => {
		let errores = valida.login(req.query);
		return res.json(errores);
	},
};
