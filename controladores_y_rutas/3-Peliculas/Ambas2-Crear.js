// ************ Requires ************
const { validationResult } = require("express-validator");

// *********** Controlador ***********
module.exports = {
	responsabilidad: (req, res) => {
		return res.render("0-Responsabilidad");
	},

	agregar1Form: (req, res) => {
		return res.render("1-ImportarDatos", {
			rubro: "peliculas",
			titulo: "Película",
		});
	},

	agregar1Guardar: (req, res) => {
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
