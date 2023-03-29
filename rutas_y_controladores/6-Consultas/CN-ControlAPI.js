"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procesos = require("./CN-Procesos");

module.exports = {
	layoutsOrdenes: async (req, res) => {
		// Obtiene los valores
		let layouts = BD_genericas.obtieneTodos("layouts", "orden");
		let ordenes = BD_genericas.obtieneTodos("ordenes", "orden");
		[layouts, ordenes] = await Promise.all([layouts, ordenes]);

		// Fin
		return res.json({layouts, opcionesOrdenBD: ordenes});
	},
	opcionesFiltro: async (req, res) => {
		// Obtiene las opciones
		const {filtro_id} = req.query;
		const aux = await BD_genericas.obtieneTodosPorCampos("filtros_campos", {cabecera_id: filtro_id});

		// Convierte el array en objeto literal
		let opciones = {};
		aux.map((m) => (opciones[m.campo] = m.valor));

		// Fin
		return res.json(opciones);
	},

	guardaFiltro_id: (req, res) => {
		// Variables
		const filtro_id = req.query.filtro_id;
		const userID = req.session && req.session.usuario ? req.session.usuario.id : null;

		// Guarda session y cookie
		if (userID) req.session.usuario.filtro_id = filtro_id;
		res.cookie("filtro_id", filtro_id, {maxAge: unDia});

		// Actualiza el usuario
		if (userID) BD_genericas.actualizaPorId("usuarios", userID, {filtro_id});

		// Fin
		return res.json();
	},

	obtieneProductos: (req, res) => {
		// Variables
		const datos = JSON.parse(req.query.datos);
		console.log(datos);

		// Orden

		// Fin
		return res.json();
	},
};
