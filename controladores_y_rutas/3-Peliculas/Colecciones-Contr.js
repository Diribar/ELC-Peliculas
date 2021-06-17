// ************ Requires ************
const {validationResult} = require('express-validator');

// ************ Obsoleto ************
//const ruta_nombre_detalle = path.join(__dirname, '../../bases_de_datos/tablas/menuDetalle.json');
//function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// *********** Controlador ***********
module.exports = {
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
