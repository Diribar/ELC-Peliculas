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
		const filtros = procesos.filtros();
		const ordenes = variables.ordenes;
		
		// Opciones elegidas
		let opcionesElegidas = {};
		// Obtiene la información de la cookie
		if (req.cookies && req.cookies.opcionesElegidas) opcionesElegidas = req.cookies.opcionesElegidas;
		// Obtiene la información de la BD
		else {
			// Opciones elegidas
			const aux =
				userID && usuario.filtro_id
					? await BD_genericas.obtieneTodosPorCampos("filtros_campos", {cabecera_id: usuario.filtro_id})
					: opcionesEstandarFiltros;
			// Convierte el array en objeto literal
			aux.map((m) => (opcionesElegidas[m.campo] = m.valor));
			opcionesElegidas.filtro_id = aux[0].cabecera_id;
		}

		// return res.send(filtros)
		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema: "consultas", titulo: "Consulta de Películas"},
			// Layout y Orden
			...{layouts, ordenes, filtros},
			// Personalizaciones
			...{opcionesElegidas, filtrosPers},
		});
	},
};
