// ************ Requires ************
let buscar_x_PalClave = require("../../funciones/Productos/1-PROD-buscar_x_PC");
let validarProductos = require("../../funciones/Productos/3-PROD-validar");

// *********** Controlador ***********
module.exports = {
	cantProductos: async (req, res) => {
		// Obtener 'palabrasClave' y obtener la API
		let { palabrasClave } = req.query;
		let lectura = await buscar_x_PalClave.search(palabrasClave);
		// Enviar la API
		return res.json(lectura);
	},

	validarPalabrasClave: async (req, res) => {
		let palabrasClave = req.query.palabrasClave;
		let errores = await validarProductos.palabrasClave(palabrasClave);
		return res.json(errores.palabrasClave);
	},


};
