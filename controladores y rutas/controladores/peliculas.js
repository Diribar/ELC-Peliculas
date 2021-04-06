// ************ Requires ************
const fs = require('fs');
const path = require('path')

// ************ Variables ************
const ruta_nombre_pelis = path.join(__dirname, '../../bases_de_datos/tablas/BDpeliculas.json');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function guardar(n, contenido) {fs.writeFileSync(n, JSON.stringify(contenido, null, 2))};

// *********** Controlador ***********
module.exports = {
	altaForm: (req, res) => {
		return res.redirect("/peliculas/detalle/1")
		return res.render('formAlta');
	},

	altaGuardar: (req, res) => {
		return res.send("Estoy en altaGuardar")
	},

	detalle: (req, res) => {
		let BD = leer(ruta_nombre_pelis);
		let producto = BD.find(n => n.id == req.params.id);
		return res.render('10-PEL-CRUD', {
			producto,
			opcion_objeto: {"grupo": "CRUD"},
			titulo: "Películas - Detalle"
		});
	},
	editarForm: (req, res) => {
		return res.send("Estoy en editarForm")
	},

	editarGuardar: (req, res) => {
		return res.send("Estoy en editarGuardar")
	},
	
	baja: (req, res) => {
		return res.send("Estoy en baja")
	},
};
