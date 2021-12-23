// ************ Requires ************
let buscar_x_PalClave = require("../../funciones/Prod-Agregar/1-Buscar_x_PC");
let procesarProd = require("../../funciones/Prod-Agregar/2-Procesar");
let validarProd = require("../../funciones/Prod-Agregar/3-Errores");
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");

// *********** Controlador ***********
module.exports = {
	// Vista (palabrasClave)
	cantProductos: async (req, res) => {
		let {palabrasClave} = req.query;
		// Obtener la cantidad de productos encontrados que coinciden con las palabras clave
		let lectura = await buscar_x_PalClave.search(palabrasClave);
		return res.json(lectura);
	},

	// Vista (palabrasClave)
	validarPalabrasClave: (req, res) => {
		let palabrasClave = req.query.palabrasClave;
		let errores = validarProd.palabrasClave(palabrasClave);
		return res.json(errores.palabrasClave);
	},

	// Vista (desambiguar)
	averiguarColeccion: async (req, res) => {
		datos = await procesarProd.averiguarColeccion(req.query.TMDB_id);
		return res.json(datos);
	},

	// Vista (tipoProducto)
	averiguarColecciones: async (req, res) => {
		datos = await BD_varias.obtenerTodos("colecciones", "nombre_castellano").then((n) =>
			n.map((m) => {
				return {
					id: m.id,
					nombre_castellano: m.nombre_castellano,
				};
			})
		);
		return res.json(datos);
	},

	// Vista (tipoProducto)
	obtenerColeccion: async (req, res) => {
		datos = await BD_varias.obtenerPorId("colecciones", req.query.id)
			.then((n) => n.dataValues)
			.then((n) => n.cant_temporadas);
		return res.json(datos);
	},

	// Vista (tipoProducto)
	obtenerTemporada: async (req, res) => {
		datos = await BD_especificas.filtrarCapitulos(
			req.query.coleccion_id,
			req.query.temporada
		).then((n) => n.map((m) => m.capitulo));
		//.then(n=>n.filter(m=>m.temporada==req.query.temporada))
		return res.json(datos);
	},

	// Vista (copiarFA)
	validarCopiarFA: (req, res) => {
		errores = validarProd.copiarFA(req.query);
		return res.json(errores);
	},

	// Vista (copiarFA)
	obtenerFA_id: (req, res) => {
		FA_id = procesarProd.obtenerFA_id(req.query.direccion);
		return res.json(FA_id);
	},

	// Vista (copiarFA)
	obtenerELC_id: async (req, res) => {
		let {entidad, campo, valor} = req.query;
		ELC_id = await BD_varias.obtenerELC_id({entidad, campo, valor});
		return res.json(ELC_id);
	},

	// Vista (datosDuros)
	obtenerPaises: async (req, res) => {
		paises = await BD_varias.obtenerTodos("paises", "nombre");
		return res.json(paises);
	},

	// Vista (datosDuros)
	validarDatosDuros: async (req, res) => {
		errores = await validarProd.datosDuros(req.query, Object.keys(req.query));
		return res.json(errores);
	},

	// Vista (datosPers)
	validarDatosPers: async (req, res) => {
		errores = await validarProd.datosPers(req.query, Object.keys(req.query));
		return res.json(errores);
	},
};
