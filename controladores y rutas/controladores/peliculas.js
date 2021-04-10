// ************ Requires ************
const fs = require('fs');
const path = require('path')
const {validationResult} = require('express-validator');

// ************ Variables ************
const ruta_nombre_pelis = path.join(__dirname, '../../bases_de_datos/tablas/BDpeliculas.json');
const ruta_nombre_detalle = path.join(__dirname, '../../bases_de_datos/tablas/menuDetalle.json');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function guardar(n, contenido) {fs.writeFileSync(n, JSON.stringify(contenido, null, 2))};

// *********** Controlador ***********
module.exports = {
	altaForm: (req, res) => {
		return res.render('0-Agregar', {
			titulo: "Película - Agregar"
		});
	},

	altaGuardar: (req, res) => {
		const resultValidation = validationResult(req);
		if (resultValidation.errors.length > 0) {
			req.body.comentario = ""
			return res.render("0-Agregar", {
				data_entry: req.body,
				errores: resultValidation.mapped(),
				titulo: "Película - Agregar"
			})
		}
		return res.send("sin errores")
	},

	detalle: (req, res) => {
		// Obtener el código de Método y Película
		let url = req.originalUrl.slice(1)
		let codigoURL = url.slice(url.indexOf("/")+1, url.lastIndexOf("/"))
		let IDpeli = url.slice(url.lastIndexOf("/")+1)
		//return res.send(codigoURL)
		// Obtener el título (rubro + opción)
		let BDdetalle = leer(ruta_nombre_detalle);
		let detalle = BDdetalle.find(n => n.codigo == codigoURL);
		let titulo = detalle.titulo;
		// Obtener la película
		let BD = leer(ruta_nombre_pelis);
		let producto = BD.find(n => n.id == IDpeli);
		// Ir a la vista
		return res.render('0-CRUD', {
			detalle,
			producto,
			IDpeli,
			opcion_objeto: {"grupo": "CRUD"},
			titulo
		});
	},

	editarGuardar: (req, res) => {
		return res.send("Estoy en editarGuardar")
	},
	
	bajaGuardar: (req, res) => {
		return res.send("Estoy en bajaGuardar")
	},

};
