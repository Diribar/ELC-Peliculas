// ************ Requires ************
const fs = require('fs');
const path = require('path')
const {validationResult} = require('express-validator');
const peliculas = require('../../modelos/peliculas');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function guardar(rutaNombre, Contenido) {fs.writeFileSync(rutaNombre, JSON.stringify(Contenido, null, 2))};
function limpiarNumero(n) {{n.replace(".", "").replace(",", ".").replace("$", "").replace(" ", "")}}

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/tablas/peliculas_BD.json');

// *********** Controlador ***********
module.exports = {
	altaForm: (req, res) => {
		return res.redirect("/peliculas/editar/1")
		return res.render('formAlta');
	},

	altaGuardar: (req, res) => {
		return res.send("Estoy en altaGuardar")
	},

	detalle: (req, res) => {
		return res.send("Estoy en detalle")
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
