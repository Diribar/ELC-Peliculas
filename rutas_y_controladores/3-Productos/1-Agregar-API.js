// ************ Requires ************
let buscar_x_PalClave = require("../../funciones/PROD-buscar_x_PC");
let procesarProductos = require("../../funciones/PROD-procesar");
let validarProductos = require("../../funciones/PROD-validar");

// *********** Controlador ***********
module.exports = {
	validarPalabrasClave: async (req, res) => {
		let palabrasClave = req.query.palabrasClave;
		let errores = await validarProductos.palabrasClave(palabrasClave);
		return res.json(errores.palabrasClave);
	},

	validarCopiarFA: async (req, res) => {
		errores = await validarProductos.copiarFA(req.query);
		return res.json(errores);
	},

	validarDatosDuros: async (req, res) => {
		errores = await validarProductos.datosDuros(req.query);
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
