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
		const filtrosDeCabecera = await procesos.filtrosDeCabecera(userID);
		const filtrosPorCampo = procesos.filtrosPorCampo();
		let prefsDeCampo = {};

		// Obtiene el ID del filtro personal elegido
		const configActual_id =
			userID && usuario.configActual_id
				? usuario.configActual_id
				: req.cookies && req.cookies.configActual_id
				? req.cookies.configActual_id
				: 1;

		// Obtiene las preferencias personales
		const registros = await BD_genericas.obtieneTodosPorCondicion("filtrosPorCampo", {cabecera_id: configActual_id});
		registros.map((m) => (prefsDeCampo[m.campo] = m.valor));

		// Va a la vista
		// return res.send(filtrosPorCampo)
		return res.render("CMP-0Estructura", {
			...{tema, titulo},
			...{configActual_id, prefsDeCampo, filtrosDeCabecera, filtrosPorCampo},
		});
	},
};
