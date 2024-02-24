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
			let intsAltaMail;

			// Si hubieron errores de credenciales - intsAltaMail - cookie
			if (errores.credenciales) {
				intsAltaMail = req.cookies && req.cookies.intsAltaMail ? req.cookies.intsAltaMail + 1 : 1;
				if (intsAltaMail <= intentosCookies + 1) res.cookie("intsAltaMail", intsAltaMail, {maxAge: unDia});
			}

			// cookie - guarda la info
			datos =
				req.cookies && req.cookies.altaMail && req.cookies.altaMail.datos
					? {...req.cookies.altaMail.datos, ...datos}
					: datos;
			const cookie = req.cookies && req.cookies.altaMail ? {...req.cookies.altaMail, datos, errores} : {datos};
			res.cookie("altaMail", cookie, {maxAge: unDia});

			// Devuelve la info
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
			let datos = JSON.parse(req.query.datos);
			const errores = await valida.olvidoContr.datosPer(datos);
			let intsDatosPer;

			// Acciones si hubieron errores de credenciales
			if (errores.credenciales) {
				// intsDatosPer - cookie
				intsDatosPer = req.cookies && req.cookies.intsDatosPer ? req.cookies.intsDatosPer + 1 : 1;
				if (intsDatosPer <= intentosCookies + 1) res.cookie("intsDatosPer", intsDatosPer, {maxAge: unDia});

				// intsDatosPer - usuario
				intsDatosPer = usuario.intsDatosPer + 1;
				if (intsDatosPer <= intsLogin_BD + 1) BD_genericas.actualizaPorId("usuarios", usuario.id, {intsDatosPer});
			}

			// cookie - guarda la info
			datos =
				req.cookies && req.cookies.olvidoContr && req.cookies.olvidoContr.datos
					? {...req.cookies.olvidoContr.datos, ...datos}
					: datos;
			const cookie = req.cookies && req.cookies.olvidoContr ? {...req.cookies.olvidoContr, datos, errores} : {datos};
			res.cookie("olvidoContr", cookie, {maxAge: unDia});

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
