// ************ Requires ************
const searchTMDB = require("../../funciones/searchTMDB");
const funcionesVarias = require("../../funciones/funcionesVarias");
const validarProductos = require("../../funciones/validarProductos");

// *********** Controlador ***********
module.exports = {
	palabrasClave: async (req, res) => {
		let palabras_clave = req.query.palabras_clave;
		let resultado = await validarProductos.palabrasClave(palabras_clave);
		return res.json(resultado.palabras_clave);
	},

	cantProductos: async (req, res) => {
		// Obtener 'palabras_clave' y obtener la API
		let { palabras_clave } = req.query;
		let lectura = await searchTMDB.search(palabras_clave);
		// Enviar la API
		return res.json(lectura);
	},

	obtenerFA_id: async (req, res) => {
		let url = req.query.url;
		let fa_id = await funcionesVarias.obtenerFA_id(url);
		return res.json(fa_id);
	},

	obtenerELC_id: async (req, res) => {
		let datos = req.query;
		let [, ELC_id] = await funcionesVarias.obtenerELC_id(datos);
		return res.json(ELC_id);
	},

	validarImagenFA: async (req, res) => {
		let url = req.query.url;
		let fa_id = await funcionesVarias.validarImagenFA(url);
		return res.json(fa_id);
	},

	procesarContenidoFA: (req, res) => {
		let { contenido } = req.query;
		let matriz = contenido.split("\n");
		let resultado = funcionesVarias.procesarContenidoFA(matriz);
		// Enviar la API
		return res.json(resultado);
	},

	validarDatosDuros: async (req, res) => {
		errores = await validarProductos.datosDuros(req.query);
		return res.json(errores);
	},
};
