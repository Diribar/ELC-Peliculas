"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const buscar_x_PC = require("./PA-FN-Buscar_x_PC");
const procesos = require("./PA-FN-Procesos");
const valida = require("./PA-FN-Validar");

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
		let resultado;
		// Obtiene los productos
		resultado = await buscar_x_PC.search(palabrasClave);
		// Revisa si debe reemplazar una película por su colección
		resultado = await buscar_x_PC.reemplazoDePeliPorColeccion(resultado);
		// Prepara la respuesta
		let cantProds = resultado.productos.length;
		let cantProdsNuevos = resultado.productos.filter((n) => !n.yaEnBD_id).length;
		let hayMas = resultado.hayMas;

		// Fin
		return res.json({cantProds, cantProdsNuevos, hayMas});
	},

	// Vista (desambiguar)
	desambForm0: async (req, res) => {
		let respuesta = req.session.desambiguar ? req.session.desambiguar : "";
		return res.json(respuesta);
	},
	desambForm1: async (req, res) => {
		// Variables
		let palabrasClave = req.query.palabrasClave;
		// Obtiene los productos
		let resultado = await buscar_x_PC.search(palabrasClave);
		// Conserva la información en session
		req.session.desambiguar1 = resultado;
		// Fin
		return res.json();
	},
	desambForm2: async (req, res) => {
		// Variables
		let resultado = req.session.desambiguar1;
		// Revisa si debe reemplazar una película por su colección
		resultado = await buscar_x_PC.reemplazoDePeliPorColeccion(resultado);
		// Conserva la información en session
		req.session.desambiguar2 = resultado;
		// Fin
		return res.json(resultado);
	},
	desambForm3: async (req, res) => {
		// Variables
		let resultado = req.session.desambiguar2;
		// Organiza la información
		resultado = await buscar_x_PC.organizaLaInformacion(resultado);
		// Conserva la información en session para no tener que procesarla de nuevo
		req.session.desambiguar = resultado;
		// Fin
		return res.json(resultado);
	},
	desambGuardar1: async (req, res) => {
		const datos = JSON.parse(req.query.datos);
		// Obtiene más información del producto
		const infoTMDBparaDD = await procesos["DS_" + datos.TMDB_entidad](datos);
		// Guarda los datos originales en una cookie
		res.cookie("datosOriginales", infoTMDBparaDD, {maxAge: unDia});
		// Fin
		return res.json();
	},
	desambGuardar2: async (req, res) => {
		let datosDuros = req.cookies.datosOriginales;
		// Para datosDuros, da de alta el avatar_url y de baja el avatar
		datosDuros.avatar_url = datosDuros.avatar;
		delete datosDuros.avatar;
		// Averigua si falta completar algún campo de Datos Duros
		let camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad] || n.productos);
		let camposDD_nombre = camposDD.map((n) => n.nombre);
		let errores = await valida.datosDuros(camposDD_nombre, datosDuros);
		// Genera la session y cookie para DatosDuros
		req.session.datosDuros = {...datosDuros};
		res.cookie("datosDuros", datosDuros, {maxAge: unDia});
		// Genera la session y cookie para datosAdics
		if (!errores.hay) {
			req.session.datosAdics = {...datosDuros};
			res.cookie("datosAdics", datosDuros, {maxAge: unDia});
		}
		// Fin
		return res.json(errores);
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
	convierteLetrasAlCastellano: (req, res) => {
		// Obtiene el valor
		let {valor} = req.query;
		// Lo convierte al castellano
		let conversion = comp.convierteLetras.alCastellano_campo(valor);
		// Devuelve el resultado
		return res.json(conversion);
	},

	// Vista (datosAdics)
	validaDatosAdics: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		let errores = await valida.datosAdics(campos, req.query);
		return res.json(errores);
	},
	guardaDatosAdics: (req, res) => {
		let datosAdics = {
			...(req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics),
			...req.query,
		};
		req.session.datosAdics = datosAdics;
		res.cookie("datosAdics", datosAdics, {maxAge: unDia});
		return res.json();
	},

	// Vista (IM)
	averiguaColecciones: async (req, res) => {
		// Obtiene todas las colecciones
		let datos = await BD_genericas.obtieneTodos("colecciones", "nombre_castellano");
		// Deja solamente las que no son de TMDB
		datos = datos.filter((n) => !n.TMDB_id);
		// Deja solamente los campos 'id' y 'nombre_castellano'
		datos = datos.map((m) => {
			return {id: m.id, nombre_castellano: m.nombre_castellano};
		});
		// Fin
		return res.json(datos);
	},
	averiguaCantTemps: async (req, res) => {
		let datos = await BD_genericas.obtienePorId("colecciones", req.query.id).then((n) => n.cant_temps);
		return res.json(datos);
	},

	// Vista (FA)
	validaCopiarFA: (req, res) => {
		let errores = valida.FA(req.query);
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
};
