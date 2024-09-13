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
		const usuario_id = usuario ? usuario.id : null;

		// Configuraciones de consulta
		let configsConsCabs = procesos.varios.cabeceras(usuario_id); // Se necesita esa función también para la API
		let filtros = procesos.varios.filtros();
		[configsConsCabs, filtros] = await Promise.all([configsConsCabs, filtros]);
		const configsCons = {
			cabeceras: {
				propios: configsConsCabs.filter((n) => usuario_id && n.usuario_id == usuario_id),
				predeterms: configsConsCabs.filter((n) => n.usuario_id == 1),
			},
			filtros,
		};

		// Variables para la vista
		const ayudas = procesos.varios.ayudas(usuario_id);

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, usuario_id},
			...{configsCons, ayudas}, // no lleva datos de la configuración actual
			omitirFooter: true,
		});
	},
};
