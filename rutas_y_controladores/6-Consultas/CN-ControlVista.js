"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./CN-Procesos");

module.exports = {
	consultasSinLayout: (req, res) => {
		delete req.session.opcionesElegidas;
		res.redirect("./consultas/listado");
	},
	consultasConLayout: async (req, res) => {
		// Variables
		const layoutElegido = req.path.replace("/", "");
		const usuario = req.session.usuario ? req.session.usuario : {};
		const userID = req.session.usuario ? usuario.id : "";

		// Información para la vista
		const filtrosPersUsuario = await procesos.filtrosPersUsuario(userID);
		const layouts = variables.layouts;
		const filtrosPorLayout = procesos.filtrosPorLayout(layoutElegido);
		const ordenesPorLayout = variables.orden.filter((n) => n.siempre || n[layoutElegido]);

		// Obtiene las últimas opciones elegidas. Primero de session/cookie, luego del usuario
		const opcionesElegidas = req.session.opcionesElegidas
			? req.session.opcionesElegidas
			: req.cookies && req.cookies.opcionesElegidas
			? req.cookies.opcionesElegidas
			: userID && usuario.filtro_id
			? await BD_genericas.obtieneTodosPorCampos("filtros_campos", {cabecera_id: usuario.filtro_id})
			: filtroEstandar_campos;

		// ID del último filtroCabecera usado. Ninguno si en cookies hay opciones elegidas y no hay ID
		const filtro_id = req.cookies && req.cookies.opcionesElegidas ? req.cookies.filtro_id : opcionesElegidas[0].cabecera_id;

		// return res.send(filtrosPorLayout)
		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema: "consultas", titulo: "Consulta de Películas"},
			// Elecciones
			...{layoutElegido, filtro_id, opcionesElegidas},
			// Layout y Orden
			...{layouts, ordenesPorLayout, filtrosPorLayout},
			// Filtros personalizados del usuario
			...{filtrosPersUsuario},
		});
	},
};
