"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./CN-Procesos");

module.exports = {
	// API - Startup
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
		const aux = await BD_genericas.obtieneTodosPorCondicion("filtros_campos", {cabecera_id: filtro_id});

		// Convierte el array en objeto literal
		let opciones = {};
		aux.map((m) => (opciones[m.campo] = m.valor));

		// Fin
		return res.json(opciones);
	},
	diasDelAno: (req, res) => {
		return res.json(dias_del_ano);
	},

	// API - Filtros personalizados
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
	fpActualiza: async (req, res) => {
		// Variables
		const datos = JSON.parse(req.query.datos);
		const cabecera_id = datos.filtro_id;

		// Elimina la información guardada
		await BD_genericas.eliminaTodosPorCondicion("filtros_campos", {cabecera_id});

		// Guarda la nueva información
		for (let campo in datos) {
			// Si el campo es 'filtro_id', saltea la rutina
			if (campo == "filtro_id") continue;
			// Crea el registro
			let objeto = {cabecera_id, campo, valor: datos[campo]};
			BD_genericas.agregaRegistro("filtros_campos", objeto);
		}

		// Fin
		return res.json();
	},

	// API - Consultas
	momentoDelAno: async (req, res) => {
		// Variables
		const datos = JSON.parse(req.query.datos);

		// Obtiene los RCLVs (sin repeticiones)
		const rclvs = await procesos.momento.obtieneRCLVs(datos);

		// Obtiene los productos
		const productos = procesos.momento.obtieneProds(rclvs);

		// Fin
		return res.json(productos);
	},
	obtieneProductos: async (req, res) => {
		// Variables
		const datos = JSON.parse(req.query.datos);
		let productos = [];
		let rclvs = [];

		// Obtiene los filtros y el orden
		const filtrosProd = procesos.API.filtrosProd(datos);
		const ordenCampo = ordenes.find((n) => n.id == datos.orden_id).valor;
		const ordenAscDes = datos.asc_des == "ASC" ? -1 : 1;

		// Obtiene los productos y elimina los que tienen 'null' en el campo de orden
		for (let entidad of ["peliculas", "colecciones"])
			productos.push(
				BD_genericas.obtieneTodosPorCondicion(entidad, filtrosProd).then((n) =>
					n.map((m) => {
						return {
							id: m.id,
							entidad,
							entidadNombre: comp.obtieneDesdeEntidad.entidadNombre(entidad),
							nombre_original: m.nombre_original,
							direccion: m.direccion,
							avatar: m.avatar,
							personaje_id: m.personaje_id,
							hecho_id: m.hecho_id,
							tema_id: m.tema_id,
							// Orden
							dia_del_ano_id: m.dia_del_ano_id,
							creado_en: m.creado_en,
							ano_estreno: m.ano_estreno,
							nombre_castellano: m.nombre_castellano,
							calificacion: m.calificacion,
						};
					})
				)
			);
		productos = await Promise.all(productos).then(([a, b]) => [...a, ...b]);
		if (productos.length) productos = productos.filter((n) => n[ordenCampo] !== null);

		if (productos.length) {
			// Ordena los productos
			productos.sort((a, b) => {
				return typeof a[ordenCampo] == "string"
					? a[ordenCampo].toLowerCase() < b[ordenCampo].toLowerCase()
						? ordenAscDes
						: -ordenAscDes
					: a[ordenCampo] < b[ordenCampo]
					? ordenAscDes
					: -ordenAscDes;
			});

			// Obtiene los RCLV
			rclvs = await procesos.API.obtieneRCLVs(datos);
			// Filtra los productos por RCLV
			productos = productos.filter(
				(n) =>
					(rclvs.personajes && rclvs.personajes.includes(n.personaje_id)) ||
					(rclvs.hechos && rclvs.hechos.includes(n.hecho_id)) ||
					(rclvs.temas && rclvs.temas.includes(n.tema_id))
			);
		}

		// Fin
		return res.json(productos);
	},
	obtieneRCLVs: async (req, res) => {
		// Variables
		const datos = JSON.parse(req.query.datos);
		console.log("Datos:", datos);

		// Fin
		return res.json();
	},
};
