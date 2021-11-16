// ************ Requires ************
let buscar_x_PalClave = require("../../funciones/Productos/1-Buscar_x_PC");
let procesarProd = require("../../funciones/Productos/2-Procesar");
let validarProd = require("../../funciones/Productos/3-Errores");

// *********** Controlador ***********
module.exports = {
	// Vista (palabrasClave)
	cantProductos: async (req, res) => {
		let { palabrasClave } = req.query;
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

	// Vista (copiarFA)
	validarCopiarFA: (req, res) => {
		errores = validarProd.copiarFA(req.query);
		return res.json(errores);
	},

	// Vista (datosDuros)
	validarDatosDuros: async (req, res) => {
		errores = await validarProd.datosDuros(
			req.query,
			Object.keys(req.query)
		);
		return res.json(errores);
	},

	// Vista (datosPers)
	validarDatosPers: async (req, res) => {
		errores = await validarProd.datosPers(
			req.query,
			Object.keys(req.query)
		);
		return res.json(errores);
	},

	// Vista (copiarFA)
	obtenerFA_id: (req, res) => {
		FA_id = procesarProd.obtenerFA_id(req.query.direccion);
		return res.json(FA_id);
	},

	// Vista (copiarFA)
	obtenerELC_id: async (req, res) => {
		let { entidad, campo, valor } = req.query;
		ELC_id = await procesarProd.obtenerELC_id({ entidad, campo, valor });
		return res.json(ELC_id);
	},
};
