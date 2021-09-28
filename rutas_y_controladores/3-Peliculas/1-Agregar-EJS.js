// ************ Requires ************
const path = require("path");
const { validationResult } = require("express-validator");
const searchTMDB = require("../../funciones/searchTMDB");
const procesarDetalles = require("../../funciones/procesarDetalles");
const BD_varios = require(path.join(
	__dirname,
	"../../funciones/base_de_datos/BD_varios"
));
const validarProductos = require("../../funciones/validarProductos");

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
		let autorizado_fa = req.session.usuario.autorizado_fa;
		let palabras_clave = req.session.palabras_clave;
		!palabras_clave ? (palabras_clave = req.cookies.palabras_clave) : "";
		return res.render("Home", {
			tema,
			codigo,
			autorizado_fa,
			palabras_clave,
			link: req.originalUrl,
		});
	},
	palabrasClaveGuardar: async (req, res) => {
		//Detectar errores de Data Entry
		let erroresValidacion = validationResult(req);
		let existenErrores = erroresValidacion.errors.length > 0;
		let palabras_clave = req.body.palabras_clave;
		if (existenErrores) {
			tema = "agregar";
			codigo = "palabrasClave";
			return res.render("Home", {
				tema,
				codigo,
				palabras_clave,
				errores: erroresValidacion.mapped(),
				link: req.originalUrl,
			});
		}
		// Eliminar el campo 'fuente' de 'datos de cabecera' de desambiguarTMDB anteriores
		res.clearCookie("fuente");
		// Guardar las palabras clave en session y cookie
		req.session.palabras_clave = palabras_clave;
		res.cookie("palabras_clave", palabras_clave, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// Obtener la API
		req.session.peliculasTMDB = await searchTMDB.search(palabras_clave);
		// return res.send(req.session.peliculasTMDB);
		return res.redirect("/peliculas/agregar/desambiguar");
	},
	desambiguarTMDB_Form: async (req, res) => {
		tema = "agregar";
		codigo = "desambiguar";
		// Obtener la API de 'search'
		let lectura = req.session.peliculasTMDB;
		lectura == undefined
			? (lectura = await searchTMDB.search(req.cookies.palabras_clave))
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
		req.session.datosDuros = await obtenerDatosDelProducto(req.body);
		// Grabar cookies con la info del producto
		actualizarCookiesProductos(res, req.session.datosDuros, camposProducto);
		// Redireccionar a Datos Duros
		return res.redirect("/peliculas/agregar/datos_duros");
	},
	copiarFA_Form: (req, res) => {
		tema = "agregar";
		codigo = "copiarFA";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
		});
	},
	copiarFA_Guardar: async (req, res) => {
		// Obtener la info para exportar a la vista 'Datos Duros'
		//return res.send(req.body)
		req.session.datosDuros = await procesarDetalles.procesarProducto_FA(
			req.body
		);
		//return res.send(req.session.datosDuros);
		// Grabar cookies con la info del producto
		actualizarCookiesProductos(res, req.session.datosDuros, camposProducto);
		// Redireccionar a Datos Duros
		return res.redirect("/peliculas/agregar/datos_duros");
	},
	yaEnBD_Form: (req, res) => {
		return res.send("La Película / Colección ya está en nuestra BD");
	},
	datosDuros_Form: async (req, res) => {
		tema = "agregar";
		codigo = "datosDuros";
		//return res.send(req.session.datosDuros);
		let paises = await BD_varios.ObtenerTodos("paises", "nombre");
		//return res.send(req.cookies);
		!req.session.datosDuros ? (req.session.datosDuros = req.cookies) : "";
		errores = await validarProductos.validarDatosDuros(req.session.datosDuros);
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

	datosDuros_Guardar: async (req, res) => {
		const erroresValidacion = validationResult(req);
		//return res.send(erroresValidacion)
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

let obtenerDatosDelProducto = async (form) => {
	// API Details
	let lectura =
		form.fuente == "TMDB"
			? await procesarDetalles.API(form.tmdb_id, form.rubroAPI)
			: {};
	// Obtener la info para la vista 'Datos Duros'
	form.rubroAPI == "movie" ? (rubro = "procesarPelicula_TMDB") : "";
	form.rubroAPI == "tv" ? (rubro = "procesarTV_TMDB") : "";
	form.rubroAPI == "collection" ? (rubro = "procesarColeccion_TMDB") : "";
	let resultado = await procesarDetalles[rubro](form, lectura);
	return resultado;
};

let actualizarCookiesProductos = (res, producto, campos) => {
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

let camposProducto = [
	"fuente",
	"rubroAPI",
	"tmdb_id",
	"fa_id",
	"imdb_id",
	"coleccion_tmdb_id",
	"nombre_original",
	"nombre_castellano",
	"idioma_original",
	"ano_estreno",
	"ano_fin",
	"partes",
	"duracion",
	"pais_id",
	"director",
	"guion",
	"musica",
	"productor",
	"actores",
	"avatar",
	"sinopsis",
];
