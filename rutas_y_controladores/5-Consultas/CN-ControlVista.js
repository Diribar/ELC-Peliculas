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
		const userID = req.session.usuario ? usuario.id : "";
		const filtrosPers = await procesos.filtrosPers(userID);
		const filtros = procesos.filtros();
		let opcionesElegidas = {};

		// Filtro elegido
		const filtroPers_id =
			userID && usuario.filtroPers_id ? usuario.filtroPers_id : req.cookies && req.cookies.filtroPers_id ? req.cookies.filtroPers_id : 1;

		// Opciones elegidas
		// Obtiene la información de la BD
		const aux =
			filtroPers_id == 1
				? filtroEstandarCampos
				: await BD_genericas.obtieneTodosPorCondicion("filtrosCampos", {cabecera_id: filtroPers_id});
		// Convierte el array en objeto literal
		aux.map((m) => (opcionesElegidas[m.campo] = m.valor));

		// Va a la vista
		// return res.send(filtros)
		return res.render("CMP-0Estructura", {
			...{tema, titulo},
			...{filtroPers_id, opcionesElegidas, filtrosPers, filtros},
		});
	},
};
