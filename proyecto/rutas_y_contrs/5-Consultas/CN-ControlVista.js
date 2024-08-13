"use strict";
// Variables
const procesos = require("./CN-Procesos");

module.exports = {
	consultas: async (req, res) => {
		// Variables
		const tema = "consultas";
		const codigo = "tableroControl";
		const titulo = "Consulta de Películas";
		const usuario = req.session.usuario ? req.session.usuario : {};
		const userId = usuario ? usuario.id : null;

		// Configuraciones de consulta
		const configsConsCabs = await procesos.varios.cabeceras(userId); // Se necesita esa función también para la API
		const configsCons = {
			cabeceras: {
				propios: configsConsCabs.filter((n) => userId && n.usuario_id == userId),
				predeterms: configsConsCabs.filter((n) => n.usuario_id == 1),
			},
			filtros: await procesos.varios.filtros(),
		};

		// Variables para la vista
		const ayudas = procesos.varios.ayudas(userId);

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, userId},
			...{configsCons, ayudas}, // no lleva datos de la configuración actual
			omitirFooter: true,
		});
	},
};
