"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const buscar_x_PC = require("./FN-Buscar_x_PC");
const procesos = require("./FN-Procesos");
const valida = require("./FN-Validar");

module.exports = {
	// Vista (palabrasClave)
	cantProductos: async (req, res) => {
		let palabrasClave = req.query.palabrasClave;
		// Obtiene la cantidad de productos encontrados que coinciden con las palabras clave
		let lectura = await buscar_x_PC.search(palabrasClave, false);
		return res.json(lectura);
	},
	validaPalabrasClave: (req, res) => {
		let palabrasClave = req.query.palabrasClave;
		let errores = valida.palabrasClave(palabrasClave);
		return res.json(errores);
	},

	// Vista (desambiguar)
	desambiguarForm: async (req, res) => {
		// Variables
		let palabrasClave = req.session.palabrasClave ? req.session.palabrasClave : req.cookies.palabrasClave;
		// Obtiene los productos
		let desambiguar = req.session.desambiguar
			? req.session.desambiguar
			: await buscar_x_PC.search(palabrasClave, true);
		let [prodsNuevos, prodsYaEnBD, mensaje] = procesos.DS_prepararMensaje(desambiguar);
		// Conserva la información en session para no tener que procesarla de nuevo
		req.session.desambiguar = desambiguar;
		// Fin
		return res.json([prodsNuevos, prodsYaEnBD, mensaje]);
	},

	averiguaColeccion: async (req, res) => {
		let datos = await procesos.averiguaColeccion(req.query.TMDB_id);
		return res.json(datos);
	},

	// Vista (tipoProducto)
	averiguaColecciones: async (req, res) => {
		let datos = await BD_genericas.obtieneTodos("colecciones", "nombre_castellano").then((n) =>
			n.map((m) => {
				return {
					id: m.id,
					nombre_castellano: m.nombre_castellano,
				};
			})
		);
		return res.json(datos);
	},
	averiguaCantTemporadas: async (req, res) => {
		let datos = await BD_genericas.obtienePorId("colecciones", req.query.id).then(
			(n) => n.cant_temporadas
		);
		return res.json(datos);
	},

	// Vista (copiarFA)
	validaCopiarFA: (req, res) => {
		let errores = valida.copiarFA(req.query);
		return res.json(errores);
	},
	obtieneFA_id: (req, res) => {
		let FA_id = procesos.obtieneFA_id(req.query.direccion);
		return res.json(FA_id);
	},
	obtieneELC_id: async (req, res) => {
		let {entidad, campo, valor} = req.query;
		let elc_id = await BD_especificas.obtieneELC_id(entidad, {[campo]: valor});
		return res.json(elc_id);
	},

	// Vista (datosDuros)
	validaDatosDuros: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		// Averigua los errores solamente para esos campos
		let errores = await valida.datosDuros(campos, req.query);
		// Devuelve el resultado
		return res.json(errores);
	},

	// Vista (datosPers)
	obtieneSubcategorias: async (req, res) => {
		let subcategorias = await BD_genericas.obtieneTodos("subcategorias", "orden");
		return res.json(subcategorias);
	},
	validaDatosPers: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		let errores = await valida.datosPers(campos, req.query);
		return res.json(errores);
	},
	guardarDatosPers: (req, res) => {
		let datosPers = {
			...(req.session.datosPers ? req.session.datosPers : req.cookies.datosPers),
			...req.query,
		};
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, {maxAge: unDia});
		return res.json();
	},
};
