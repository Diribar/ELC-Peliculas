"use strict";
// Variables
const procesos = require("./CN-Procesos");

module.exports = {
	obtiene: {
		configCabecera: async (req, res) => {
			// Variables
			const {configCons_id} = req.query;

			// Obtiene la cabecera
			const configCabecera = await BD_genericas.obtienePorId("consRegsCabecera", configCons_id);

			// Fin
			return res.json(configCabecera);
		},
		configPrefs: async (req, res) => {
			// Variables
			const {texto, configCons_id: cabecera_id} = req.query;
			let configCons_SC;

			// Si la lectura viene motivada por 'deshacer', elimina session y cookie
			if (texto == "deshacer") {
				delete req.session.prefsCons;
				res.clearCookie("prefsCons");
			}
			// De lo contrario, toma sus datos
			else
				configCons_SC = req.session.prefsCons
					? req.session.prefsCons
					: req.cookies.prefsCons
					? req.cookies.prefsCons
					: null;

			// Obtiene las preferencias
			const configCons_BD = await procesos.configs.obtieneConfigCons_BD({cabecera_id});
			const configCons = configCons_SC ? {...configCons_SC, cambios: true} : configCons_BD;

			// Fin
			return res.json(configCons);
		},
		configsDeCabecera: async (req, res) => {
			// Variables
			const userID = req.session.usuario ? req.session.usuario.id : null;

			// Obtiene las opciones de configuracion
			const configCons_cabeceras = await procesos.configs.cabecera(userID);

			// Fin
			return res.json(configCons_cabeceras);
		},
		variables: async (req, res) => {
			// Variables
			const datos = {
				...{layoutsBD: cn_layouts, entidadesBD: cn_entidades}, // Opciones y Entidades
				...{pppOpcsArray, pppOpcsSimples, pppOpcsObj},
				...{rclvsNombre: variables.entidades.rclvsNombre, configConsDefault_id},
				...{filtrosConDefault, epocasEstreno, unDia},
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
		actualizaEnUsuarioConfigCons_id: (req, res) => {
			// Variables
			const {configCons_id} = req.query;
			const userID = req.session && req.session.usuario ? req.session.usuario.id : null;

			// Si está logueado, actualiza el usuario en la BD
			if (userID) {
				BD_genericas.actualizaPorId("usuarios", userID, {configCons_id});
				req.session.usuario = {...req.session.usuario, configCons_id};
			}

			// Si se cambia de configuración, se eliminan session y cookie
			delete req.session.prefsCons;
			res.clearCookie("prefsCons");

			// Fin
			return res.json();
		},
		creaConfig: async (req, res) => {
			// Variables
			const configCons = JSON.parse(req.query.configCons);
			const usuario_id = req.session.usuario.id;

			// Guarda el registro de cabecera
			const objeto = {usuario_id, nombre: configCons.nombre};
			const {id} = await BD_genericas.agregaRegistro("consRegsCabecera", objeto);

			// Fin
			return res.json(id);
		},
		guardaConfig: async (req, res) => {
			// Variables
			const configCons = JSON.parse(req.query.configCons);
			const {id} = configCons;
			delete configCons.id;

			// Acciones si el 'ppp' es un array
			if (configCons.pppOpciones && Array.isArray(configCons.pppOpciones)) {
				const combo = configCons.pppOpciones.toString();
				const pppOpcion = pppOpcsArray.find((n) => n.combo == combo);
				if (pppOpcion) configCons.pppOpciones = pppOpcion.id;
				else delete configCons.pppOpciones;
			}

			// Quita los campos con valor 'default'
			for (let prop in configCons) if (configCons[prop] == filtrosConDefault[prop]) delete configCons[prop];

			// Acciones para edición
			if (configCons.edicion) BD_genericas.actualizaPorId("consRegsCabecera", id, {nombre: configCons.nombre});
			// Acciones para 'nuevo' y 'actualizar campos'
			else {
				// Si se guardan cambios, se eliminan session y cookie
				delete req.session.prefsCons;
				res.clearCookie("prefsCons");

				// Si no es nuevo, elimina la información guardada
				if (!configCons.nuevo) await BD_genericas.eliminaTodosPorCondicion("consRegsPrefs", {cabecera_id: id});

				// Guarda la nueva información
				for (let prop in configCons) {
					const objeto = {cabecera_id: id, campo: prop, valor: configCons[prop]};
					BD_genericas.agregaRegistro("consRegsPrefs", objeto);
				}
			}

			// Fin
			return res.json();
		},
		eliminaConfigCons: async (req, res) => {
			const {configCons_id: cabecera_id} = req.query;

			// Se eliminan los registros de campo de la configuración
			await BD_genericas.eliminaTodosPorCondicion("consRegsPrefs", {cabecera_id});

			// Se elimina el registro de cabecera de la configuración
			await BD_genericas.eliminaPorId("consRegsCabecera", cabecera_id);

			// Fin
			return res.json();
		},
	},
	miscelaneas: {
		guardaPrefsEnSessionCookie: (req, res) => {
			// Variables
			const prefsCons = JSON.parse(req.query.prefsCons);

			// Si el 'ppp' es un array, lo convierte en un 'id'
			if (prefsCons.pppOpciones && Array.isArray(prefsCons.pppOpciones)) {
				const combo = prefsCons.pppOpciones.toString();
				const pppOpcion = pppOpcsArray.find((n) => n.combo == combo);
				if (pppOpcion) prefsCons.pppOpciones = pppOpcion.id;
				else delete prefsCons.pppOpciones; // si no lo encuentra, lo elimina
			}

			// Guarda la configuración
			req.session.prefsCons = prefsCons;
			res.cookie("prefsCons", prefsCons, {maxAge: unDia});

			// Fin
			return res.json();
		},
	},
	resultados: async (req, res) => {
		// Variables
		const configCons = JSON.parse(req.query.datos);
		const usuario_id = req.session.usuario ? req.session.usuario.id : null;
		const layout = cn_layouts.find((n) => n.id == configCons.opcion_id);
		const cantResults = layout.cantidad;
		const {entidad, palabrasClave} = configCons;

		// Obtiene los productos, rclvs y registros ppp del usuario
		let prods = procesos.resultados.obtieneProds.comun({...configCons, layout});
		let rclvs = procesos.resultados.obtieneRclvs.consolidado({...configCons, layout});
		let pppRegistros = usuario_id
			? BD_genericas.obtieneTodosPorCondicionConInclude("pppRegistros", {usuario_id}, "detalle")
			: [];
		[prods, rclvs, pppRegistros] = await Promise.all([prods, rclvs, pppRegistros]);

		// Cruces que siempre se deben realizar
		prods = procesos.resultados.cruce.prodsConPPP({prods, pppRegistros, configCons, usuario_id, layout});

		// Acciones varias
		if (entidad == "productos") {
			prods = procesos.resultados.cruce.prodsConRCLVs({prods, rclvs}); // Cruza 'prods' con 'rclvs'
			prods = procesos.resultados.cruce.prodsConPalsClave({entidad, prods, palabrasClave});
			prods = await procesos.resultados.cruce.prodsConMisCalifs({prods, usuario_id, layout});
			prods = await procesos.resultados.cruce.prodsConMisConsultas({prods, usuario_id, layout});
			prods = procesos.resultados.orden.prods({prods, layout}); // Ordena los productos
			prods = procesos.resultados.botonesListado({resultados: prods, layout, configCons});
			prods = procesos.resultados.camposNecesarios.prods({prods, layout}); // Deja sólo los campos necesarios
			return res.json(prods);
		} else {
			rclvs = procesos.resultados.cruce.rclvsConProds({rclvs, prods, palabrasClave, cantResults}); // Cruza 'rclvs' con 'prods' - Descarta los 'prods de RCLV' que no están en 'prods' y los rclvs sin productos
			rclvs = procesos.resultados.cruce.rclvsConPalsClave({rclvs, palabrasClave}); // Cruza 'rclvs' con 'palabrasClave' - Debe estar antes del cruce de 'rclvs' con 'prods'
			rclvs = procesos.resultados.orden.rclvs({rclvs, layout, entidad}); // Si quedaron vigentes algunos RCLV, los ordena
			rclvs = procesos.resultados.botonesListado({resultados: rclvs, layout, configCons});
			rclvs = procesos.resultados.camposNecesarios.rclvs({rclvs, layout}); // Deja sólo los campos necesarios
			return res.json(rclvs);
		}
	},
};
