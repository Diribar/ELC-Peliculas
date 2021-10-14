// ************ Requires ************
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

};
