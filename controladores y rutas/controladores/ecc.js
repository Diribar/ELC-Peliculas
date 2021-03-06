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
const Ruta_y_Nombre_de_Archivo = path.join(__dirname, '../../bases_de_datos/titulos_web.json');
const BD = LeerArchivo(Ruta_y_Nombre_de_Archivo);

// *********** Controlador ***********
module.exports = {
	main: (req,res) => { //* HOME - QUIÉNES SOMOS - CONTÁCTANOS
		let url = req.params.id;
		let título_web = BD.find((n) => {return n.url == url})
		let título = título_web.título
		res.render('ECC', {título})
	},
};
