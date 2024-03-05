"use strict";
// Variables
const procesos = require("./CN-Procesos");

module.exports = {
	consultas: async (req, res) => {
		// Si la configuración está en la url, toma el valor y redirige para eliminarla
		const configCons = req.query;
		if (Object.keys(configCons).length) {
			procesos.configs.configCons_url(req);
			const ruta = req.protocol + "://" + req.headers.host + req.baseUrl;
			return res.redirect(ruta);
		}

		// Variables
		const tema = "consultas";
		const titulo = "Consulta de Películas";
		const usuario = req.session.usuario ? req.session.usuario : {};
		const userID = usuario ? usuario.id : null;

		// Configuraciones de consulta
		const configsConsCabs = await procesos.configs.cabeceras(userID); // Se necesita esa función también para la API
		const configsCons = {
			cabeceras: {
				propios: configsConsCabs.filter((n) => userID && n.usuario_id == userID),
				predeterms: configsConsCabs.filter((n) => n.usuario_id == 1),
			},
			filtros: procesos.configs.filtros(),
		};

		// Variables para la vista
		const ayudas = procesos.configs.ayudas();

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, titulo, userID},
			...{configsCons, ayudas}, // no lleva datos de la configuración actual
			omitirFooter: true,
		});
	},
};

