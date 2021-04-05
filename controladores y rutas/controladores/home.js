// ************ Requires ************
const fs = require('fs');
const path = require('path');

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/tablas/titulosELC.json');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// *********** Controlador ***********
module.exports = {

	home: (req,res) => {
		return res.redirect("home")
	},

	main: (req,res) => { // HOME - QUIÉNES SOMOS - CONTÁCTANOS
		url = req.params.id;
		let BD = leer(ruta_nombre);
		let pagina = BD.find(n => n.url == url)
		let titulo = pagina.titulo
		return res.render("0-Home", {
			pagina,
			titulo: "Home"
		})
	},
};
