"use strict";
// Variables
const procesos = require("./CN-Procesos");

module.exports = {
	obtiene: {
		configCabecera: async (req, res) => {
			// Variables
			const id = req.query.id
				? req.query.id
				: req.session.configCons
				? req.session.configCons.id
				: req.session.usuario
				? req.session.usuario.configCons_id
				: null;

			// Obtiene la cabecera
			const cabecera = id ? await BD_genericas.obtienePorId("consRegsCabecera", id) : {};

			// Fin
			return res.json(cabecera);
		},
		configPrefs: async (req, res) => {
			// Variables
			const {texto, cabecera_id} = req.query;
			let configCons_SC;

			// Si la lectura viene motivada por 'deshacer', elimina session y cookie
			if (texto == "deshacer") procesos.varios.eliminaSessionCookie(req, res);
			// De lo contrario, toma sus datos
			else configCons_SC = req.session.configCons ? req.session.configCons : null;

			// Obtiene las preferencias a partir de la 'cabecera_id'
			const configCons_BD = cabecera_id ? await procesos.varios.obtieneConfigCons_BD({cabecera_id}) : null;
			let prefs = configCons_SC ? {...configCons_SC, cambios: true} : configCons_BD;

			// Correcciones
			if (prefs && prefs.id) delete prefs.id;
			if (!prefs) prefs = {layout_id: layoutDefault_id};

			// Fin
			return res.json(prefs);
		},
		configsDeCabecera: async (req, res) => {
			// Variables
			const userID = req.session.usuario ? req.session.usuario.id : null;

			// Obtiene la cabecera de las configuraciones propias y las provistas por el sistema
			const configCons_cabeceras = await procesos.varios.cabeceras(userID);

			// Fin
			return res.json(configCons_cabeceras);
		},
		variables: async (req, res) => {
			// Variables
			const datos = {
				...{layoutsBD: cn_layouts, entidadesBD: cn_entidades}, // Opciones y Entidades
				...{pppOpcsArray, pppOpcsSimples, pppOpcsObj},
				...{rclvsNombre: variables.entidades.rclvsNombre},
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
			let {cabecera, prefs} = configCons;
			const {id, nombre} = cabecera;

			// Acciones si el 'ppp' es un array
			if (prefs.pppOpciones && Array.isArray(prefs.pppOpciones)) {
				const combo = prefs.pppOpciones.toString();
				const pppOpcion = pppOpcsArray.find((n) => n.combo == combo);
				if (pppOpcion) prefs.pppOpciones = pppOpcion.id;
				else delete prefs.pppOpciones;
			}

			// Quita los campos con valor 'default'
			for (let prop in prefs) if (prefs[prop] == filtrosConDefault[prop]) delete prefs[prop];

			// Acciones para edición
			if (cabecera.edicion) BD_genericas.actualizaPorId("consRegsCabecera", id, {nombre});
			// Acciones para 'nuevo' y 'actualizar campos'
			else {
				// Si se guardan cambios, se eliminan session y cookie
				procesos.varios.eliminaSessionCookie(req, res);

				// Si no es nuevo, elimina la información guardada
				if (!cabecera.nuevo) await BD_genericas.eliminaTodosPorCondicion("consRegsPrefs", {cabecera_id: id});

				// Guarda la nueva información
				for (let prop in prefs) {
					const objeto = {cabecera_id: id, campo: prop, valor: prefs[prop]};
					BD_genericas.agregaRegistro("consRegsPrefs", objeto);
				}
			}

			// Fin
			return res.json();
		},
		eliminaConfig: async (req, res) => {
			const {configCons_id: cabecera_id} = req.query;

			// Se eliminan los registros de campo de la configuración
			await BD_genericas.eliminaTodosPorCondicion("consRegsPrefs", {cabecera_id});

			// Se elimina el registro de cabecera de la configuración
			await BD_genericas.eliminaPorId("consRegsCabecera", cabecera_id);

			// Fin
			return res.json();
		},
	},
	sessionCookie: {
		guardaConfig: (req, res) => {
			// Variables
			const configCons = JSON.parse(req.query.configCons);

			// Si el 'ppp' es un array, lo convierte en un 'id'
			if (configCons.pppOpciones && Array.isArray(configCons.pppOpciones)) {
				const combo = configCons.pppOpciones.toString();
				const pppOpcion = pppOpcsArray.find((n) => n.combo == combo);
				if (pppOpcion) configCons.pppOpciones = pppOpcion.id;
				else delete configCons.pppOpciones; // si no lo encuentra, lo elimina
			}

			// Guarda la configuración
			req.session.configCons = configCons;
			res.cookie("configCons", configCons, {maxAge: unDia});

			// Fin
			return res.json();
		},
		eliminaConfig: (req, res) => {
			procesos.varios.eliminaSessionCookie(req, res);
			return res.json();
		},
	},
	resultados: async (req, res) => {
		// Variables
		const prefs = JSON.parse(req.query.datos);
		const usuario_id = req.session.usuario ? req.session.usuario.id : null;
		const layout = cn_layouts.find((n) => n.id == prefs.layout_id);
		const cantResults = layout.cantidad;
		const {entidad, palabrasClave} = prefs;

		// Obtiene los productos, rclvs y registros ppp del usuario
		let prods = procesos.resultados.obtieneProds.comun({...prefs, layout});
		let rclvs = procesos.resultados.obtieneRclvs.consolidado({...prefs, layout});
		let pppRegistros = usuario_id
			? BD_genericas.obtieneTodosPorCondicionConInclude("pppRegistros", {usuario_id}, "detalle")
			: [];
		[prods, rclvs, pppRegistros] = await Promise.all([prods, rclvs, pppRegistros]);

		// Cruces que siempre se deben realizar
		prods = procesos.resultados.cruce.prodsConPPP({prods, pppRegistros, prefs, usuario_id, layout});

		// Acciones varias
		if (entidad == "productos") {
			prods = procesos.resultados.cruce.prodsConRCLVs({prods, rclvs}); // Cruza 'prods' con 'rclvs'
			prods = procesos.resultados.cruce.prodsConPalsClave({entidad, prods, palabrasClave});
			prods = await procesos.resultados.cruce.prodsConMisCalifs({prods, usuario_id, layout});
			prods = await procesos.resultados.cruce.prodsConMisConsultas({prods, usuario_id, layout});
			prods = procesos.resultados.orden.prods({prods, layout}); // Ordena los productos
			prods = procesos.resultados.botonesListado({resultados: prods, layout, prefs});
			prods = procesos.resultados.camposNecesarios.prods({prods, layout}); // Deja sólo los campos necesarios
			return res.json(prods);
		} else {
			rclvs = procesos.resultados.cruce.rclvsConProds({rclvs, prods, palabrasClave, cantResults}); // Cruza 'rclvs' con 'prods' - Descarta los 'prods de RCLV' que no están en 'prods' y los rclvs sin productos
			rclvs = procesos.resultados.cruce.rclvsConPalsClave({rclvs, palabrasClave}); // Cruza 'rclvs' con 'palabrasClave' - Debe estar antes del cruce de 'rclvs' con 'prods'
			rclvs = procesos.resultados.orden.rclvs({rclvs, layout}); // Si quedaron vigentes algunos RCLV, los ordena
			rclvs = procesos.resultados.botonesListado({resultados: rclvs, layout, prefs});
			rclvs = procesos.resultados.camposNecesarios.rclvs(rclvs); // Deja sólo los campos necesarios
			return res.json(rclvs);
		}
	},
};
