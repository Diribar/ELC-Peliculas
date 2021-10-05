// ************ Requires ************
let path = require("path");
let buscar_x_PalClave = require("../../funciones/PROD-buscar_x_PC");
let procesarProductos = require("../../funciones/PROD-procesar");
let validarProductos = require("../../funciones/PROD-validar");
let BD_peliculas = require("../../funciones/BD/peliculas");
let BD_colecciones = require("../../funciones/BD/colecciones");
let BD_varios = require(path.join(__dirname, "../../funciones/BD/varios"));

// *********** Controlador ***********
module.exports = {
	responsabilidad: (req, res) => {
		tema = "agregar";
		codigo = "responsabilidad";
		return res.render("Home", { tema, codigo });
	},
	palabrasClaveForm: (req, res) => {
		tema = "agregar";
		codigo = "palabrasClave";
		let palabras_clave = req.session.palabras_clave
			? req.session.palabras_clave
			: req.cookies.palabras_clave
			? req.cookies.palabras_clave
			: "";
		let errores = req.session.errores ? req.session.errores : false;
		return res.render("Home", {
			tema,
			codigo,
			autorizado_fa: req.session.usuario.autorizado_fa,
			link: req.originalUrl,
			palabras_clave,
			errores,
		});
	},
	palabrasClaveGuardar: async (req, res) => {
		// Averiguar si hay errores de validación
		let palabras_clave = req.body.palabras_clave;
		let errores = await validarProductos.palabrasClave(palabras_clave);
		// Si hay errores
		if (errores.palabras_clave) {
			tema = "agregar";
			codigo = "palabrasClave";
			return res.redirect("/peliculas/agregar/palabras-clave");
		}
		// Eliminar el campo 'fuente' de 'datos de cabecera' de desambiguarTMDB anteriores
		res.clearCookie("fuente");
		// Guardar las palabras clave en session y cookie
		req.session.palabras_clave = palabras_clave;
		res.cookie("palabras_clave", palabras_clave, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// Obtener la API
		req.session.peliculasTMDB = await buscar_x_PalClave.search(palabras_clave);
		// return res.send(req.session.peliculasTMDB);
		return res.redirect("/peliculas/agregar/desambiguar");
	},
	desambiguarTMDB_Form: async (req, res) => {
		tema = "agregar";
		codigo = "desambiguar";
		// Obtener la API de 'search'
		let lectura = req.session.peliculasTMDB;
		lectura == undefined
			? (lectura = await buscar_x_PalClave.search(req.cookies.palabras_clave))
			: "";
		resultados = lectura.resultados;
		coincidencias = resultados.length;
		let prod_nuevos = resultados.filter((n) => n.YaEnBD == false);
		let prod_yaEnBD = resultados.filter((n) => n.YaEnBD != false);
		return res.render("Home", {
			tema,
			codigo,
			hayMas: lectura.hayMas,
			coincidencias,
			prod_nuevos,
			prod_yaEnBD,
			palabras_clave: lectura.palabras_clave,
			habilitarFlechaDerechaConLink: !!req.cookies.fuente,
			link: req.originalUrl,
		});
	},
	desambiguarTMDB_Guardar: async (req, res) => {
		// Obtener la info para exportar a la vista 'Datos Duros'
		req.session.datosDuros =
			req.body.fuente == "TMDB"
				? await obtenerDatosDelProductoTMDB(req.body)
				: req.body;
		// return res.send(req.session.datosDuros);
		// Borrar cookies y grabar los nuevos con la info del producto
		actualizarCookiesProductos(res, req.session.datosDuros);
		// Redireccionar a Datos Duros
		return res.redirect("/peliculas/agregar/datos-duros");
	},
	copiarFA_Form: (req, res) => {
		tema = "agregar";
		codigo = "copiarFA";
		let data_entry = req.session.data_entry
			? req.session.data_entry
			: false;
		let errores = req.session.errores ? req.session.errores : false;
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
			errores,
		});
	},
	copiarFA_Guardar: async (req, res) => {
		// Averiguar si hay errores de validación
		let errores = await validarProductos.copiarFA(req.body);
		// Si hay errores
		if (errores.hay) {
			tema = "agregar";
			codigo = "palabrasClave";
			req.session.data_entry = req.body;
			req.session.errores = errores;
			return res.redirect("/peliculas/agregar/copiar-fa");
		}

		//return res.send(req.body)
		req.session.datosDuros = await procesarProductos.producto_FA(
			req.body
		);
		//return res.send(req.session.datosDuros);
		// Grabar cookies con la info del producto
		actualizarCookiesProductos(res, req.session.datosDuros);
		// Redireccionar a Datos Duros
		return res.redirect("/peliculas/agregar/datos-duros");
	},
	yaEnBD_Form: (req, res) => {
		return res.send("La Película / Colección ya está en nuestra BD");
	},
	datosDurosForm: async (req, res) => {
		tema = "agregar";
		codigo = "datosDuros";
		//return res.send(req.session.datosDuros);
		let paises = await BD_varios.ObtenerTodos("paises", "nombre");
		//return res.send(req.cookies);
		!req.session.datosDuros ? (req.session.datosDuros = req.cookies) : "";
		let errores = req.session.errores
			? req.session.errores
			: await validarProductos.datosDuros(req.session.datosDuros);
		let data_entry = req.session.data_entry
			? req.session.data_entry
			: false;
		//return res.send(errores)
		return res.render("Home", {
			tema,
			codigo,
			data_entry: req.session.datosDuros,
			paises,
			link: req.originalUrl,
			errores,
		});
	},
	ddGuardar: async (req, res) => {
		errores = await validarProductos.datosDuros(req.query);
		return res.send("linea 147")
		if (erroresValidacion.errors.length > 0) {
			tema = "agregar";
			codigo = "datosDuros";
			let paises = await BD_varios.ObtenerTodos("paises", "nombre");
			return res.render("Home", {
				tema,
				codigo,
				data_entry: req.body,
				paises,
				link: req.originalUrl,
				errores: erroresValidacion.mapped(),
			});
		}
		return res.send("sin errores");
	},
	DatosPersForm: (req, res) => {
		tema = "agregar";
		codigo = "datosPersonalizados";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
		});
	},

	DatosPersGuardar: (req, res) => {
		return res.send("Estoy en guardar3");
	},
};

let obtenerDatosDelProductoTMDB = async (form) => {
	// API Details
	let lectura =
		form.fuente == "TMDB"
			? await procesarProductos.obtenerAPI(form.tmdb_id, form.rubroAPI)
			: {};
	// Obtener la info para la vista 'Datos Duros'
	form.rubroAPI == "movie"
		? (rubro = "pelicula_TMDB")
		: form.rubroAPI == "tv"
		? (rubro = "TV_TMDB")
		: form.rubroAPI == "collection"
		? (rubro = "coleccion_TMDB")
		: "";
	let resultado = await procesarProductos[rubro](form, lectura);
	return resultado;
};

let actualizarCookiesProductos = async (res, producto) => {
	// Obtener los campos
	modelo =
		rubroAPI == "movie"
			? await BD_peliculas.ObtenerPorID(0)
			: await BD_colecciones.ObtenerPorID(0);
	campos = Object.keys(modelo);
	console.log(campos)
	// Borrar cookies de producto viejo
	for (campo of campos) {
		res.clearCookie(campo);
	}
	// Agregar cookies de producto nuevo
	campos = Object.keys(producto);
	valores = Object.values(producto);
	for (let i = 0; i < campos.length; i++) {
		res.cookie(campos[i], valores[i], { maxAge: 1000 * 60 * 60 });
	}
};
