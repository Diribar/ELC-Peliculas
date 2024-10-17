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
		// Averigua si la info tiene errores
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
		// Vista (datosDuros)
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

	// Vista (palabrasClave)
	cantProductos: async (req, res) => {
		// Variables
		const {palabrasClave} = req.query;
		let cantProdsNuevos;

		// Obtiene los productos
		const resultado = await buscar_x_PC.buscaProds(palabrasClave);

		// Revisa si debe reemplazar una película por su colección
		const productos = await buscar_x_PC.reemplPeliPorColec(resultado.productos);

		// Agrega hallazgos de IM y FA
		const prodsIMFA = await procesos.prodsIMFA(palabrasClave);

		// Prepara la respuesta
		const cantProds = productos.length + prodsIMFA.length;
		const {hayMas} = resultado;

		// Averigua la cantidad de prodsNuevos
		if (cantProds) {
			const TMDB_ids = productos.map((n) => n.TMDB_id);
			let pelis = baseDeDatos.obtieneTodosPorCondicion("peliculas", {TMDB_id: TMDB_ids});
			let coles = baseDeDatos.obtieneTodosPorCondicion("colecciones", {TMDB_id: TMDB_ids});
			[pelis, coles] = await Promise.all([pelis, coles]);
			cantProdsNuevos = cantProds - pelis.length - coles.length - prodsIMFA.length;
		} else cantProdsNuevos = 0;

		// Fin
		return res.json({cantProds, cantProdsNuevos, hayMas});
	},

	// Vista (desambiguar)
	desambForm: {
		// Busca valores 'session'
		buscaInfoDeSession: async (req, res) => res.json(req.session.desambiguar),
		// Busca los productos
		buscaProds: async (req, res) => {
			// Variables
			const {palabrasClave} = req.session.desambiguar;

			// Obtiene los datos
			const resultados = await buscar_x_PC.buscaProds(palabrasClave);

			// Conserva la información en session
			req.session.desambiguar = {palabrasClave, ...resultados};

			// Fin
			return res.json();
		},
		// Reemplaza las películas por su colección
		reemplPeliPorColec: async (req, res) => {
			// Variables
			let {productos} = req.session.desambiguar;

			// Revisa si debe reemplazar una película por su colección
			productos = await buscar_x_PC.reemplPeliPorColec(productos);

			// Conserva la información en session
			req.session.desambiguar.productos = productos;

			// Fin
			return res.json(); // 'productos', 'cantPaginasAPI', 'cantPaginasUsadas', 'hayMas'
		},
		// Pule la información
		organizaLaInfo: async (req, res) => {
			// Organiza la información
			const resultados = await buscar_x_PC.organizaLaInfo(req.session.desambiguar);

			// Conserva la información en session para no tener que procesarla de nuevo
			delete req.session.desambiguar.productos;
			req.session.desambiguar = {...req.session.desambiguar, ...resultados};

			// Fin
			return res.json();
		},
		// Obtiene los hallazgos de origen IM y FA
		agregaHallazgosDeIMFA: async (req, res) => {
			// Variables
			const {palabrasClave} = req.session.desambiguar;
			let {prodsYaEnBD} = req.session.desambiguar;

			// Obtiene los productos afines, ingresados por fuera de TMDB
			const prodsIMFA = await procesos.prodsIMFA(palabrasClave);

			// Une y ordena los 'prodsYaEnBD' priorizando los más recientes
			prodsYaEnBD = [...prodsYaEnBD, ...prodsIMFA];
			prodsYaEnBD.sort((a, b) => b.anoEstreno - a.anoEstreno);

			// Conserva la información en session para no tener que procesarla de nuevo
			req.session.desambiguar.prodsYaEnBD = prodsYaEnBD;

			// Fin
			return res.json();
		},
		obtieneElMensaje: (req, res) => {
			// Variables
			const {prodsNuevos, prodsYaEnBD, hayMas} = req.session.desambiguar;
			const cantNuevos = prodsNuevos.length;
			const coincidencias = cantNuevos + prodsYaEnBD.length;

			// Obtiene el mensaje
			const mensaje =
				"Encontramos " +
				(coincidencias == 1
					? "una sola coincidencia, que " + (cantNuevos == 1 ? "no" : "ya")
					: (hayMas ? "muchas" : coincidencias) +
					  " coincidencias" +
					  (hayMas ? ". Te mostramos " + coincidencias : "") +
					  (cantNuevos == coincidencias
							? ", ninguna"
							: cantNuevos
							? ", de las cuales " + cantNuevos + " no"
							: ", todas ya")) +
				" está" +
				(cantNuevos > 1 && cantNuevos < coincidencias ? "n" : "") +
				" en nuestra BD.";
			req.session.desambiguar.mensaje = mensaje;

			// Fin
			return res.json();
		},
	},
	// Actualiza Datos Originales
	actualizaDatosOrig: async (req, res) => {
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
