"use strict";
// Definir variables
const buscar_x_PC = require("../../funciones/Prod-Agregar/1-Buscar_x_PC");
const procesar = require("../../funciones/Prod-Agregar/2-Procesar");
const validar = require("../../funciones/Prod-Agregar/3-Validar");
const BD_genericas = require("../../funciones/BD/Genericas");
const BD_especificas = require("../../funciones/BD/Especificas");

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
		let datos = await procesar.averiguarColeccion(req.query.TMDB_id);
		return res.json(datos);
	},

	// Vista (tipoProducto)
	averiguarColecciones: async (req, res) => {
		let datos = await BD_genericas.obtenerTodos("colecciones", "nombre_castellano").then((n) =>
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
		let datos = await BD_genericas.obtenerPorId("colecciones", req.query.id)
			.then((n) => n.toJSON())
			.then((n) => n.cant_temporadas);
		return res.json(datos);
	},
	obtenerCapitulos: async (req, res) => {
		let datos = await BD_especificas.obtenerCapitulos(req.query.coleccion_id, req.query.temporada);
		return res.json(datos);
	},

	// Vista (copiarFA)
	validarCopiarFA: (req, res) => {
		let errores = validar.copiarFA(req.query);
		return res.json(errores);
	},
	obtenerFA_id: (req, res) => {
		let FA_id = procesar.obtenerFA_id(req.query.direccion);
		return res.json(FA_id);
	},
	obtenerELC_id: async (req, res) => {
		let {entidad, campo, valor} = req.query;
		let elc_id = await BD_especificas.obtenerELC_id(entidad, campo, valor);
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
		let subcategoria = await BD_genericas.obtenerPorCampo("subcategorias", "id", req.query.id);
		return res.json(subcategoria);
	},
	validarDatosPers: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		let errores = await validar.datosPers(campos, req.query);
		return res.json(errores);
	},
};
