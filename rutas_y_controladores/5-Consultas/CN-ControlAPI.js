"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const procesos = require("./CN-Procesos");

module.exports = {
	obtiene: {
		configDeCabecera: async (req, res) => {
			// Variables
			const {configCons_id} = req.query;

			// Obtiene la cabecera
			const configDeCabecera = await BD_genericas.obtienePorId("configsCons", configCons_id);

			// Fin
			return res.json(configDeCabecera);
		},
		configDeCampos: async (req, res) => {
			// Variables
			const {configCons_id} = req.query;
			let preferencias = {};

			// Obtiene las preferencias
			const registros = await BD_genericas.obtieneTodosPorCondicion("configsConsCampos", {configCons_id});

			// Convierte el array en objeto literal
			for (let registro of registros) preferencias[registro.campo] = registro.valor;

			// Fin
			return res.json(preferencias);
		},
		configsDeCabecera: async (req, res) => {
			// Variables
			const userID = req.session.usuario ? req.session.usuario.id : null;

			// Obtiene las opciones de configuracion
			const configsDeCabecera = await procesos.configsDeCabecera(userID);

			// Fin
			return res.json(configsDeCabecera);
		},
		opcionesDeLayoutMasOrden: async (req, res) => {
			// Variables
			const userID = req.session.usuario ? req.session.usuario.id : null;

			// Fin
			return res.json({layoutsBD: cn_layouts, ordenesBD: cn_ordenes, userID});
		},
	},
	cambiosEnBD: {
		configCons_id: (req, res) => {
			// Variables
			const configCons_id = req.query.configCons_id;
			const userID = req.session && req.session.usuario ? req.session.usuario.id : null;

			// Guarda cookie
			res.cookie("configCons_id", configCons_id, {maxAge: unDia});

			// Si está logueado, actualiza session y el usuario en la BD
			if (userID) {
				req.session.usuario.configCons_id = configCons_id;
				BD_genericas.actualizaPorId("usuarios", userID, {configCons_id});
			}

			// Fin
			return res.json();
		},
		creaConfig: async (req, res) => {
			// Variables
			const configCons = JSON.parse(req.query.configCons);
			const usuario_id = req.session.usuario.id;

			// Guarda el registro de cabecera
			const objeto = {usuario_id, nombre: configCons.nombre};
			const {id: configCons_id} = await BD_genericas.agregaRegistro("configsCons", objeto);

			// Fin
			return res.json(configCons_id);
		},
		guardaConfig: async (req, res) => {
			// Variables
			const configCons = JSON.parse(req.query.configCons);
			const {id} = configCons;

			// Acciones para edición
			if (configCons.edicion) BD_genericas.actualizaPorId("configsCons", id, {nombre: configCons.nombre});
			// Acciones para 'nuevo' y 'actualizar campos'
			else {
				// Elimina la información guardada
				if (!configCons.nuevo) await BD_genericas.eliminaTodosPorCondicion("configsConsCampos", {configCons_id: id});

				// Guarda la nueva información
				for (let campo in configCons) {
					const objeto = {configCons_id: id, campo, valor: configCons[campo]};
					BD_genericas.agregaRegistro("configsConsCampos", objeto);
				}
			}

			// Fin
			return res.json();
		},
		eliminaConfigCons: async (req, res) => {
			const {configCons_id} = req.query;

			// Se eliminan los registros de campo de la configuración
			await BD_genericas.eliminaTodosPorCondicion("configsConsCampos", {configCons_id});

			// Se elimina el registro de cabecera de la configuración
			await BD_genericas.eliminaPorId("configsCons", configCons_id);

			// Fin
			return res.json();
		},
	},
	resultados: {
		prods: async (req, res) => {
			// Variables
			const datos = JSON.parse(req.query.datos);
			let productos = [];
			let rclvs = [];

			// Obtiene los filtros y el orden
			const filtrosProd = procesos.API.filtrosProd(datos);
			const ordenCampo = cn_ordenes.find((n) => n.id == datos.orden_id).valor;
			const ordenAscDes = datos.ascDes == "ASC" ? -1 : 1;

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

let FN = {
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
	diasDelAno: (req, res) => {
		return res.json(diasDelAno);
	},
};
