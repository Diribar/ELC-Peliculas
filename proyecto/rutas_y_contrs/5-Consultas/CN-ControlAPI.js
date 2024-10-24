"use strict";
// Variables
const procesos = require("./CN-Procesos");
const layoutDefault_id = 2; // El 'default' es "Al azar"

module.exports = {
	obtiene: {
		cabecera: async (req, res) => {
			// Variables
			const id = req.query.id
				? req.query.id
				: req.session.configCons
				? req.session.configCons.id
				: req.session.usuario
				? req.session.usuario.configCons_id
				: null;
			const usuario_id = req.session.usuario ? req.session.usuario.id : null;
			let cabecera;

			// Obtiene la cabecera
			if (id && ["string", "number"].includes(typeof id)) {
				cabecera = await baseDeDatos.obtienePorId("consRegsCabecera", id);
				if (
					!cabecera || // no se encontró una cabecera
					(!usuario_id && cabecera.usuario_id != 1) || // el usuario no está logueado y el id no es el predeterminado
					(usuario_id && ![usuario_id, 1].includes(cabecera.usuario_id)) // el usuario está logueado y el id no es suyo ni el predeterminado
				)
					cabecera = {};
			} else cabecera = {};

			// Fin
			return res.json(cabecera);
		},
		preferencias: async (req, res) => {
			// Variables
			const {texto, cabecera_id} = req.query;
			let preferencias;

			// Si la lectura viene motivada por 'deshacer', elimina session y cookie
			if (texto == "deshacer") procesos.varios.eliminaSessionCookie(req, res);
			// De lo contrario, toma sus datos
			else {
				const prefsSession = req.session.configCons ? req.session.configCons : null;
				if (prefsSession) preferencias = {...prefsSession, cambios: true};
			}

			// Obtiene las preferencias a partir de la 'cabecera_id'
			if (!preferencias && cabecera_id) preferencias = await procesos.varios.prefs_BD({cabecera_id});

			// Correcciones
			if (!preferencias) preferencias = {layout_id: layoutDefault_id};
			else {
				// Miscelaneas
				delete preferencias.id;

				// Corrección de layout_id
				const usuario_id = req.session.usuario ? req.session.usuario.id : null;
				const {layout_id} = preferencias;
				if (!usuario_id && layout_id) {
					const layout = cnLayouts.find((n) => n.id == layout_id);
					if (layout && layout.grupo == "loginNeces") preferencias.layout_id = layoutDefault_id;
				}
			}

			// Fin
			return res.json(preferencias);
		},
		variables: async (req, res) => {
			// Variables
			const datos = {
				...{layoutsBD: cnLayouts, entidadesBD: cnEntidades}, // Opciones y Entidades
				...{pppOpcsArray, pppOpcsSimples, pppOpcsObj},
				...{rclvsNombre: variables.entidades.rclvsNombre},
				...{filtrosConDefault, epocasEstreno, unDia, setTimeOutStd},
				cliente: req.session.cliente,
			};

			// Datos del usuario
			if (req.session.usuario && req.session.usuario.id) {
				datos.usuario_id = req.session.usuario.id;
				datos.videoConsVisto = req.session.usuario.videoConsVisto;
				datos.usuarioTienePPP = await baseDeDatos
					.obtieneTodosPorCondicion("pppRegistros", {usuario_id: datos.usuario_id})
					.then((n) => n.length);
			}

			// Fin
			return res.json(datos);
		},
		cabecerasPosibles: async (req, res) => {
			// Variables
			const usuario_id = req.session.usuario ? req.session.usuario.id : null;

			// Obtiene la cabecera de las configuraciones propias y las provistas por el sistema
			const cabeceras = await procesos.varios.cabeceras(usuario_id);

			// Fin
			return res.json(cabeceras);
		},
	},
	cambiosEnBD: {
		actualizaEnUsuarioConfigCons_id: (req, res) => {
			// Variables
			const {configCons_id} = req.query;
			const usuario_id = req.session && req.session.usuario ? req.session.usuario.id : null;

			// Si está logueado, actualiza el usuario en la BD
			if (usuario_id) {
				baseDeDatos.actualizaPorId("usuarios", usuario_id, {configCons_id});
				req.session.usuario = {...req.session.usuario, configCons_id};
			}

			// Fin
			return res.json();
		},
		creaConfig: async (req, res) => {
			// Variables
			const cabecera = JSON.parse(req.query.cabecera);
			const usuario_id = req.session.usuario.id;

			// Guarda el registro de cabecera
			const objeto = {usuario_id, nombre: cabecera.nombre};
			const {id} = await baseDeDatos.agregaRegistro("consRegsCabecera", objeto);

			// Fin
			return res.json(id);
		},
		guardaConfig: async (req, res) => {
			// Variables
			const configCons = JSON.parse(req.query.configCons);
			let {cabecera, prefs} = configCons;
			const {id, nombre} = cabecera;

			// Si el 'ppp' es un array, lo convierte en un 'id'
			if (prefs.pppOpciones && Array.isArray(prefs.pppOpciones)) {
				const combo = prefs.pppOpciones.toString();
				const pppOpcion = pppOpcsArray.find((n) => n.combo == combo);
				if (pppOpcion) prefs.pppOpciones = pppOpcion.id;
				else delete prefs.pppOpciones;
			}

			// Quita los campos con valor 'default'
			for (let prop in prefs) if (prefs[prop] == filtrosConDefault[prop]) delete prefs[prop];

			// Acciones para edición
			if (cabecera.edicion) baseDeDatos.actualizaPorId("consRegsCabecera", id, {nombre});
			// Acciones para 'nuevo' y 'actualizar campos'
			else {
				// Si se guardan cambios, se eliminan session y cookie
				procesos.varios.eliminaSessionCookie(req, res);

				// Si no es nuevo, elimina la información guardada
				if (!cabecera.nuevo) await baseDeDatos.eliminaPorCondicion("consRegsPrefs", {cabecera_id: id});

				// Guarda la nueva información
				for (let prop in prefs) {
					const objeto = {cabecera_id: id, campo: prop, valor: prefs[prop]};
					baseDeDatos.agregaRegistro("consRegsPrefs", objeto);
				}
			}

			// Fin
			return res.json();
		},
		eliminaConfig: async (req, res) => {
			const {cabecera_id} = req.query;

			// Se eliminan los registros de campo de la configuración
			await baseDeDatos.eliminaPorCondicion("consRegsPrefs", {cabecera_id});

			// Se elimina el registro de cabecera de la configuración
			await baseDeDatos.eliminaPorId("consRegsCabecera", cabecera_id);

			// Fin
			return res.json();
		},
	},
	sessionCookie: {
		guardaConfig: (req, res) => {
			// Variables
			let configCons = JSON.parse(req.query.configCons);

			// Si el 'ppp' es un array, lo convierte en un 'id'
			if (configCons.pppOpciones && Array.isArray(configCons.pppOpciones)) {
				const combo = configCons.pppOpciones.toString();
				const pppOpcion = pppOpcsArray.find((n) => n.combo == combo);
				if (pppOpcion) configCons.pppOpciones = pppOpcion.id;
				else delete configCons.pppOpciones;
			}

			// Guarda la configuración
			req.session.configCons = configCons;
			res.cookie("configCons", req.session.configCons, {maxAge: unDia});

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
		const layout = cnLayouts.find((n) => n.id == prefs.layout_id);
		const {entidad, palabrasClave} = prefs;

		// Obtiene los productos, rclvs y registros ppp del usuario
		let prods = procesos.resultados.obtieneProds.consolidado({...prefs, layout});
		let rclvs = procesos.resultados.obtieneRclvs.consolidado({...prefs, layout});
		let pppRegistros = usuario_id ? baseDeDatos.obtieneTodosPorCondicion("pppRegistros", {usuario_id}, "detalle") : [];
		[prods, rclvs, pppRegistros] = await Promise.all([prods, rclvs, pppRegistros]);

		// Cruces que siempre se deben realizar
		prods = procesos.resultados.cruce.prodsConPPP({prods, pppRegistros, prefs, usuario_id, layout});

		// Acciones varias
		if (entidad == "productos") {
			// Filtros
			prods = procesos.resultados.cruce.prodsConRCLVs({prods, rclvs}); // Cruza 'prods' con 'rclvs'
			prods = procesos.resultados.cruce.prodsConPalsClave({prods, palabrasClave});
			prods = await procesos.resultados.cruce.prodsConMisCalifs({prods, usuario_id, layout});
			prods = await procesos.resultados.cruce.prodsConMisConsultas({prods, usuario_id, layout});
			prods = procesos.resultados.descartaCapitulosSiColeccionPresente.prods(prods);

			// Procesa los datos a enviar
			prods = procesos.resultados.orden.prods({prods, layout}); // Ordena los productos
			prods = procesos.resultados.botonesListado({resultados: prods, layout, prefs});
			prods = procesos.resultados.camposNecesarios.prods({prods, layout}); // Deja sólo los campos necesarios
			return res.json(prods);
		} else {
			// Filtros
			rclvs = procesos.resultados.cruce.rclvsConProds({rclvs, prods}); // Cruza 'rclvs' con 'prods' - Descarta los 'prods de RCLV' que no están en 'prods' y los rclvs sin productos
			rclvs = procesos.resultados.cruce.rclvsConPalsClave({rclvs, palabrasClave}); // Cruza 'rclvs' con 'palabrasClave' - Debe estar antes del cruce de 'rclvs' con 'prods'
			rclvs = procesos.resultados.descartaCapitulosSiColeccionPresente.rclvs(rclvs);

			// Procesa los datos a enviar
			rclvs = procesos.resultados.orden.rclvs({rclvs, layout}); // Si quedaron vigentes algunos RCLV, los ordena
			rclvs = procesos.resultados.botonesListado({resultados: rclvs, layout, prefs});
			rclvs = procesos.resultados.camposNecesarios.rclvs(rclvs); // Deja sólo los campos necesarios
			return res.json(rclvs);
		}
	},
};
