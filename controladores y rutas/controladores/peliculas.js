// ************ Requires ************
const fs = require('fs');
const path = require('path')

// ************ Variables ************
const ruta_nombre_pelis = path.join(__dirname, '../../bases_de_datos/tablas/BDpeliculas.json');
const ruta_nombre_detalle = path.join(__dirname, '../../bases_de_datos/tablas/pelicula_detalle.json');
const ruta_nombre_importar = path.join(__dirname, '../../bases_de_datos/tablas/importarPeliculas.json');
const importarPeliculas = require(path.join(__dirname, '../../modelos/importarPeliculas.js'));

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function guardar(n, contenido) {fs.writeFileSync(n, JSON.stringify(contenido, null, 2))};

// *********** Controlador ***********
module.exports = {
	altaForm: (req, res) => {
		return res.render('1-PEL-Agregar', {
			titulo: "Película - Agregar"
		});
	},

	altaGuardar: (req, res) => {
		let alfa = req.body.comentario;
		// Convertir texto en array
		alfa = alfa.split("\r\n");
		alfa.unshift("Título en castellano")
		//return res.send(alfa)
		// Limpiar espacios innecesarios
		for (let i=0; i<alfa.length; i++) {alfa[i]=alfa[i].trim()}
		// Convertir "Títulos de vista" en "Títulos de tabla" y eliminar los que no coincidan
		let BDtitulos = leer(ruta_nombre_importar);
		for (let i=0; i<alfa.length; i=i+2) {
			let indice = BDtitulos.indexOf(alfa[i]);
			if (indice != -1) {
				alfa[i] = BDtitulos[indice+1]
			} else {
				alfa[i]=""
				alfa[i+1]=""
			}
		}
		// Limpiar campos vacíos
		alfa = alfa.filter(n => {return n != ""})
		// Convertir array en JSON
		let beta="{"
		for (let i=0; i < alfa.length; i=i+2) {
			if (i>0) {beta=beta + ', '}
			beta = beta + '"'+ alfa[i] + '": "' + alfa[i+1] + '"';
		}
		beta = beta + "}"
		// Convertir JSON en objeto
		beta = JSON.parse(beta)
		return res.send(beta)
		//let beta = importarPeliculas(alfa)
	},

	detalle: (req, res) => {
		// Obtener el código de Método y Película
		let url = req.originalUrl.slice(1)
		let codigoURL = url.slice(url.indexOf("/")+1, url.lastIndexOf("/"))
		let IDpeli = url.slice(url.lastIndexOf("/")+1)
		//return res.send(codigoURL)
		// Obtener el título (rubro + opción)
		let BDdetalle = leer(ruta_nombre_detalle);
		let detalle = BDdetalle.find(n => n.codigo == codigoURL);
		let titulo = detalle.titulo;
		// Obtener la película
		let BD = leer(ruta_nombre_pelis);
		let producto = BD.find(n => n.id == IDpeli);
		// Ir a la vista
		return res.render('0-PEL-CRUD', {
			detalle,
			producto,
			IDpeli,
			opcion_objeto: {"grupo": "CRUD"},
			titulo
		});
	},

	editarGuardar: (req, res) => {
		return res.send("Estoy en editarGuardar")
	},
	
	bajaGuardar: (req, res) => {
		return res.send("Estoy en bajaGuardar")
	},

};
