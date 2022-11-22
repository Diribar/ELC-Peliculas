"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const buscar_x_PC = require("./FN-Buscar_x_PC");
const procesos = require("./FN-Procesos");
const valida = require("./FN-Validar");

module.exports = {
	// Vista (palabrasClave)
	validaPalabrasClave: (req, res) => {
		let palabrasClave = req.query.palabrasClave;
		let errores = valida.palabrasClave(palabrasClave);
		return res.json(errores);
	},
	cantProductos: async (req, res) => {
		// Variables
		let palabrasClave = req.query.palabrasClave;
		// Obtiene la cantidad de productos encontrados que coinciden con las palabras clave
		let resultado;
		resultado = await buscar_x_PC.search(palabrasClave);
		// Prepara la respuesta
		let cantProds = resultado.productos.length;
		let cantProdsNuevos = resultado.productos.filter((n) => !n.yaEnBD_id).length;
		let hayMas = resultado.hayMas;

		// Fin
		return res.json({cantProds, cantProdsNuevos, hayMas});
	},

	// Vista (desambiguar)
	desambiguarForm0: async (req, res) => {
		let respuesta = req.session.desambiguar ? req.session.desambiguar : "";
		return res.json(respuesta);
	},
	desambiguarForm1: async (req, res) => {
		// Variables
		let palabrasClave = req.query.palabrasClave;
		// Obtiene los productos
		let resultado = await buscar_x_PC.search(palabrasClave);
		// Conserva la información en session
		req.session.desambiguar1 = resultado;
		// Fin
		return res.json();
	},
	desambiguarForm2: async (req, res) => {
		// Variables
		let resultado = req.session.desambiguar1
		// Ordena los productos
		resultado = await buscar_x_PC.ordenaLosProductos(resultado);
		// Genera la info en el formato '{prodsNuevos, prodsYaEnBD, mensaje}'
		resultado = buscar_x_PC.DS_procesoFinal(resultado);
		// Conserva la información en session para no tener que procesarla de nuevo
		req.session.desambiguar = resultado;
		// Fin
		return res.json(resultado);
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
