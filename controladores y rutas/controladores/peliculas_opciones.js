// ************ Requires ************
const fs = require('fs');
const path = require('path')


// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// ************ Variables ************
const ruta_nombre_opciones = path.join(__dirname, '../../bases_de_datos/opciones_pelis.json');
const ruta_nombre_pelis = path.join(__dirname, '../../bases_de_datos/peliculas.json');

// *********** Controlador ***********
module.exports = {
	home: (req,res) => {
		res.redirect("/peliculas/listado")
	},

	listado: (req, res) => {
		let código = "listado"
		let BD_opciones = leer(ruta_nombre_opciones);
		let opción_elegida = BD_opciones.find(n => n.código == código);
		let título = opción_elegida.título;
		let BD_pelis = leer(ruta_nombre_pelis);
		res.render('0-PlantillaPelis', {título, opción_elegida, BD_opciones, BD_pelis});
	},

	cfc: (req, res) => {
		let código = "cfc"
		let BD_opciones = leer(ruta_nombre_opciones);
		let opción_elegida = BD_opciones.find(n => n.código == código);
		let título = opción_elegida.título;
		let BD_pelis = leer(ruta_nombre_pelis);
		res.render('0-PlantillaPelis', {título, opción_elegida, BD_opciones, BD_pelis});
	},

	vpc: (req, res) => {
		let código = "vpc"
		let BD_opciones = leer(ruta_nombre_opciones);
		let opción_elegida = BD_opciones.find(n => n.código == código);
		let título = opción_elegida.título;
		let BD_pelis = leer(ruta_nombre_pelis);
		res.render('0-PlantillaPelis', {título, opción_elegida, BD_opciones, BD_pelis});
	},

	cfcID: (req, res) => {
		res.send("cfc-submenú");
	},
	vpcID: (req, res) => {
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

