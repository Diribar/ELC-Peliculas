"use strict";
// Variables
const procesos = require("./CN-Procesos");

module.exports = {
	obtiene: {
		configCabecera: async (req, res) => {
			// Variables
			const {configCons_id} = req.query;

			// Obtiene la cabecera
			const configCabecera = await BD_genericas.obtienePorId("configsCons", configCons_id);

			// Fin
			return res.json(configCabecera);
		},
		configCampos: async (req, res) => {
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
		variables: async (req, res) => {
			// Variables
			const datos = {
				...{entidadesBD: cn_entidades, ordenesPorEntsBD: cn_ordenesPorEnts, ordenesBD: cn_ordenes}, // Órdenes y Entidades
				...{pppOpciones, pppOpcionesSimples},
				...{rclvNombres: variables.entidades.rclvsNombre, configConsDefault_id},
				filtrosConDefault,
			};

			// Datos del usuario
			if (req.session.usuario && req.session.usuario.id) {
				datos.userID = req.session.usuario.id;
				datos.videoConsVisto = req.session.usuario.videoConsVisto;
				datos.usuarioTienePPP = await BD_genericas.obtieneTodosPorCondicion("pppRegistros", {
					usuario_id: datos.userID,
				}).then((n) => n.length);
			}

			// Fin
			return res.json(datos);
		},
	},
	cambiosEnBD: {
		configCons_id: (req, res) => {
			// Variables
			const configCons_id = req.query.configCons_id;
			const userID = req.session && req.session.usuario ? req.session.usuario.id : null;

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
			delete configCons.id;

			// Acciones si el 'ppp' es un array
			if (configCons.pppOpciones && Array.isArray(configCons.pppOpciones))
				configCons.pppOpciones.toString() == noLaVi.combo // se fija si el array es el del combo de 'noLaVi'
					? (configCons.pppOpciones = noLaVi.id) // le asigna el id de 'noLaVi'
					: delete configCons.pppOpciones; // elimina el ppp del combo

			// Quita los campos con valor 'default'
			for (let campo in configCons) if (configCons[campo] == filtrosConDefault[campo]) delete configCons[campo];

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
		const ordenPorEnt = cn_ordenesPorEnts.find((n) => n.id == configCons.ordenPorEnt_id);
		const orden = cn_ordenes.find((n) => n.id == ordenPorEnt.orden_id);
		const {palabrasClave} = configCons;
		for (let campo in configCons) if (configCons[campo] == "sinFiltro") delete configCons[campo];
		console.log(143,configCons);

		// Obtiene los registros de productos
		let prods = procesos.resultados.prods({entidad, orden, configCons});

		// Obtiene los registros de rclvs
		let rclvs =
			entidad == "productos"
				? orden.codigo == "fechaDelAno_id"
					? procesos.resultados.prodsDiaDelAno_id({dia, mes})
					: null // Si el usuario no eligió 'Momento del Año'
				: procesos.resultados.rclvs({entidad, configCons, orden});

		// Obtiene los registros ppp del usuario
		let pppRegistros = usuario_id
			? BD_genericas.obtieneTodosPorCondicionConInclude("pppRegistros", {usuario_id}, "detalle")
			: [];

		// Espera hasta completar las lecturas
		[prods, rclvs, pppRegistros] = await Promise.all([prods, rclvs, pppRegistros]);

		// Cruza 'prods' con 'pppRegistros' y con 'palabrasClave'
		prods = procesos.resultados.cruce.prodsConPPP({prods, pppRegistros, configCons, usuario_id, orden});
		prods = procesos.resultados.cruce.prodsConPalsClave({prods, palabrasClave, entidad});

		// Acciones varias
		if (entidad == "productos") {
			prods = procesos.resultados.cruce.prodsConRCLVs({prods, rclvs}); // Cruza 'prods' con 'rclvs'
			prods = procesos.resultados.orden.prods({prods, orden, configCons}); // Ordena los productos
			prods = procesos.resultados.camposNecesarios.prods(prods, orden); // Deja sólo los campos necesarios
			return res.json(prods);
		} else {
			rclvs = procesos.resultados.cruce.rclvsConPalsClave({rclvs, palabrasClave}); // Cruza 'rclvs' con 'palabrasClave' - Debe estar antes del cruce de 'rclvs' con 'prods'
			rclvs = procesos.resultados.cruce.rclvsConProds({rclvs, prods, palabrasClave}); // Cruza 'rclvs' con 'prods' - Descarta los 'prods de RCLV' que no están en 'prods' y los rclvs sin productos
			rclvs = procesos.resultados.orden.rclvs({rclvs, orden, configCons, entidad}); // Si quedaron vigentes algunos RCLV, los ordena
			rclvs = procesos.resultados.camposNecesarios.rclvs({rclvs, orden, entidad}); // Deja sólo los campos necesarios
			return res.json(rclvs);
		}
	},
};
