"use strict";
// Variables
const buscar_x_PC = require("./PA-FN1-Buscar_x_PC");
const procsDesamb = require("./PA-FN2-Desambiguar");
const valida = require("./PA-FN3-Validar");
const procesos = require("./PA-FN4-Procesos");

module.exports = {
	// Vista (palabrasClave)
	validaPalabrasClave: (req, res) => {
		let palabrasClave = req.query.palabrasClave;
		let errores = valida.palabrasClave(palabrasClave);
		return res.json(errores);
	},
	cantProductos: async (req, res) => {
		// Variables
		let palabrasClave = req.query.palabrasClave;
		let resultado;
		// Obtiene los productos
		resultado = await buscar_x_PC.search(palabrasClave);
		// Revisa si debe reemplazar una película por su colección
		resultado = await buscar_x_PC.reemplazoDePeliPorColeccion(resultado);
		// Prepara la respuesta
		let cantProds = resultado.productos.length;
		let cantProdsNuevos = resultado.productos.filter((n) => !n.yaEnBD_id).length;
		let hayMas = resultado.hayMas;

		// Fin
		return res.json({cantProds, cantProdsNuevos, hayMas});
	},

	// Vista (desambiguar)
	desambForm: {
		// Busca valores 'session'
		buscaInfoEnBE: async (req, res) => res.json(req.session.desambiguar),
		// Busca los productos
		buscaProds: async (req, res) => {
			// Variables
			const palabrasClave =
				req.session.desambiguar && req.session.desambiguar.palabrasClave
					? req.session.desambiguar.palabrasClave
					: req.cookies.desambiguar.palabrasClave;

			// Obtiene los productos y los conserva en session
			req.session.desambiguar.prodProv = await buscar_x_PC.search(palabrasClave);

			// Fin
			return res.json();
		},
		// Reemplaza las películas por su colección
		reemplPeliPorColec: async (req, res) => {
			// Variables
			let productos = req.session.desambiguar.prodProv;

			// Revisa si debe reemplazar una película por su colección
			productos = await buscar_x_PC.reemplazoDePeliPorColeccion(productos);

			// Conserva la información en session
			req.session.desambiguar.prodProv = productos;

			// Fin
			return res.json();
		},
		// Pule la información
		puleLaInfo: async (req, res) => {
			// Variables
			let productos = req.session.desambiguar.prodProv;

			// Organiza la información
			productos = await buscar_x_PC.organizaLaInformacion(productos);

			// Conserva la información en session para no tener que procesarla de nuevo
			req.session.desambiguar.prodProv = productos;

			// Fin
			return res.json();
		},
		// Obtiene los hallazgos de origen IM y FA
		obtieneHallazgosDeIMFA: async (req, res) => {
			// Variables
			const userID = req.session.usuario ? req.session.usuario.id : 0;
			const palabrasClave = req.session.desambiguar.palabrasClave;

			// Obtiene los productos afines, ingresados por fuera de TMDB
			const prodsIMFA = await procsDesamb.prodsIMFA({palabrasClave, userID});

			// Conserva la información en session para no tener que procesarla de nuevo
			req.session.desambiguar.prodsIMFA = prodsIMFA;

			// Fin
			return res.json();
		},
		// Combina los hallazgos 'yaEnBD'
		combinaHallazgosYaEnBD: async (req, res) => {
			// Variables
			const yaEnBD = req.session.desambiguar.prodProv.prodsYaEnBD;
			const prodsIMFA = req.session.desambiguar.prodsIMFA;

			// Une y ordena los 'prodsYaEnBD' priorizando los más recientes
			let prodsYaEnBD = [...yaEnBD, ...prodsIMFA];
			prodsYaEnBD.sort((a, b) => (a.anoEstreno > b.anoEstreno ? -1 : 1));

			// Conserva la información en session para no tener que procesarla de nuevo
			req.session.desambiguar.prodProv.prodsYaEnBD = prodsYaEnBD;

			// Reemplaza el nombre del método
			req.session.desambiguar.productos = req.session.desambiguar.prodProv;
			delete req.session.desambiguar.prodProv;

			// Fin
			return res.json(req.session.desambiguar.productos);
		},
	},
	desambGuardar: {
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
		// Averigua si la info tiene errores
		averiguaSiHayErrores: async (req, res) => {
			// Variables
			let datosDuros = req.cookies.datosOriginales;

			// Para datosDuros, da de alta el avatarUrl y de baja el avatar
			datosDuros.avatarUrl = datosDuros.avatar;
			delete datosDuros.avatar;

			// Averigua si falta completar algún campo de Datos Duros
			let camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad] || n.productos);
			let camposNombre = camposDD.map((n) => n.nombre);
			let errores = await valida.datosDuros(camposNombre, datosDuros);

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
	},

	// Vista (datosDuros)
	validaDatosDuros: async (req, res) => {
		// Variables
		const datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
		const datos = {imgOpcional: datosDuros.imgOpcional, ...req.query};
		const campos = Object.keys(datos);

		// Averigua los errores solamente para esos campos
		let errores = await valida.datosDuros(campos, datos);

		// Devuelve el resultado
		return res.json(errores);
	},
	convierteLetrasAlCastellano: (req, res) => {
		// Obtiene el valor
		let {valor} = req.query;
		// Lo convierte al castellano
		let conversion = comp.convierteLetras.alCastellano_campo(valor);
		// Devuelve el resultado
		return res.json(conversion);
	},

	// Vista (datosAdics)
	validaDatosAdics: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		let errores = await valida.datosAdics(campos, req.query);
		return res.json(errores);
	},
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
		let datos = await BD_genericas.obtieneTodos("colecciones", "nombreCastellano");

		// Deja solamente los campos 'id' y 'nombreCastellano'
		datos = datos.map((n) => ({id: n.id, nombreCastellano: n.nombreCastellano + " (" + n.anoEstreno + ")"}));

		// Fin
		return res.json(datos);
	},
	averiguaCantTemps: async (req, res) => {
		let datos = await BD_genericas.obtienePorId("colecciones", req.query.id).then((n) => n.cantTemps);
		return res.json(datos);
	},

	// Vista (FA)
	validaCopiarFA: (req, res) => {
		let errores = valida.FA(req.query);
		return res.json(errores);
	},
	obtieneFA_id: (req, res) => {
		let FA_id = procesos.FA.obtieneFA_id(req.query.direccion);
		return res.json(FA_id);
	},
	obtieneELC_id: async (req, res) => {
		let {entidad, campo, valor} = req.query;
		let elc_id = await BD_especificas.obtieneELC_id(entidad, {[campo]: valor});
		return res.json(elc_id);
	},
};
