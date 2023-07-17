"use strict";
// Variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
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
	resultados: {
		prods: async (req, res) => {
			// Variables
			const {dia, mes, configCons} = JSON.parse(req.query.datos);
			const usuario_id = req.session.usuario ? req.session.usuario.id : null;
			const orden = cn_ordenes.find((n) => n.id == configCons.orden_id);

			// Obtiene los registros de productos, rclvs y ppp
			let prods = procesos.resultados.prods({configCons});
			let rclvs = configCons.orden_id == 1 ? procesos.resultados.momentoDelAno({dia, mes}) : null; // Si el usuario no eligió 'Momento del Año'
			let pppRegistros = procesos.resultados.pppRegistros({usuario_id, configCons});

			// Espera hasta completar las lecturas
			[prods, rclvs, pppRegistros] = await Promise.all([prods, rclvs, pppRegistros]);

			// Cruza 'prods' con 'pppRegistros'
			if (prods.length && usuario_id) prods = procesos.resultados.cruceProdsConPPP({prods, pppRegistros, configCons});

			// Cruza 'prods' con 'rclvs'
			if (prods.length && rclvs) {
				// Si no hay RCLVs, reduce a cero los productos
				if (!rclvs.length) prods = [];
				else {
					// Crea la variable consolidadora
					let prodsCruzadosConRCLVs = [];
					// Para cada RCLV, busca los productos
					for (let rclv of rclvs) {
						// Obtiene el campo a buscar
						const campo_id = comp.obtieneDesdeEntidad.campo_id(rclv.entidad);
						// Detecta los hallazgos
						const hallazgos = prods.filter((n) => n[campo_id] == rclv.id);
						// Si hay hallazgos, los agrega al consolidador
						if (hallazgos.length) prodsCruzadosConRCLVs.push(...hallazgos);
						// Si hay hallazgos, los elimina de prods
						if (hallazgos.length) prods = prods.filter((n) => n[campo_id] != rclv.id);
					}
					//
					prods = [...prodsCruzadosConRCLVs];
				}
			}

			// Ordena los productos
			if (prods.length && configCons.orden_id != 1)
				prods.sort((a, b) =>
					configCons.ascDes == "ASC" ? a[orden.valor] - b[orden.valor] : b[orden.valor] - a[orden.valor]
				);

			// Deja sólo los campos necesarios
			if (prods.length)
				prods = prods.map((n) => {
					// Datos
					let {entidad, id, nombreCastellano, calificacion, pppIcono, pppNombre, direccion, anoEstreno, avatar} = n;
					if (direccion && direccion.indexOf(",") > 0) direccion = direccion.slice(0, direccion.indexOf(","));
					let datos = {
						...{entidad, id, nombreCastellano, calificacion, pppIcono, pppNombre, direccion, anoEstreno, avatar},
						...{entidadNombre: comp.obtieneDesdeEntidad.entidadNombre(entidad)},
					};
					if (n.entidad == "colecciones") datos.anoFin = n.anoFin;

					// Fin
					return datos;
				});

			// Fin
			return res.json(prods);
		},
		rclvs: async (req, res) => {
			// Variables
			const {entidad, configCons} = JSON.parse(req.query.datos);
			const usuario_id = req.session.usuario ? req.session.usuario.id : null;
			const orden = cn_ordenes.find((n) => n.id == configCons.orden_id);

			// Obtiene los productos y rlcvs
			let configProd = {...configCons};
			delete configProd.apMar, configProd.rolesIgl, configProd.canons;
			let prods = procesos.resultados.prods({entidad, configCons: configProd});
			let rclvs = procesos.resultados.rclvs({entidad, configCons: configProd});
			let pppRegistros = procesos.resultados.pppRegistros({usuario_id, configCons});

			// Espera hasta completar las lecturas
			[prods, rclvs, pppRegistros] = await Promise.all([prods, rclvs, pppRegistros]);

			// Cruza 'prods' con 'pppRegistros'
			if (prods.length && usuario_id) prods = procesos.resultados.cruceProdsConPPP({prods, pppRegistros, configCons});

			// Cruza 'rclvs' con 'prods' - Elimina los 'prods include' de RCLV que no están en 'prods'
			if (prods.length && rclvs.length) {
				// Rutina por RCLV
				for (let i = rclvs.length - 1; i >= 0; i--) {
					let rclv = rclvs[i];
					rclvs[i].consolidado = [];
					// Rutina por entProd de cada RCLV
					for (let entProd of variables.entidades.prods) {
						let prodsRCLV_entProd = rclv[entProd];
						// Rutina por productos de cada entProd
						for (let j = prodsRCLV_entProd.length - 1; j >= 0; j--) {
							// Rutina por producto
							const prodRCLV = prodsRCLV_entProd[j];
							const existe = prods.find((n) => n.entidad == entProd && n.id == prodRCLV.id);
							if (!existe) rclvs[i][entProd].splice(j, 1);
						}
						// Agrupa los productos en el array 'consolidado' y elimina el 'campo_id'
						rclvs[i].consolidado.push(...rclvs[i][entProd]);
						delete rclvs[i][entProd];
					}
					// Si el rclv no tiene productos, lo elimina
					if (!rclvs[i].consolidado.length) rclvs.splice(i, 1);
					else rclvs[i].consolidado.sort((a, b) => (a.anoEstreno > b.anoEstreno ? -1 : 1));
				}
			} else rclvs = [];

			// Ordena los RCLV
			console.log(229, orden.valor, configCons.ascDes);
			if (rclvs.length && configCons.orden_id != 8) {
				configCons.ascDes == "ASC"
					? rclvs.sort((a, b) => (a[orden.valor] < b[orden.valor] ? -1 : 1))
					: rclvs.sort((a, b) => (a[orden.valor] > b[orden.valor] ? -1 : 1));
			} else {
			}
			rclvs.sort((a, b) => (a.rolIglesia.orden < b.rolIglesia.orden ? -1 : 1));

			// Fin
			return res.json(rclvs);
		},
	},
};
