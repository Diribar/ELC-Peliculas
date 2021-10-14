// ************ Requires ************
let validarProductos = require("../../funciones/Productos/3-PROD-errores");

// *********** Controlador ***********
module.exports = {
	validarDatosDuros: async (req, res) => {
		errores = await validarProductos.datosDuros(req.query);
		return res.json(errores);
	},

	validarDatosPers: async (req, res) => {
		errores = await validarProductos.datosPers(req.query);
		return res.json(errores);
	},

};
