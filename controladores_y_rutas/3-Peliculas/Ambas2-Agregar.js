// ************ Requires ************
const { validationResult } = require("express-validator");
const funciones = require("../../modelos/funciones/funciones");
const uploadFile = require("../../middlewares/varios/multer");
// uploadFile.single('imagen')

// *********** Controlador ***********
module.exports = {
	responsabilidad: (req, res) => {
		return res.render("0-Responsabilidad");
	},

	importarDatosForm: (req, res) => {
		return res.render("1-ImportarDatos", {
			titulo: "Película",
		});
	},

	importarDatosGuardar: (req, res) => {
		//Detectar errores de Data Entry
		let erroresValidacion = validationResult(req);
		let existenErrores = erroresValidacion.errors.length > 0;
		if (existenErrores) {
			return res.render("1-ImportarDatos", {
				titulo: "Película",
				palabras_clave: req.body.palabras_clave,
				errores: erroresValidacion.mapped(),
			});
		}
		req.session.importarDatos = req.body;
		return res.redirect("/peliculas/desambiguar1");
	},

	contador1: async (req, res) => {
		// Obtener 'palabras_clave'
		let { palabras_clave } = req.query;
		let palabras = letrasIngles(palabras_clave);
		// Función clave
		let resultados = await funciones.search(palabras);
		// Devolver el resultado
		return res.json(resultados);
	},

	desambiguar1: async (req, res) => {
		// Obtener 'palabras_clave' y ejecutar la rutina
		let palabras_clave = req.session.importarDatos.palabras_clave;
		let palabras = letrasIngles(palabras_clave);
		let resultados = await funciones.search(palabras);
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

let letrasIngles = (palabras_clave) => {
	let palabras = palabras_clave
		.toLowerCase()
		.replace(/-/g, " ")
		.replace(/á/g, "a")
		.replace(/é/g, "e")
		.replace(/í/g, "i")
		.replace(/ó/g, "o")
		.replace(/ú/g, "u")
		.replace(/ü/g, "u")
		.replace(/ñ/g, "n");
	return palabras;
};
