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

		// Configuraciones de consulta
		const configsConsCabs = await procesos.configs.cabecera(userID); // Se necesita esa función también para la API
		const configsCons = {
			cabeceras: {
				propios: configsConsCabs.filter((n) => userID && n.usuario_id == userID),
				predeterms: configsConsCabs.filter((n) => n.usuario_id == 1),
			},
			prefs: procesos.configs.prefs(),
		};

		// Si la configuración está en la url, toma el valor y redirige para eliminarlo de la url
		const prefsCons = req.query;
		if (Object.keys(prefsCons).length) {
			procesos.configCons_url(req);
			const ruta = req.protocol + "://" + req.headers.host + req.baseUrl;
			return res.redirect(ruta);
		}

		// Variables para la vista
		const cabecera_id = await procesos.configs.obtieneConfigCons_BD({usuario}).then((n) => n.cabecera_id);
		const ayudas = procesos.configs.ayudas();

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, titulo, userID, cabecera_id},
			...{configsCons, ayudas},
			omitirFooter: true,
		});
	},
};

