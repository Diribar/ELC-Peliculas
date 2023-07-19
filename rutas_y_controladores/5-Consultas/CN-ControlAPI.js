"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
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
			const configsDeCabecera = await procesos.configs.cabecera(userID);

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
	resultados: async (req, res) => {
		// Variables
		const {dia, mes, configCons, entidad} = JSON.parse(req.query.datos);
		const usuario_id = req.session.usuario ? req.session.usuario.id : null;
		const orden = cn_ordenes.find((n) => n.id == configCons.orden_id);

		// Obtiene los registros de productos
		let configProd = {...configCons};
		delete configProd.apMar, configProd.rolesIgl, configProd.canons;
		let prods = !entidad // Si es "Todas las Películas"
			? procesos.resultados.prods({configCons})
			: procesos.resultados.prods({entidad, configCons: configProd});

		// Obtiene los registros de rclvs
		let rclvs = !entidad
			? orden.valor == "momento"
				? procesos.resultados.momentoDelAno({dia, mes})
				: null // Si el usuario no eligió 'Momento del Año'
			: procesos.resultados.rclvs({entidad, configCons, orden});

		// Obtiene los registros de ppp
		let pppRegistros = procesos.resultados.pppRegistros({usuario_id, configCons});

		// Espera hasta completar las lecturas
		[prods, rclvs, pppRegistros] = await Promise.all([prods, rclvs, pppRegistros]);

		// Cruza 'prods' con 'pppRegistros'
		if (prods.length && usuario_id) prods = procesos.resultados.cruce.prodsConPPP({prods, pppRegistros, configCons});

		if (!entidad) {
			prods = procesos.resultados.cruce.prodsConRCLVs({prods, rclvs}); // Cruza 'prods' con 'rclvs'
			prods = procesos.resultados.orden.prods({prods, orden, configCons}); // Ordena los productos
			prods = procesos.resultados.camposNecesarios.prods(prods); // Deja sólo los campos necesarios
			return res.json(prods);
		} else {
			rclvs = procesos.resultados.cruce.rclvsConProds({rclvs, prods}); // Cruza 'rclvs' con 'prods' - Descarta los 'prods de RCLV' que no están en 'prods' y los rclvs sin productos
			rclvs = procesos.resultados.orden.rclvs({rclvs, orden, configCons, entidad}); // Si quedaron vigentes algunos RCLV, los ordena
			rclvs = procesos.resultados.camposNecesarios.rclvs({rclvs, entidad}); // Deja sólo los campos necesarios
			return res.json(rclvs);
		}
	},
};
