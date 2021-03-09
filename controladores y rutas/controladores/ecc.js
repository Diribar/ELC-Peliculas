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
		let título="Home"
		res.render("0-PlantillaUsuarios", {título});
	},
	main: (req,res) => { //* HOME - QUIÉNES SOMOS - CONTÁCTANOS
		url = req.params.id
		let BD = leer(ruta_nombre);
		let pagina = BD.find((n) => {return n.url == url})
		let título = pagina.título
		res.render('0-PlantillaUsuarios', {título})
	},
};
