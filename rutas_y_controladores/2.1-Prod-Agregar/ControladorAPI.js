"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const buscar_x_PC = require("./FN-Buscar_x_PC");
const procesos = require("./FN-Procesos");
const validar = require("./FN-Validar");

module.exports = {
	// Vista (palabrasClave)
	cantProductos: async (req, res) => {
		let palabrasClave = req.query.palabrasClave;
		// Obtiene la cantidad de productos encontrados que coinciden con las palabras clave
		let lectura = await buscar_x_PC.search(palabrasClave, false);
		return res.json(lectura);
	},
	validarPalabrasClave: (req, res) => {
		let palabrasClave = req.query.palabrasClave;
		let errores = validar.palabrasClave(palabrasClave);
		return res.json(errores);
	},

	// Vista (desambiguar)
	averiguarColeccion: async (req, res) => {
		let datos = await procesos.averiguarColeccion(req.query.TMDB_id);
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
		let datos = await BD_genericas.obtenerPorId("colecciones", req.query.id).then(
			(n) => n.cant_temporadas
		);
		return res.json(datos);
	},

	// Vista (copiarFA)
	validarCopiarFA: (req, res) => {
		let errores = validar.copiarFA(req.query);
		return res.json(errores);
	},
	obtenerFA_id: (req, res) => {
		let FA_id = procesos.obtenerFA_id(req.query.direccion);
		return res.json(FA_id);
	},
	obtenerELC_id: async (req, res) => {
		let {entidad, campo, valor} = req.query;
		let elc_id = await BD_especificas.obtenerELC_id(entidad, {[campo]: valor});
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
	obtenerSubcategorias: async (req, res) => {
		let subcategorias = await BD_genericas.obtenerTodos("subcategorias", "orden");
		return res.json(subcategorias);
	},
	validarDatosPers: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		let errores = await validar.datosPers(campos, req.query);
		return res.json(errores);
	},
	guardarDatosPers: (req, res) => {
		let datosPers = {
			...(req.session.datosPers ? req.session.datosPers : req.cookies.datosPers),
			...req.query,
		};
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, {maxAge: unDia});
		return res.json()
	},
};
