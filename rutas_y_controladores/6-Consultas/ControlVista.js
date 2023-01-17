"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	consultasSinLayout: (req, res) => {
		delete req.session.opcionesElegidas;
		res.redirect("./listado");
	},
	consultasConLayout: async (req, res) => {
		// Variables
		let layoutElegido = req.path.replace("/", "");
		if (!req.session.opcionesElegidas) req.session.opcionesElegidas = {};
		req.session.opcionesElegidas.layout = layoutElegido;
		let opcionesElegidas = req.session.opcionesElegidas;
		let ordenElegido = opcionesElegidas && opcionesElegidas.orden ? opcionesElegidas.orden : "";
		// Base de datos
		let userID = req.session.usuario ? req.session.usuario.id : "";
		let filtrosPers = userID
			? await BD_genericas.obtienePorCampos("filtros_cabecera", {usuario_id: userID})
			: [];
		filtrosPers.push(filtroEstandar)
		// Va a la vista
		res.render("CMP-0Estructura", {
			tema: "consultas",
			titulo: "Consulta de Películas",
			// Elecciones
			layoutElegido,
			opcionesElegidas,
			ordenElegido,
			// Bases de datos
			layouts: variables.layouts,
			ordenes: variables.orden,
			filtrosPers,
		});
	},
};
