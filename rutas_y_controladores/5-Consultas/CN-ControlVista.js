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
		const configsDeCabecera = await procesos.configs.cabecera(userID);
		const configs = {
			propios: configsDeCabecera.filter((n) => userID && n.usuario_id == userID),
			predeterms: configsDeCabecera.filter((n) => n.usuario_id == 1),
		};
		const configsConsCampos = procesos.configs.campos();
		let prefsDeCampo = {};

		// Obtiene el ID del filtro personal elegido
		const configCons_id = userID && usuario.configCons_id ? usuario.configCons_id : 1;

		// Obtiene las preferencias personales
		const registros = await BD_genericas.obtieneTodosPorCondicion("configsConsCampos", {configCons_id});
		registros.map((m) => (prefsDeCampo[m.campo] = m.valor));

		// Va a la vista
		// return res.send(configsConsCampos)
		return res.render("CMP-0Estructura", {
			...{tema, titulo},
			...{configCons_id, prefsDeCampo, configs, configsConsCampos, userID},
		});
	},
};
