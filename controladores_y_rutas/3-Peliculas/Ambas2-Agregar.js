// ************ Requires ************
const { validationResult } = require("express-validator");
const searchTMDB = require("../../modelos/funciones/searchTMDB");
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
		req.session.peliculasTMDB = lectura.resultados;
		res.cookie("peliculasTMDB", lectura.resultados, {maxAge: 1000 * 60 * 60});
		return res.redirect("/peliculas/agregar/desambiguar1");
	},
	desambiguarTMDB_Form: (req, res) => {
		let resultados = req.session.peliculasTMDB;
		resultados == "" ? resultados = req.cookies.peliculasTMDB : ""
		return res.send(resultados);
		return res.render("2-Desambiguar1", { resultados });
	},

	agregar2Form: (req, res) => {
		// return res.send(req.session.agregarPelicula.imagen)
		return res.render("Agregar2Form", {
			data_entry: req.session.agregarPelicula,
		});
	},

	agregar2Guardar: (req, res) => {
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
