// ************ Requires ************
const fs = require('fs');
const path = require('path')
const {validationResult} = require('express-validator');

// ************ Variables ************
// const ruta_nombre_pelis = path.join(__dirname, '../../bases_de_datos/tablas/BDpeliculas.json');
const ruta_nombre_detalle = path.join(__dirname, '../../bases_de_datos/tablas/menuDetalle.json');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// *********** Controlador ***********
module.exports = {
	responsabilidad: (req,res) => {
		return res.render("0-Responsabilidad");
	},

	altaForm1: (req, res) => {
        // Obtener el código de Película o Colección
        let url = req.originalUrl.slice(1);
        let rubro = url.slice(0, url.indexOf("/"));
		rubro == "peliculas" ? titulo = "Película" : titulo = "Colección"
        return res.render("1-ImportarDatos", {
			rubro,
			titulo,
		});
    },

    altaGuardar1: (req,res) => {
		//Detectar errores de Data Entry
		const erroresValidacion = validationResult(req);
		if (req.body.demasiadosResultados) {erroresValidacion.errors.push({"msg": "Se encontraron demasiados resultados. Por favor refiná la búsqueda, incluyendo alguna palabra clave más","param": "palabras_clave","location": "body"})}
		if (req.body.noSeEncuentraLaPeli) {erroresValidacion.errors.push({"msg": "No se encontró ninguna película con estas palabras clave","param": "palabras_clave","location": "body"})}
        let existenErrores = erroresValidacion.errors.length > 0;
        if (existenErrores) {
			return res.render("1-ImportarDatos", {
				data_entry: req.body,
				errores: erroresValidacion.mapped(),
			})
		}
		req.session.agregarPelicula = req.body
		return res.redirect("/peliculas/agregar2")
    },

	altaForm2: (req, res) => {
        // return res.send(req.session.agregarPelicula.imagen)
		return res.render('AgregarForm2', {
            data_entry: req.session.agregarPelicula,
        });
	},

	altaGuardar2: (req, res) => {
		const erroresValidacion = validationResult(req);
        //return res.send(erroresValidacion)
		if (erroresValidacion.errors.length > 0) {
			return res.render("AgregarForm2", {
				data_entry: req.body,
				errores: erroresValidacion.mapped(),
			})
		}
		return res.send("sin errores")
	},

    altaForm3: (req, res) => {
		return res.render('AgregarForm3', {
		});
	},

    altaGuardar3: (req,res) => {
        return res.send("Estoy en guardar3")
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
