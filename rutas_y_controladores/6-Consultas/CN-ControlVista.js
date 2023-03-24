"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./CN-Procesos");

module.exports = {
	consultas: async (req, res) => {
		// Variables
		const usuario = req.session.usuario ? req.session.usuario : {};
		const userID = req.session.usuario ? usuario.id : "";
		const filtrosPers = await procesos.filtrosPers(userID);
		const layouts = variables.layouts;
		const ordenes = variables.ordenes;
		const filtros = procesos.filtros();
		let opcionesElegidas = {};

		// Filtro elegido
		const filtro_id =
			userID && usuario.filtro_id ? usuario.filtro_id : req.cookies && req.cookies.filtro_id ? req.cookies.filtro_id : 1;

		// Opciones elegidas
		// Obtiene la información de la BD
		const aux =
			filtro_id == 1
				? opcionesEstandarFiltros
				: await BD_genericas.obtieneTodosPorCampos("filtros_campos", {cabecera_id: filtro_id});
		// Convierte el array en objeto literal
		aux.map((m) => (opcionesElegidas[m.campo] = m.valor));

		// return res.send(filtros)
		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema: "consultas", titulo: "Consulta de Películas"},
			// Layout y Orden
			...{layouts, ordenes, filtros},
			// Personalizaciones
			...{filtro_id, opcionesElegidas, filtrosPers},
		});
	},
};
