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
		return res.render("1-IngresarPalabrasClave");
	},
	contador: async (req, res) => {
		// Obtener 'palabras_clave' y obtener la API
		let { palabras_clave } = req.query;
		let resultados = await searchTMDB.search(palabras_clave);
		// Enviar la API
		return res.json(resultados);
	},
	palabrasClaveGuardar: (req, res) => {
		//Detectar errores de Data Entry
		let erroresValidacion = validationResult(req);
		let existenErrores = erroresValidacion.errors.length > 0;
		if (existenErrores) {
			return res.render("1-IngresarPalabrasClave", {
				palabras_clave: req.body.palabras_clave,
				errores: erroresValidacion.mapped(),
			});
		}
		req.session.ingresarPalabrasClave = req.body;
		return res.redirect("/peliculas/desambiguar1");
	},
	desambiguarTMDB_Form: async (req, res) => {
		// Obtener 'palabras_clave' y obtener la API
		let palabras_clave = req.session.ingresarPalabrasClave.palabras_clave;
		let resultados = await searchTMDB.search(palabras_clave);
		// Redireccionar
		return res.send(resultados);
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
