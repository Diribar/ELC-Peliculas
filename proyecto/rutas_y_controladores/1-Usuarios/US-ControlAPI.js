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

			// Acciones si hubieron errores de credenciales
			if (errores.credenciales) {
				// intentosAM - cookie
				const intentosAM = req.cookies && req.cookies.intentosAM ? Number(req.cookies.intentosAM) + 1 : 1;
				if (intentosAM <= intentosCookies) res.cookie("intentosAM", intentosAM, {maxAge: unDia});
				const intentosPendsCookie = Math.max(0, intentosCookies - intentosAM);

				// Convierte el resultado en texto
				errores.credenciales =
					procesos.comentarios.credsInvalidas.altaMail + "<br>Intentos disponibles: " + intentosPendsCookie;
			} else errores.credenciales = "";

			// session - guarda la info
			const datos = req.session.altaMail && req.session.altaMail.datos ? {...req.session.altaMail.datos, email} : {email};
			req.session.altaMail = {...datos, errores};

			// Devuelve la info
			return res.json(errores);
		},
		envioDeMail: async (req, res) => {
			// Envía el mail con la contraseña
			const {email} = req.query;
			const {contrasena, mailEnviado} = await procesos.envioDeMailConContrasena({email, altaMail: true});

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
		datosDeSession: (req, res) => res.json(req.session ? req.session.olvidoContr : {}),
		validaDatosPer: async (req, res) => {
			// Variables
			let datos = JSON.parse(req.query.datos);
			const errores = await valida.olvidoContr.datosPer(datos);
			let intentosDP;

			// Acciones si hubieron errores de credenciales
			if (errores.credenciales) {
				// intentosDP - cookie
				intentosDP = req.cookies && req.cookies.intentosDP ? Number(req.cookies.intentosDP) + 1 : 1;
				if (intentosDP <= intentosCookies) res.cookie("intentosDP", intentosDP, {maxAge: unDia});
				const intentosPendsCookie = Math.max(0, intentosCookies - intentosDP);

				// intentosDP - usuario
				intentosDP = datos.usuario.intentosDP + 1;
				if (intentosDP <= intentosBD) BD_genericas.actualizaPorId("usuarios", datos.usuario.id, {intentosDP});
				const intentosPendsBD = Math.max(0, intentosBD - intentosDP);

				// Convierte el resultado en texto
				const intentosPendsCons = Math.min(intentosPendsCookie, intentosPendsBD);
				errores.credenciales =
					procesos.comentarios.credsInvalidas.olvidoContr + "<br>Intentos disponibles: " + intentosPendsCons;
			} else errores.credenciales = "";

			// session - guarda la info
			datos = req.session.olvidoContr ? {...req.session.olvidoContr.datos, ...datos} : datos;
			req.session.olvidoContr = {...req.session.olvidoContr, datos, errores};

			// Devuelve la info
			return res.json(errores);
		},
		envioDeMail: async (req, res) => {
			// Variables
			const {email} = req.query;
			const usuario = email ? await BD_genericas.obtienePorCondicion("usuarios", {email}) : "";

			// Envía el mensaje con la contraseña
			const {contrasena, mailEnviado} = await procesos.envioDeMailConContrasena({email});

			// Si no hubo errores con el envío del email, actualiza la contraseña del usuario
			if (mailEnviado)
				await BD_genericas.actualizaPorId("usuarios", usuario.id, {
					contrasena,
					fechaContrasena: new Date().toISOString(),
				});

			// Guarda el mail en 'session' y borra los errores
			req.session.email = email; // para usar en el login
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
