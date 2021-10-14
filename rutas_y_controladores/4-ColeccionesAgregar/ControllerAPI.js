// ************ Requires ************
let buscar_x_PalClave = require("../../funciones/varias/PROD-buscar_x_PC");
let procesarProductos = require("../../funciones/varias/PROD-procesar");
let validarProductos = require("../../funciones/varias/PROD-validar");

// *********** Controlador ***********
module.exports = {
	validarCopiarFA: async (req, res) => {
		errores = await validarProductos.copiarFA(req.query);
		return res.json(errores);
	},

	validarDatosDuros: async (req, res) => {
		errores = await validarProductos.datosDuros(req.query);
		return res.json(errores);
	},

	validarDatosPers: async (req, res) => {
		errores = await validarProductos.datosPers(req.query);
		return res.json(errores);
	},

	cantProductos: async (req, res) => {
		// Obtener 'palabrasClave' y obtener la API
		let { palabrasClave } = req.query;
		let lectura = await buscar_x_PalClave.search(palabrasClave);
		// Enviar la API
		return res.json(lectura);
	},
};
