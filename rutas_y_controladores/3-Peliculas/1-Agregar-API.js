// ************ Requires ************
const search_TMDB_funcion = require("../../modelos/API/search_TMDB_funcion");
const funciones = require("../../modelos/funcionesVarias");

// *********** Controlador ***********
module.exports = {
	contador: async (req, res) => {
		// Obtener 'palabras_clave' y obtener la API
		let { palabras_clave } = req.query;
		let lectura = await search_TMDB_funcion.search(palabras_clave);
		// Enviar la API
		return res.json(lectura);
	},

	averiguarProductoYaEnBD_FA: async (req, res) => {
		let datos = req.query;
		let [, resultadoFA] = await funciones.productoYaEnBD(datos);
		return res.json(resultadoFA);
	},

	procesarContenidoFA: (req, res) => {
		let { contenido } = req.query;
		let matriz = contenido.split("\n");
		let resultado = funciones.procesarContenidoFA(matriz);
		//console.log("línea 77");
		//console.log(resultado);
		// Enviar la API
		return res.json(resultado);
	},

};
