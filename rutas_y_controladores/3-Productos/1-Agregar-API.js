// ************ Requires ************
let buscar_x_PalClave = require("../../funciones/PROD-buscar_x_PC");
let procesarProductos = require("../../funciones/PROD-procesar");
let validarProductos = require("../../funciones/PROD-validar");

// *********** Controlador ***********
module.exports = {
	validarPalabrasClave: async (req, res) => {
		let palabras_clave = req.query.palabras_clave;
		let errores = await validarProductos.palabrasClave(palabras_clave);
		return res.json(errores.palabras_clave);
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
		// Obtener 'palabras_clave' y obtener la API
		let { palabras_clave } = req.query;
		let lectura = await buscar_x_PalClave.search(palabras_clave);
		// Enviar la API
		return res.json(lectura);
	},

	averiguarYaEnBD_FA: async (req, res) => {
		let datos = req.query;
		let [, ELC_id] = await procesarProductos.obtenerELC_id(datos);
		return res.json(ELC_id);
	},
};
