"use strict";
// Variables
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./CN-Procesos");

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
		let filtrosPers = await procesos.filtrosPers(userID);
		let camposFiltros = procesos.camposFiltros(layoutElegido)
		// Obtiene los 'órdenes' que corresponden al layout elegido
		let ordenes = variables.orden.filter((n) => n.siempre || n[layoutElegido]);
		// return res.send(camposFiltros)
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
			ordenes,
			// Filtros - Encabezado
			filtrosPers,
			// Filtros - Campos
			campos: camposFiltros,
		});
	},
};
