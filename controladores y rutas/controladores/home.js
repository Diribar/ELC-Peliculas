// ************ Requires ************
const fs = require('fs');
const path = require('path');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/tablas/titulosELC.json');

// *********** Controlador ***********
module.exports = {

	home: (req,res) => {
		return res.redirect("home")
	},

	main: (req,res) => { // HOME - QUIÉNES SOMOS - CONTÁCTANOS
		url = req.params.id;
		const BD = leer(ruta_nombre);
		const pagina = BD.find(n => n.url == url)
		res.render("0-Home", {
			titulo: pagina.titulo,
		})
	},
};
