"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/1-Procesos/Variables");
const procesos = require("./CN-Procesos");

module.exports = {
	consultas: async (req, res) => {
		// Variables
		const tema = "consultas";
		const titulo = "Consulta de Películas";
		const usuario = req.session.usuario ? req.session.usuario : {};
		const userID = req.session.usuario ? usuario.id : null;
		const configs = await procesos.configs.cabecera(userID); // Se necesita esa función también para la API
		const configsDeCabecera = {
			propios: configs.filter((n) => userID && n.usuario_id == userID),
			predeterms: configs.filter((n) => n.usuario_id == 1),
		};
		const configsConsCampos = procesos.configs.campos();

		// Obtiene el ID de la configCons del usuario
		const configConsUrl_id = Number(req.query.configCons_id);
		const configConsUrl = configConsUrl_id ? await BD_genericas.obtienePorId("configsCons", configConsUrl_id) : "";

		const configCons_id = configConsUrl
			? configConsUrl.id
			: userID && usuario.configCons_id
			? usuario.configCons_id // El guardado en el usuario
			: 2; // El 'default' es "Por fecha del año"

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, titulo},
			...{configCons_id, configsDeCabecera, configsConsCampos, userID},
			omitirFooter: true,
		});
	},
};
