"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./CN-Procesos");

module.exports = {
	consultas: async (req, res) => {
		// Obtiene las últimas opciones elegidas. Primero de session/cookie, luego del usuario
		const usuario = req.session.usuario ? req.session.usuario : {};
		const userID = req.session.usuario ? usuario.id : "";
		let opcionesElegidas = {};
		let filtro_id;

		// Opciones elegidas
		// Obtiene la información de la cookie
		if (req.cookies && req.cookies.opcionesElegidas) opcionesElegidas = req.cookies.opcionesElegidas;
		else {
			// Obtiene la información de la BD
			let aux =
				userID && usuario.filtro_id
					? await BD_genericas.obtieneTodosPorCampos("filtros_campos", {cabecera_id: usuario.filtro_id})
					: filtroEstandar_campos;

			// Convierte el array en objeto literal
			aux.map((m) => (opcionesElegidas[m.campo] = m.valor));
			opcionesElegidas.filtro_id = aux[0].cabecera_id;
			console.log(19, opcionesElegidas);
		}

		// Variables
		const layoutElegido = req.params.layoutElegido ? req.params.layoutElegido : opcionesElegidas.layoutElegido;
		if (!layoutElegido) return res.redirect("/consultas/listado");

		// Más variables
		const filtrosPersUsuario = await procesos.filtrosPersUsuario(userID);
		const layouts = variables.layouts;
		const filtrosPorLayout = procesos.filtrosPorLayout(layoutElegido);
		const ordenesPorLayout = variables.orden.filter((n) => n.siempre || n[layoutElegido]);

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
