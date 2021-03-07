// ************ Requires ************
const fs = require('fs');
const path = require('path')


// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/peliculas.json');

// *********** Controlador ***********
module.exports = {
	listado: (req, res) => {
		let título = "Películas-Listado";
		let grupo = "Opciones"
		let BD = leer(ruta_nombre);
		res.render('0-PlantillaPelis', {título, grupo, BD});
	},
	cfc: (req, res) => {
		res.send("cfc");
	},
	cfcid: (req, res) => {
		res.send("cfc-submenú");
	},
	vpc: (req, res) => {
		res.send("vpc");
	},
	vpcid: (req, res) => {
		res.send("vpc-submenú");
	},
	filtros: (req,res) => {
		return res.send("Filtros")
		//	let user_entry = req.query;
		//	let results = [];
		//	for (let i=0; i < pelis.length; i++) {
		//		if (BD[i].nombre.toLowerCase().includes(user_entry.palabras_clave.toLowerCase())) {
		//			results.push(BD[i])
		//		}
		//	};
		//	res.send(results);
		//	res.render('página-de-resultados', results);
	},
};

