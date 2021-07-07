// ************ Requires ************
const { validationResult } = require("express-validator");
const searchTMDB = require("../../modelos/funciones/searchTMDB");
const searchFA = require("../../modelos/funciones/searchFA");
const uploadFile = require("../../middlewares/varios/multer");
// uploadFile.single('imagen')

// *********** Controlador ***********
module.exports = {
	responsabilidad: (req, res) => {
		return res.render("0-Responsabilidad");
	},
	palabrasClaveForm: (req, res) => {
		return res.render("1-PalabrasClave");
	},
	contador: async (req, res) => {
		// Obtener 'palabras_clave' y obtener la API
		let { palabras_clave } = req.query;
		let resultados = await searchTMDB.search(palabras_clave);
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
		let lectura = await searchTMDB.search(palabras_clave);
		//return res.send(lectura);
		res.cookie("palabras_clave", lectura.palabras_clave, {
			maxAge: 60 * 60 * 1000,
		});
		req.session.peliculasTMDB = lectura;
		return res.redirect("/peliculas/agregar/desambiguar");
	},
	desambiguarTMDB_Form: (req, res) => {
		let lectura = req.session.peliculasTMDB;
		// return res.send(lectura);
		if (lectura.resultados.length == 0) {
			return res.redirect("/peliculas/agregar/linkFA_Form");
		}
		return res.render("2-Desambiguar", {
			hayMas: lectura.hayMas,
			resultados: lectura.resultados,
			palabras_clave: lectura.palabras_clave,
		});
	},
	desambiguarTMDB_Guardar: async (req, res) => {
		req.session.peliculaTMDB = req.body;
		return res.redirect("/peliculas/agregar/datos_duros");
	},
	linkFA_Form: async (req, res) => {
		let lectura = req.session.peliculasTMDB;
		lectura != undefined
			? (palabras_clave = lectura.palabras_clave)
			: (palabras_clave = req.cookies.palabras_clave);
		return res.render("2-link_FA", {
			palabras_clave: palabras_clave,
		});
	},

	linkFA_Guardar: async (req, res) => {
		// Continuará...
	},

	agregarDurosForm: (req, res) => {
		// return res.send(req.session.agregarPelicula.imagen)
		return res.render("Agregar2Form", {
			data_entry: req.session.agregarPelicula,
		});
	},

	agregarDurosGuardar: (req, res) => {
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

	agregar3Form: (req, res) => {
		return res.render("Agregar3Form", {});
	},

	agregar3Guardar: (req, res) => {
		return res.send("Estoy en guardar3");
	},
};
