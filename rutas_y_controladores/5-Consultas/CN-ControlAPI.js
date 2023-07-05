"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const procesos = require("./CN-Procesos");

module.exports = {
	// Startup
	obtiene: {
		prefsDeCabecera: async (req, res) => {
			// Condiciones - los predeterminados más los del usuario
			let condiciones = {usuario_id: [usuario_id, null]};

			// Obtiene las cabeceras
			const cabeceras = await BD_genericas.obtieneTodosPorCondicion("filtrosCabecera", condiciones);

			// Fin
			return res.json(cabeceras);
		},
		prefsDeCampos: async (req, res) => {
			// Variables
			const {configActual_id} = req.query;
			let preferencias = {};

			// Obtiene las preferencias
			const registros = await BD_genericas.obtieneTodosPorCondicion("filtrosPorCampo", {cabecera_id: configActual_id});

			// Convierte el array en objeto literal
			for (let registro of registros) preferencias[registro.campo] = registro.valor;

			// Fin
			return res.json(preferencias);
		},
		layoutsMasOrdenes: async (req, res) => {
			return res.json({cn_layouts, opcionesOrdenBD: cn_ordenes});
		},
		diasDelAno: (req, res) => {
			return res.json(diasDelAno);
		},
	},

	// Filtros personalizados
	guarda: {
		configNueva: async (req, res) => {
			// Variables
			const configuracion = JSON.parse(req.query.configuracion);
			const usuario_id = req.session.usuario.id;

			// Guarda el registro de cabecera
			const objeto = {usuario_id, nombre: configuracion.nombre};
			const {id: cabecera_id} = await BD_genericas.agregaRegistro("filtrosCabecera", objeto);

			// Guarda los registros de las preferencias
			for (let campo in configuracion) {
				if (campo == "nombre") continue; // Si el campo es 'nombre', saltea la rutina

				// Crea el registro
				const objeto = {cabecera_id, campo, valor: configuracion[campo]};
				BD_genericas.agregaRegistro("filtrosPorCampo", objeto);
			}

			// Fin
			return res.json();
		},
	},
	actualiza: {
		configActual_id: (req, res) => {
			// Variables
			const configActual_id = req.query.configActual_id;
			const userID = req.session && req.session.usuario ? req.session.usuario.id : null;

			// Guarda cookie
			res.cookie("configActual_id", configActual_id, {maxAge: unDia});

			// Si está logueado, actualiza session y el usuario en la BD
			if (userID) {
				req.session.usuario.configActual_id = configActual_id;
				BD_genericas.actualizaPorId("usuarios", userID, {configActual_id});
			}

			// Fin
			return res.json();
		},
		prefsDeCampos: async (req, res) => {
			// Variables
			const datos = JSON.parse(req.query.datos);
			const cabecera_id = datos.configActual_id;

			// Elimina la información guardada
			await BD_genericas.eliminaTodosPorCondicion("filtrosPorCampo", {cabecera_id});

			// Guarda la nueva información
			for (let campo in datos) {
				// Si el campo es 'configActual_id', saltea la rutina
				if (campo == "configActual_id") continue;
				// Crea el registro
				let objeto = {cabecera_id, campo, valor: datos[campo]};
				BD_genericas.agregaRegistro("filtrosPorCampo", objeto);
			}

			// Fin
			return res.json();
		},
	},

	// Consultas
	resultados: {
		prods: async (req, res) => {
			// Variables
			const datos = JSON.parse(req.query.datos);
			let productos = [];
			let rclvs = [];

			// Obtiene los filtros y el orden
			const filtrosProd = procesos.API.filtrosProd(datos);
			const ordenCampo = cn_ordenes.find((n) => n.id == datos.orden_id).valor;
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
								nombreOriginal: m.nombreOriginal,
								direccion: m.direccion,
								avatar: m.avatar,
								personaje_id: m.personaje_id,
								hecho_id: m.hecho_id,
								tema_id: m.tema_id,
								// Orden
								diaDelAno_id: m.diaDelAno_id,
								creadoEn: m.creadoEn,
								anoEstreno: m.anoEstreno,
								nombreCastellano: m.nombreCastellano,
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
		rclvs: async (req, res) => {
			// Variables
			const datos = JSON.parse(req.query.datos);
			console.log("Datos:", datos);

			// Fin
			return res.json();
		},
	},
};

let momentoDelAno = async (req, res) => {
	// Variables
	const datos = JSON.parse(req.query.datos);

	// Obtiene los RCLVs (sin repeticiones)
	const rclvs = await procesos.momento.obtieneRCLVs(datos);

	// Obtiene los productos
	const productos = procesos.momento.obtieneProds(rclvs);

	// Fin
	return res.json(productos);
};
