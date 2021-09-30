// ************ Requires ************
const searchTMDB = require("../../funciones/searchTMDB");
const funcionesVarias = require("../../funciones/funcionesVarias");
const validarProductos = require("../../funciones/validarProductos");

// *********** Controlador ***********
module.exports = {
	contador: async (req, res) => {
		// Obtener 'palabras_clave' y obtener la API
		let { palabras_clave } = req.query;
		let lectura = await searchTMDB.search(palabras_clave);
		// Enviar la API
		return res.json(lectura);
	},

	prodFaEnBD: async (req, res) => {
		let datos = req.query;
		let [, resultadoFA] = await funcionesVarias.productoYaEnBD(datos);
		return res.json(resultadoFA);
	},

	procesarContenidoFA: (req, res) => {
		let { contenido } = req.query;
		let matriz = contenido.split("\n");
		let resultado = funcionesVarias.procesarContenidoFA(matriz);
		// Enviar la API
		return res.json(resultado);
	},
	validarDatosDuros: async (req, res) => {
		errores = await validarProductos.validarDatosDuros(req.query);
		return res.json(errores);
	},
};
