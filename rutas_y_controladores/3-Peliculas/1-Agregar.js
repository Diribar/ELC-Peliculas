// ************ Requires ************
const { validationResult } = require("express-validator");
const search_TMDB_funcion = require("../../modelos/API/search_TMDB_funcion");
const details_TMDB_funcion = require("../../modelos/API/details_TMDB_funcion");
const funciones = require("../../modelos/funciones");
const uploadFile = require("../../middlewares/varios/multer");
// uploadFile.single('imagen')

// *********** Controlador ***********
module.exports = {
	responsabilidad: (req, res) => {
		return res.render("0-Responsabilidad");
	},
	palabrasClaveForm: (req, res) => {
		let rol_usuario_id = req.session.usuario.rol_usuario_id;
		return res.render("1-PalabrasClave", {rol_usuario_id});
	},
	contador: async (req, res) => {
		// Obtener 'palabras_clave' y obtener la API
		let { palabras_clave } = req.query;
		let resultados = await search_TMDB_funcion.search(palabras_clave);
		// Enviar la API
		return res.json(resultados);
	},
	palabrasClaveGuardar: async (req, res) => {
		//Detectar errores de Data Entry
		let erroresValidacion = validationResult(req);
		let existenErrores = erroresValidacion.errors.length > 0;
		let palabras_clave = req.body.palabras_clave;
		if (existenErrores) {
			return res.render("1-PalabrasClave", {
				palabras_clave,
				errores: erroresValidacion.mapped(),
			});
		}
		// Obtener la API
		let lectura = await search_TMDB_funcion.search(palabras_clave);
		//return res.send(lectura);
		res.cookie("palabras_clave", lectura.palabras_clave, {
			maxAge: 60 * 60 * 1000,
		});
		req.session.peliculasTMDB = lectura;
		return res.redirect("/peliculas/agregar/desambiguar");
	},
	desambiguarTMDB_Form: async (req, res) => {
		let lectura = req.session.peliculasTMDB;
		lectura == undefined
			? (lectura = await search_TMDB_funcion.search(req.cookies.palabras_clave))
			: "";
		// return res.send(lectura);
		return res.render("2-Desamb_TMDB", {
			hayMas: lectura.hayMas,
			resultados: lectura.resultados,
			palabras_clave: lectura.palabras_clave,
		});
	},
	desambiguarTMDB_Guardar: async (req, res) => {
		// Grabar cookies con la info del formulario
		let campos = Object.keys(req.body);
		let valores = Object.values(req.body);
		for (let i = 0; i < campos.length; i++) {
			res.cookie(campos[i], valores[i], { maxAge: 60 * 60 * 1000 });
		}
		// Obtener la info para exportar a la vista 'Datos Duros'
		req.session.datosDuros = await obtenerDatosDelProducto(req.body);
		// Redireccionar a Datos Duros
		return res.redirect("/peliculas/agregar/datos_duros");
	},

	copiarFA_Form: async (req, res) => {
		return res.render("2-Copiar_FA");
	},

	procesarcopiado: (req, res) => {
		let { contenido } = req.query;
		let matriz = contenido.split("\n");
		let resultado = funciones.textareaFA(matriz);
		//console.log("línea 77");
		//console.log(resultado);
		// Enviar la API
		return res.json(resultado);
	},

	copiarFA_Guardar: async (req, res) => {
		let { contenido } = req.body;
		let matriz = contenido.split("\r\n");
		let resultado = funciones.textareaFA(matriz);
		console.log("línea 88");
		console.log(resultado);
		// Continuará...
		// req.session.peliculaFA = req.body;
		// res.cookie("fuente", "FA", { maxAge: 60 * 60 * 1000 });
		res.send(resultado)
		//return res.redirect("/peliculas/agregar/datos_duros");
	},

	datosDuros_Form: (req, res) => {
		return res.send(req.session.datosDuros);
		return res.render("Agregar2Form", {
			data_entry: req.session.agregarPelicula,
		});
	},

	datosDuros_Guardar: (req, res) => {
		const erroresValidacion = validationResult(req);
		//return res.send(erroresValidacion)
		if (erroresValidacion.errors.length > 0) {
			return res.render("Agregar2Form", {
				data_entry: req.body,
				errores: erroresValidacion.mapped(),
			});
		}
		return res.send("sin errores");
	},

	DatosPersForm: (req, res) => {
		return res.render("Agregar3Form", {});
	},

	DatosPersGuardar: (req, res) => {
		return res.send("Estoy en guardar3");
	},
};

const obtenerDatosDelProducto = async (form) => {
	// API Details
	let lectura =
		(form.fuente == "TMDB")
			? await details_TMDB_funcion.API(form.tmdb_id, form.rubroAPI)
			: {};
	// Obtener la info para la vista 'Datos Duros'
	form.rubroAPI == "movie" ? (rubro = "procesarPelicula_TMDB") : "";
	form.rubroAPI == "tv" ? (rubro = "procesarTV_TMDB") : "";
	form.rubroAPI == "collection" ? (rubro = "procesarColeccion_TMDB") : "";

	let resultado = await details_TMDB_funcion[rubro](form, lectura);
	return resultado;
}
