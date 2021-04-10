// ************ Requires ************
const fs = require('fs');
const path = require('path');

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/tablas/institucional.json');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// *********** Controlador ***********
module.exports = {

	main: (req,res) => { // HOME - QUIÉNES SOMOS - CONTÁCTANOS
		url = req.params.id;
		let BD = leer(ruta_nombre);
		let vista = BD.find(n => n.url == url)
		let titulo = vista.titulo
		let nombre = vista.nombre
		return res.render("0-Institucional", {
			nombre,
			titulo,
		})
	},

	home: (req,res) => {
		return res.redirect("/peliculas")
	},

};
