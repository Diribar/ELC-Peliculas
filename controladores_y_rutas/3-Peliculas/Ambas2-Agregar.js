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

	ImportarDatosForm: (req, res) => {
		return res.render("1-ImportarDatos", {
			rubro: "peliculas",
			titulo: "Película",
		});
	},

	ImportarDatosGuardar: (req, res) => {
		//Detectar errores de Data Entry
		let erroresValidacion = validationResult(req);
		let existenErrores = erroresValidacion.errors.length > 0;
		let rubro = req.body.rubro;
		rubro == "peliculas" ? (titulo = "Película") : (titulo = "Colección");
		if (existenErrores) {
			return res.render("1-ImportarDatos", {
				rubro,
				titulo,
				data_entry: req.body.data_entry,
				errores: erroresValidacion.mapped(),
			});
		}
		req.session.importarDatos = req.body.data_entry;
		return res.redirect("/" + rubro + "/desambiguar");
	},

	desambiguarForm: async (req, res) => {
		// Identificar si es una colección o Película
		let url = req.originalUrl.slice(1);
		let rubro = url.slice(0, url.indexOf("/"));
		let palabras_clave = req.session.importarDatos;
		if (rubro = "colecciones") {
			let colecciones = await funcionesAPI.buscarTitulos(
				palabras_clave,
				"collection"
			);
			return res.send(colecciones)
			res.send(resultados)
		};
	},

	contador: async (req, res) => {
		let { palabras_clave, rubro } = req.query;
		let palabras = palabras_clave.replace(/-/g, " ");
		let contador = await funcionesAPI.contador(palabras, rubro)
		return res.json(contador);
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
