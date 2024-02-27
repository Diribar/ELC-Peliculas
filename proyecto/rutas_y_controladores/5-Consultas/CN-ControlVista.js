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
		const configsConsCabs = await procesos.configs.cabecera(userID); // Se necesita esa función también para la API
		const configCons_cabeceras = {
			propios: configsConsCabs.filter((n) => userID && n.usuario_id == userID),
			predeterms: configsConsCabs.filter((n) => n.usuario_id == 1),
		};
		const configCons_campos = procesos.configs.campos();

		// Obtiene la cabecera_id
		const cabecera_id = await procesos.configs.obtieneConfigCons_BD({usuario}).then((n) => n.cabecera_id);

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, titulo, userID, cabecera_id},
			...{configCons_cabeceras, configCons_campos},
			omitirFooter: true,
		});
	},
};

let configCons_url = (req) => {
	// Si la configuración está en la url, toma el valor y redirige para eliminarlo de la url
	const configCons = Number(req.query.prefsCons);
	const existe = configConsUrl_id ? configs.find((n) => n.id == configCons.id) : null;
	if (existe) {
		// Actualiza el usuario
		if (usuario) {
			BD_genericas.actualizaPorId("usuarios", userID, {configCons_id: configCons.id});
			req.session.usuario = {...usuario, configCons_id};
		}

		// Redirecciona quitando los parámetros del 'url'
		const ruta = req.baseUrl + req.path;
		return res.redirect(ruta);
	}
};
