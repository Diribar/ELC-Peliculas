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
		let userID = req.session.usuario ? req.session.usuario.id : "";
		// Información para la vista
		let filtrosPers = await (async () => {
			// Obtiene los filtros personales
			let resultado = userID
				? await BD_genericas.obtienePorCampos("filtros_cabecera", {usuario_id: userID})
				: [];
			if (!resultado) resultado = [];
			// Le agrega el filtro estándar
			if (!global.filtroEstandar) await variables.variableGlobal();
			resultado.push(global.filtroEstandar);
			// Fin
			return resultado;
		})();
		let camposConsulta = variables.camposConsulta;
		for (let campo in camposConsulta)
			if (!camposConsulta[campo].opciones) camposConsulta[campo].opciones = [];

		// Va a la vista
		res.render("CMP-0Estructura", {
			tema: "consultas",
			titulo: "Consulta de Películas",
			// Elecciones
			layoutElegido,
			opcionesElegidas,
			ordenElegido,
			// Layout y Orden
			layouts: variables.layouts,
			ordenes: variables.orden,
			// Filtros - Encabezado
			filtrosPers,
			// Filtros - Campos
			...camposConsulta,
		});
	},
};
