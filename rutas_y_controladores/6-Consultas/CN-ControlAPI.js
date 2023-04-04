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

	obtieneProductos: async (req, res) => {
		// Variables
		const datos = JSON.parse(req.query.datos);
		console.log("Datos:", datos);
		let filtros;
		let productos = [];

		// Obtiene los filtros
		filtros = procesos.API.filtrosPorFamilia(datos);
		filtros = procesos.API.filtrosProd(filtros);
		// Obtiene el orden
		const ordenCampo = ordenes.find((n) => n.id == datos.orden_id).valor;
		const ordenAscDes = datos.asc_des == "ASC" ? -1 : 1;

		for (let entidad of ["peliculas", "colecciones"])
			productos.push(
				BD_genericas.obtieneTodosPorCampos(entidad, filtros).then((n) =>
					n.map((m) => {
						return {
							id: m.id,
							entidad,
							entidadNombre: comp.obtieneEntidadNombre(entidad),
							direccion: m.direccion,
							avatar: m.avatar,
							// Orden
							momento: m.momento,
							creado_en: m.creado_en,
							ano_estreno: m.ano_estreno,
							nombre_castellano: m.nombre_castellano,
							calificacion: m.calificacion,
						};
					})
				)
			);
		// console.log(65,colecciones.length);
		productos = await Promise.all(productos).then(([a, b]) => [...a, ...b]);

		// Los ordena
		productos.sort((a, b) => (a[ordenCampo] < b[ordenCampo] ? ordenAscDes : -ordenAscDes));

		console.log(filtros);
		console.log(productos.length, ordenCampo, ordenAscDes);
		console.log(productos[0]);
		console.log(productos[1]);

		// Obtiene los RCLV
		// !ocurrio --> los 3
		// ocurrio == perHec --> 2
		// ocurrio == pers/hecho --> 1
		// const condicsRCLV = procesos.API.filtrosRCLV(filtros);

		// Fin
		return res.json(productos);
	},
	obtieneRCLVs: async (req, res) => {
		// Variables
		const datos = JSON.parse(req.query.datos);
		console.log("RCLVs:", datos);

		// Fin
		return res.json();
	},
};
