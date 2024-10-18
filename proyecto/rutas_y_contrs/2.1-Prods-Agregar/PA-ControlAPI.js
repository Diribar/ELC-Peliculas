"use strict";
// Variables
const validacsFM = require("../2.0-Familias/FM-FN-Validar");
const buscar_x_PC = require("./PA-FN1-Buscar_x_PC");
const procsDesamb = require("./PA-FN2-Desambiguar");
const valida = require("./PA-FN3-Validar");
const procesos = require("./PA-FN4-Procesos");

module.exports = {
	validacs: {
		palabrasClave: (req, res) => {
			const palabrasClave = req.query.palabrasClave;
			const errores = valida.palabrasClave(palabrasClave);
			return res.json(errores);
		},
		desambiguar: async (req, res) => {
			// Variables
			let datosDuros = req.cookies.datosOriginales;

			// Para datosDuros, da de alta el avatarUrl y de baja el avatar
			datosDuros.avatarUrl = datosDuros.avatar;
			delete datosDuros.avatar;

			// Averigua si falta completar algún campo de Datos Duros
			let camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad] || n.productos);
			let camposNombre = camposDD.map((n) => n.nombre);
			let errores = await validacsFM.validacs.datosDuros(camposNombre, datosDuros);

			// Genera la session y cookie para DatosDuros
			req.session.datosDuros = datosDuros;
			res.cookie("datosDuros", datosDuros, {maxAge: unDia});

			// Genera la session y cookie para datosAdics
			if (!errores.hay) {
				req.session.datosAdics = datosDuros;
				res.cookie("datosAdics", datosDuros, {maxAge: unDia});
			}

			// Fin
			return res.json(errores);
		},
		datosDuros: async (req, res) => {
			// Variables
			const datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
			const datos = {imgOpcional: datosDuros.imgOpcional, ...req.query};
			const campos = Object.keys(datos);

			// Averigua los errores solamente para esos campos
			let errores = await validacsFM.validacs.datosDuros(campos, datos);

			// Devuelve el resultado
			return res.json(errores);
		},
		datosAdics: async (req, res) => {
			// Obtiene los campos
			let campos = Object.keys(req.query);
			let errores = await validacsFM.validacs.datosAdics(campos, req.query);
			return res.json(errores);
		},
		copiarFA: (req, res) => {
			let errores = valida.FA(req.query);
			return res.json(errores);
		},
	},

	// Vista (palabrasClave) - Busca valores 'session'
	buscaInfoDeSession_pc: async (req, res) => {
		// Variables
		const {palabrasClave, pc_ds} = req.session;

		// Corrije la respuesta
		const respuesta = !palabrasClave
			? null // si no existe req.session.palabrasClave
			: !pc_ds || palabrasClave != pc_ds.palabrasClave
			? {palabrasClave} // Si las palabrasClave difieren
			: pc_ds; // Si las palabrasClave coinciden

		// Fin
		res.json(respuesta);
	},
	pc_ds: {
		// Busca los productos
		buscaProds: async (req, res) => {
			// Variables
			const {session} = req.query;
			const palabrasClave = req.query.palabrasClave ? req.query.palabrasClave : req.session[session];

			// Actualiza en session las palabrasClave. con el valor del formulario
			if (req.session.palabrasClave != palabrasClave) req.session.palabrasClave = palabrasClave;

			// Obtiene los datos
			const resultados = await buscar_x_PC.buscaProds(palabrasClave);

			// Conserva la información en session
			req.session.pc_ds = {palabrasClave, ...resultados}; // 'palabrasClave', 'productos', 'cantPaginasAPI', 'cantPaginasUsadas', 'hayMas'

			// Fin
			return res.json();
		},
		// Reemplaza las películas por su colección
		reemplPeliPorColec: async (req, res) => {
			// Variables
			let {productos} = req.session.pc_ds;

			// Revisa si debe reemplazar una película por su colección
			productos = await buscar_x_PC.reemplPeliPorColec(productos);

			// Conserva la información en session
			req.session.pc_ds.productos = productos;

			// Fin
			return res.json(); // 'palabrasClave', 'productos', 'cantPaginasAPI', 'cantPaginasUsadas', 'hayMas'
		},
		// Pule la información
		organizaLaInfo: async (req, res) => {
			// Organiza la información
			const resultados = await buscar_x_PC.organizaLaInfo(req.session.pc_ds);

			// Conserva la información en session para no tener que procesarla de nuevo
			delete req.session.pc_ds.productos;
			req.session.pc_ds = {...req.session.pc_ds, ...resultados};

			// Fin
			return res.json();
		},
		// Obtiene los hallazgos de origen IM y FA
		agregaHallazgosDeIMFA: async (req, res) => {
			// Variables
			const {palabrasClave} = req.session.pc_ds;

			let {prodsYaEnBD} = req.session.pc_ds;

			// Obtiene los productos afines, ingresados por fuera de TMDB
			const prodsIMFA = await procesos.prodsIMFA(palabrasClave);

			// Une y ordena los 'prodsYaEnBD' priorizando los más recientes
			prodsYaEnBD = [...prodsYaEnBD, ...prodsIMFA];
			prodsYaEnBD.sort((a, b) => b.anoEstreno - a.anoEstreno);

			// Conserva la información en session para no tener que procesarla de nuevo
			req.session.pc_ds.prodsYaEnBD = prodsYaEnBD;

			// Fin
			return res.json();
		},
		obtieneElMensaje: (req, res) => {
			// Variables
			const {prodsNuevos, prodsYaEnBD, hayMas} = req.session.pc_ds;
			const cantNuevos = prodsNuevos.length;
			const cantYaEnBd = prodsYaEnBD.length;
			const cantProds = cantNuevos + cantYaEnBd;
			const mensaje = {};

			// Obtiene el mensaje para 'palabrasClave'
			if (cantProds && !hayMas) {
				// Más variables
				const plural = cantNuevos > 1 ? "s" : "";

				// Obtiene el mensaje
				mensaje.palabrasClave = cantNuevos
					? "Encontramos " + cantNuevos + " coincidencia" + plural + " nueva" + plural
					: "No encontramos ninguna coincidencia nueva";
				if (cantProds > cantNuevos) mensaje.palabrasClave += ", y " + cantYaEnBd + " ya en BD";
			}
			// Quedaron casos por buscar o no se hallaron productos
			else
				mensaje.palabrasClave = hayMas
					? "Hay demasiadas coincidencias (+" + cantProds + "), intentá ser más específico"
					: "No encontramos ninguna coincidencia";

			// Obtiene el mensaje para 'desambiguar'
			mensaje.desambiguar =
				"Encontramos " +
				(cantProds == 1
					? "una sola coincidencia, que " + (cantNuevos == 1 ? "no" : "ya")
					: (hayMas ? "muchas" : cantProds) +
					  " coincidencias" +
					  (hayMas ? ". Te mostramos " + cantProds : "") +
					  (cantNuevos == cantProds
							? ", ninguna"
							: cantNuevos
							? ", de las cuales " + cantNuevos + " no"
							: ", todas ya")) +
				" está" +
				(cantNuevos > 1 && cantNuevos < cantProds ? "n" : "") +
				" en nuestra BD.";

			// Fin
			req.session.pc_ds.mensaje = mensaje;
			return res.json();
		},
	},

	// Vista (desambiguar)
	desamb: {
		// Busca valores 'session'
		buscaInfoDeSession: async (req, res) => {
			// Variables
			const {desambiguar: palabrasClave, pc_ds} = req.session;

			// Corrije la respuesta
			const respuesta = !pc_ds || palabrasClave != pc_ds.palabrasClave ? {palabrasClave} : {palabrasClave, ...pc_ds};

			// Fin
			res.json(respuesta);
		},
		// Actualiza Datos Originales
		obtieneMasInfoDelProd: async (req, res) => {
			// Variables
			const datos = JSON.parse(req.query.datos);

			// Obtiene más información del producto
			const TMDB_entidad = datos.TMDB_entidad;
			const infoTMDBparaDD = await procsDesamb[TMDB_entidad].obtieneInfo(datos);
			if (!infoTMDBparaDD.avatar) infoTMDBparaDD.imgOpcional = "NO";

			// Guarda los datos originales en una cookie
			res.cookie("datosOriginales", infoTMDBparaDD, {maxAge: unDia});
			// Fin
			return res.json();
		},
	},

	// Vista (datosAdics)
	guardaDatosAdics: (req, res) => {
		let datosAdics = {
			...(req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics),
			...req.query,
		};
		req.session.datosAdics = datosAdics;
		res.cookie("datosAdics", datosAdics, {maxAge: unDia});
		return res.json();
	},

	// Vista (IM)
	averiguaColecciones: async (req, res) => {
		// Obtiene todas las colecciones
		let datos = await baseDeDatos.obtieneTodosConOrden("colecciones", "nombreCastellano");

		// Deja solamente los campos 'id' y 'nombreCastellano'
		datos = datos.map((n) => ({id: n.id, nombreCastellano: n.nombreCastellano + " (" + n.anoEstreno + ")"}));

		// Fin
		return res.json(datos);
	},
	averiguaCantTemps: async (req, res) => {
		let datos = await baseDeDatos.obtienePorId("colecciones", req.query.id).then((n) => n.cantTemps);
		return res.json(datos);
	},

	// Vista (FA)
	obtieneFA_id: (req, res) => {
		let FA_id = procesos.FA.obtieneFA_id(req.query.direccion);
		return res.json(FA_id);
	},
	averiguaSiYaExisteEnBd: async (req, res) => {
		const {entidad, campo, valor} = req.query;
		const existe = await baseDeDatos.obtienePorCondicion(entidad, {[campo]: valor});
		return res.json(existe);
	},
};
