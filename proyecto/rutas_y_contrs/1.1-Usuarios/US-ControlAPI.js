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
				if (intentosAM <= maxIntentosCookies) res.cookie("intentosAM", intentosAM, {maxAge: unDia});
				const intentosPendsCookie = Math.max(0, maxIntentosCookies - intentosAM);

				// Convierte el resultado en texto
				errores.credenciales =
					procesos.comentarios.credsInvalidas.altaMail + "<br>Intentos disponibles: " + intentosPendsCookie;
			} else delete errores.credenciales;

			// session - guarda la info
			const datos = req.session.altaMail && req.session.altaMail.datos ? {...req.session.altaMail.datos, email} : {email};
			req.session.altaMail = {...datos, errores};

			// Devuelve la info
			return res.json(errores);
		},
		envioDeMailAltaUsuario: async (req, res) => {
			// Envía el mail con la contraseña
			const {email} = req.query;
			const {cliente} = req.session;
			const {diasNaveg, visitaCreadaEn, cliente_id: cliente_idViejo} = cliente;
			const {contrasena, mailEnviado} = await procesos.envioDeMailConContrasena({email, altaMail: true});

			// Si hubo errores con el envío del mensaje, interrumpe la función
			if (!mailEnviado) return res.json(mailEnviado);

			// Crea el usuario
			const usuario = await baseDeDatos.agregaRegistro("usuarios", {
				...{email, contrasena},
				...{diasNaveg, visitaCreadaEn},
				statusRegistro_id: mailPendValidar_id,
				versionElc,
			});

			// Actualiza 'cliente_id' en la BD 'usuarios' y en la cookie 'cliente_id'
			const cliente_id = "U" + String(usuario.id).padStart(10, "0");
			await baseDeDatos.actualizaPorId("usuarios", usuario.id, {cliente_id}); // es necesario el 'await' para session
			res.cookie("cliente_id", cliente_id, {maxAge: unDia * 30});

			// Guarda el mail en 'session'
			req.session.login = {datos: {email}};

			// Elimina el registro de visita y su session
			baseDeDatos.eliminaTodosPorCondicion("visitas", {cliente_id: cliente_idViejo});
			delete req.session.cliente;

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
				if (intentosDP <= maxIntentosCookies) res.cookie("intentosDP", intentosDP, {maxAge: unDia});
				const intentosPendsCookie = Math.max(0, maxIntentosCookies - intentosDP);

				// intentosDP - usuario
				intentosDP = datos.usuario.intentosDP + 1;
				if (intentosDP <= maxIntentosBD) baseDeDatos.actualizaPorId("usuarios", datos.usuario.id, {intentosDP});
				const intentosPendsBD = Math.max(0, maxIntentosBD - intentosDP);

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
		envioDeMailAltaContr: async (req, res) => {
			// Variables
			const {email} = req.query;
			const usuario = email ? await baseDeDatos.obtienePorCondicion("usuarios", {email}) : "";

			// Envía el mensaje con la contraseña
			const {contrasena, mailEnviado} = await procesos.envioDeMailConContrasena({email});

			// Si no hubo errores con el envío del email, actualiza la contraseña del usuario
			if (mailEnviado)
				await baseDeDatos.actualizaPorId("usuarios", usuario.id, {
					contrasena,
					fechaContrasena: new Date().toISOString(),
				});

			// Fin
			if (mailEnviado) delete req.session.olvidoContr;
			return res.json(mailEnviado);
		},
	},
	videoConsVisto: async (req, res) => {
		// Variables
		const usuario = req.session.usuario;
		const usuario_id = usuario ? usuario.id : null;

		// Si está logueado, actualiza el usuario
		if (usuario_id && !usuario.videoConsVisto) {
			baseDeDatos.actualizaPorId("usuarios", usuario_id, {videoConsVisto: true});
			req.session.usuario.videoConsVisto = true;
		}

		// Fin
		return res.json();
	},
};
