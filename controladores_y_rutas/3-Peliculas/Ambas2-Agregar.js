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
		// return res.send(lectura);
		req.session.peliculasTMDB = lectura;
		res.cookie("peliculasTMDB", lectura, { maxAge: 1000 * 60 * 60 });
		return res.redirect("/peliculas/agregar/desambiguar1");
	},
	desambiguarTMDB_Form: (req, res) => {
		let lectura = req.session.peliculasTMDB;
		lectura == "" ? (lectura = req.cookies.peliculasTMDB) : "";
		//return res.send(lectura);
		if (lectura.resultados.length == 0) {
			datos = {
				rubro: "Películas",
				tmdb_id: "-",
				nombre_original: "",
				palabras_clave: lectura.palabras_clave,
			}
			req.session.peliculaTMDB = datos;
			res.cookie("peliculaTMDB", datos, { maxAge: 1000 * 60 * 60 });
			return res.redirect("/peliculas/agregar/desambiguar2");
		}
		return res.render("2-Desambiguar1", {
			hayMas: lectura.hayMas,
			resultados: lectura.resultados,
			palabras_clave: lectura.palabras_clave,
		});
	},
	desambiguarTMDB_Guardar: async (req, res) => {
		req.session.peliculaTMDB = req.body;
		res.cookie("peliculaTMDB", req.body, { maxAge: 1000 * 60 * 60 });
		if (req.body.rubro == "Película") {
			return res.redirect("/peliculas/agregar/desambiguar2");
		}
	},
	desambiguarFA_Form: async (req, res) => {
		let datos = req.session.peliculaTMDB;
		datos == "" ? (datos = req.cookies.peliculaTMDB) : "";
		//return res.send(datos);
		// Obtener la API
		let lectura = await searchFA.search(
			datos.nombre_original, 
			datos.nombre_castellano, 
			datos.palabras_clave,
		);
		return res.send(lectura)
		// Continuará...
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
