// ************ Requires ************
const fs = require('fs');
const path = require('path');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/titulosELC.json');

// *********** Controlador ***********
module.exports = {
	home: (req,res) => {
		res.redirect("home")
	},
	main: (req,res) => { //* HOME - QUIÉNES SOMOS - CONTÁCTANOS
		url = req.params.id
		let BD = leer(ruta_nombre);
		let pagina = BD.find((n) => {return n.url == url})
		let titulo = pagina.titulo
		res.render("10-Plantilla-Home", {titulo})
	},
};
