// ************ Requires ************
let buscar_x_PC = require("../../funciones/Prod-Agregar/1-Buscar_x_PC");
let procesar = require("../../funciones/Prod-Agregar/2-Procesar");
let validar = require("../../funciones/Prod-Agregar/3-Validar");
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");

// *********** Controlador ***********
module.exports = {
	// Vista (palabrasClave)
	cantProductos: async (req, res) => {
		let {palabrasClave} = req.query;
		// Obtener la cantidad de productos encontrados que coinciden con las palabras clave
		let lectura = await buscar_x_PC.search(palabrasClave);
		return res.json(lectura);
	},
	validarPalabrasClave: (req, res) => {
		let palabrasClave = req.query.palabrasClave;
		let errores = validar.palabrasClave(palabrasClave);
		return res.json(errores.palabrasClave);
	},

	// Vista (desambiguar)
	averiguarColeccion: async (req, res) => {
		datos = await procesar.averiguarColeccion(req.query.TMDB_id);
		return res.json(datos);
	},

	// Vista (tipoProducto)
	averiguarColecciones: async (req, res) => {
		datos = await BD_varias.obtenerTodos("colecciones", "nombre_castellano").then((n) =>
			n.map((m) => {
				return {
					id: m.id,
					nombre_castellano: m.nombre_castellano,
				};
			})
		);
		return res.json(datos);
	},
	averiguarCantTemporadas: async (req, res) => {
		datos = await BD_varias.obtenerPorId("colecciones", req.query.id)
			.then((n) => n.toJSON())
			.then((n) => n.cant_temporadas);
		return res.json(datos);
	},
	obtenerCapitulos: async (req, res) => {
		datos = await BD_especificas.obtenerCapitulos(req.query.coleccion_id, req.query.temporada);
		return res.json(datos);
	},

	// Vista (copiarFA)
	validarCopiarFA: (req, res) => {
		errores = validar.copiarFA(req.query);
		return res.json(errores);
	},
	obtenerFA_id: (req, res) => {
		FA_id = procesar.obtenerFA_id(req.query.direccion);
		return res.json(FA_id);
	},
	obtenerELC_id: async (req, res) => {
		let {entidad, campo, valor} = req.query;
		elc_id = await BD_varias.obtenerELC_id(entidad, campo, valor);
		return res.json(elc_id);
	},

	// Vista (datosDuros)
	validarDatosDuros: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		// Averigua los errores solamente para esos campos
		let errores = await validar.datosDuros(campos, req.query);
		// Devuelve el resultado
		return res.json(errores);
	},

	// Vista (datosPers)
	obtenerDatosSubcategoria: async (req, res) => {
		subcategoria = await BD_varias.obtenerPorCampo("subcategorias", "id", req.query.id);
		return res.json(subcategoria);
	},
	validarDatosPers: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		errores = await validar.datosPers(campos, req.query);
		return res.json(errores);
	},
};
