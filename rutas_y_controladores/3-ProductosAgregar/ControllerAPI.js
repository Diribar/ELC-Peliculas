// ************ Requires ************
let buscar_x_PalClave = require("../../funciones/Productos/1-PROD-buscar_x_PC");
let procesarProductos = require("../../funciones/Productos/2-PROD-procesar");
let validarProductos = require("../../funciones/Productos/3-PROD-errores");

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
		let errores = validarProductos.palabrasClave(palabrasClave);
		return res.json(errores.palabrasClave);
	},

	// Vista (copiarFA)
	validarCopiarFA: (req, res) => {
		errores = validarProductos.copiarFA(req.query);
		return res.json(errores);
	},

	// Vista (copiarFA)
	obtenerFA_id: (req, res) => {
		FA_id = procesarProductos.obtenerFA_id(req.query.direccion);
		return res.json(FA_id);
	},

	// Vista (copiarFA)
	obtenerColeccion_id: async (req, res) => {
		let {parametro, id} = req.query;
		coleccion_id = await procesarProductos.obtenerColeccion_id(
			"colecciones_peliculas",
			parametro,
			id
		);
		return res.json(coleccion_id);
	},
};
