"use strict";
// Variables
const procesos = require("./CN-Procesos");

module.exports = {
	consultas: async (req, res) => {
		// Variables
		const tema = "consultas";
		const titulo = "Consulta de Películas";
		const usuario = req.session.usuario ? req.session.usuario : {};
		const userID = usuario ? usuario.id : null;
		const configs = await procesos.configs.cabecera(userID); // Se necesita esa función también para la API
		const configsDeCabecera = {
			propios: configs.filter((n) => userID && n.usuario_id == userID),
			predeterms: configs.filter((n) => n.usuario_id == 1),
		};
		const configsConsCampos = procesos.configs.campos();

		// Si la configuración está en la url, toma el valor y redirige para eliminarlo de la url
		const configConsUrl_id = Number(req.query.configCons_id);
		const existe = configConsUrl_id ? configs.find((n) => n.id == configConsUrl_id) : null;
		if (existe) {
			// Actualiza el usuario
			if (usuario) {
				BD_genericas.actualizaPorId("usuarios", userID, {configCons_id: configConsUrl_id});
				req.session.usuario = {...usuario, configCons_id: configConsUrl_id};
			}
			req.session.configCons_id = configConsUrl_id;

			// Redirecciona quitando los parámetros del 'url'
			const ruta = req.baseUrl + req.path;
			return res.redirect(ruta);
		}

		// Obtiene el ID de la configCons del usuario
		let configCons_id =
			usuario && usuario.configCons_id
				? usuario.configCons_id // El guardado en el usuario
				: req.session.configCons_id
				? req.session.configCons_id // El guardado en la session
				: req.cookies.configCons_id
				? req.cookies.configCons_id // El guardado en la cookie
				: null;

		if (!configCons_id || !configs.find((n) => n.id == configCons_id)) {
			configCons_id = configConsDefault_id;
			req.session.configCons_id = configConsDefault_id;
			if (userID) BD_genericas.actualizaPorId("usuarios", userID, {configCons_id});
		}

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, titulo},
			...{configCons_id, configsDeCabecera, configsConsCampos, userID},
			omitirFooter: true,
		});
	},
};
