// ************ Requires ************
const fs = require('fs');
const path = require('path')
const {validationResult} = require('express-validator');
const Registro = require('../modelos/Registro');

// ************ Funciones ************
function LeerArchivo(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function GuardarArchivo(RutaNombre, Contenido) {
    fs.writeFileSync(RutaNombre, JSON.stringify(Contenido, null, 2))};

// ************ Variables ************
const Ruta_y_Nombre_de_Archivo = path.join(__dirname, '../../bases_de_datos/peliculas.json');

// *********** Controlador ***********
module.exports = {
	home: (req,res) => {
		let título = "Películas";
		res.render('ECC', {título});
	},
	listado: (req, res) {
		const BD = LeerArchivo(Ruta_y_Nombre_de_Archivo);
		res.render('listado', {BD});
	},
	//filtros: (req,res) => {
	//	let user_entry = req.query;
	//	let results = [];
	//	for (let i=0; i < pelis.length; i++) {
	//		if (BD[i].nombre.toLowerCase().includes(user_entry.palabras_clave.toLowerCase())) {
	//			results.push(BD[i])
	//		}
	//	};
	//	res.send(results);
	//	res.render('página-de-resultados', results);
	//}

};

