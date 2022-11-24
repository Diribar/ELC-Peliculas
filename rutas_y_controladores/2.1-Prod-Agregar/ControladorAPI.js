"use strict";
// Definir variables
const path = require("path");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const buscar_x_PC = require("./FN-Buscar_x_PC");
const procesos = require("./FN-Procesos");
const valida = require("./FN-Validar");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

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
		let datos = JSON.parse(req.query.datos);
		// Obtiene más información del producto
		let infoTMDBparaDD = await procesos["DS_" + datos.TMDB_entidad](datos);
		// Fin
		return res.json(infoTMDBparaDD);
	},
	desambGuardar2: async (req, res) => {
		let datos = JSON.parse(req.query.datos);
		// Averigua si es una película y pertenece a una colección
		let errores = await valida.averiguaSiEsColeccion(datos);
		// Fin
		return res.json(errores);
	},
	desambGuardar3: async (req, res) => {
		let errores = JSON.parse(req.query.datos);
		// Si pertenece a una colección de la BD, la agrega y avisa
		let productos = await procesos.agregaCapitulosNuevos(errores.en_colec_id, errores.colec_TMDB_id);
		// Fin
		return res.json(productos);
	},
	desambGuardar4: async (req, res) => {
		let errores = JSON.parse(req.query.datos);
		// Si pertenece a una colección que no existe en la BD, avisa
		let coleccion = await procesos.DS_collection({TMDB_id: errores.colec_TMDB_id});
		// Fin
		return res.json(coleccion);
	},
	desambGuardar5: async (req, res) => {
		// Variables
		let datosDuros = JSON.parse(req.query.datos);
		// Acciones si el campo 'avatar' tiene un valor
		if (datosDuros.avatar) {
			// Variables
			datosDuros.avatar_url = datosDuros.avatar;
			datosDuros.avatar = Date.now() + path.extname(datosDuros.avatar_url);
			// Descarga el avatar
			// let datos = await requestPromise.head(datosDuros.avatar_url);
			// let tipo = datos["content-type"];
			// let tamano = datos["content-length"];
			let rutaYnombre = "./publico/imagenes/9-Provisorio/" + datosDuros.avatar;
			await comp.descarga(datosDuros.avatar_url, rutaYnombre);
		}
		// Elimina el campo avatar
		else delete datosDuros.avatar;
		// Fin
		return res.json(datosDuros);
	},
	desambGuardar6: async (req, res) => {
		let datosDuros = JSON.parse(req.query.datos);
		// Guarda los datos originales en una cookie
		let datosOriginales = {...datosDuros};
		if (datosOriginales.avatar_url) datosOriginales.avatar = datosOriginales.avatar_url;
		else delete datosOriginales.avatar;
		delete datosOriginales.avatar_url;
		res.cookie("datosOriginales", datosOriginales, {maxAge: unDia});
		// Averigua si falta completar algún campo de Datos Duros
		let camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad]);
		let camposDD_nombres = camposDD.map((n) => n.nombre);
		let errores = await valida.datosDuros(camposDD_nombres, datosDuros);
		// Genera la session y cookie para DatosDuros
		req.session.datosDuros = {...datosDuros};
		res.cookie("datosDuros", datosDuros, {maxAge: unDia});
		// Genera la session y cookie para datosPers
		if (!errores.hay) {
			req.session.datosPers = {...datosDuros};
			res.cookie("datosPers", datosDuros, {maxAge: unDia});
		}
		// Fin
		return res.json(errores);
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
