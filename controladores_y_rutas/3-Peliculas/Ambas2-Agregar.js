// ************ Requires ************
const { validationResult } = require("express-validator");
const funcionesAPI = require("../../modelos/funciones/funcionesAPI");
const uploadFile = require("../../middlewares/varios/multer");
// uploadFile.single('imagen')

// *********** Controlador ***********
module.exports = {
	responsabilidad: (req, res) => {
		return res.render("0-Responsabilidad");
	},

	importarDatosForm: (req, res) => {
		return res.render("1-ImportarDatos", {
			rubro: "peliculas",
			titulo: "Película",
		});
	},

	importarDatosGuardar: (req, res) => {
		//Detectar errores de Data Entry
		let erroresValidacion = validationResult(req);
		let existenErrores = erroresValidacion.errors.length > 0;
		let rubro = req.body.rubro;
		rubro == "peliculas" ? (titulo = "Película") : (titulo = "Colección");
		if (existenErrores) {
			return res.render("1-ImportarDatos", {
				rubro,
				titulo,
				palabras_clave: req.body.palabras_clave,
				errores: erroresValidacion.mapped(),
			});
		}
		req.session.importarDatos = req.body;
		return res.redirect("/" + rubro + "/desambiguar1");
	},

	desambiguar1: async (req, res) => {
		// OBTENER LOS LISTADOS *****************
		// return res.send(req.session.importarDatos);
		let rubro = req.session.importarDatos.rubro;
		let palabras_clave = req.session.importarDatos.palabras_clave;
		rubro == "colecciones"
			? (resultados = await funcionesAPI.searchCollection(palabras_clave))
			: rubro == "peliculas"
				? (resultados = await funcionesAPI.searchMovie(palabras_clave))
				: "";
		return res.send(resultados);
	},

	desambiguarForm: async (req, res) => {
		// Identificar si es una colección o Película
		//return res.send(req.session.importarDatos);
		let rubro = req.session.importarDatos.rubro;
		let palabras_clave = req.session.importarDatos.palabras_clave;
		rubro = "colecciones"
			? (resultados = await funcionesAPI.searchCollection(palabras_clave))
			: "";
		rubro = "peliculas"
			? (resultados = await funcionesAPI.searchMovie(palabras_clave))
			: "";
		return res.send(resultados);
	},

	contador: async (req, res) => {
		let { palabras_clave, rubro } = req.query;
		let palabras = palabras_clave.replace(/-/g, " ");
		//let { nuevas, yaEnBD } = await funcionesAPI.search(palabras, rubro);
		//return res.json(nuevas, yaEnBD);
		let { resultado } = await funcionesAPI.search(palabras, rubro);
		return resultado;
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
