"use strict";
// Definir variables
const validaUsuarios = require("./US-FN-Validar");

module.exports = {
	validaMail: async (req, res) => {
		let errores = await validaUsuarios.altaMail(req.query.email);
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
	},
	validaEditables: async (req, res) => {
		let errores = await validaUsuarios.editables(req.query);
		return res.json(errores);
	},
	validaIdentidad: async (req, res) => {
		let errores = await validaUsuarios.identidadFE(req.query);
		return res.json(errores);
	},
	validaLogin: async (req, res) => {
		let errores = validaUsuarios.login(req.query);
		return res.json(errores);
	},
};
