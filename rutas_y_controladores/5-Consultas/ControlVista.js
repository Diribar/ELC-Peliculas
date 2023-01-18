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
			if (!global.filtroEstandar) await variables.global();
			resultado.push(global.filtroEstandar);
			// Fin
			return resultado;
		})();
		// Proceso de 'camposFiltros
		let camposFiltros = {...variables.camposFiltros}
		for (let campo in camposFiltros) {
			// Si el campo no aplica para el 'layoutElegido', lo elimina
			if (!camposFiltros[campo].siempre && !camposFiltros[campo][layoutElegido]) {
				delete camposFiltros[campo];
				continue;
			}
			// Le agrega el nombre del campo a cada bloque de información
			camposFiltros[campo].codigo = campo;
			// Le agrega las opciones de la BD, si no tiene ninguna
			if (!camposFiltros[campo].opciones) {
				let opciones = global[campo];
				camposFiltros[campo].opciones = opciones ? opciones : [];
			}
		}
		// Opciones de 'orden'
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
