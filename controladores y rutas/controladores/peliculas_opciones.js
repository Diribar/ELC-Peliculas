// ************ Requires ************
const fs = require('fs');
const path = require('path')

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// ************ Variables ************
const ruta_nombre_rubros = path.join(__dirname, '../../bases_de_datos/ECC_rubros.json');
const ruta_nombre_opciones = path.join(__dirname, '../../bases_de_datos/peliculas_opciones.json');
const ruta_nombre_tipos = path.join(__dirname, '../../bases_de_datos/peliculas_tipos.json');
const ruta_nombre_pelis = path.join(__dirname, '../../bases_de_datos/peliculas_BD.json');

// *********** Controlador ***********
module.exports = {
	rubro: (req,res) => {
		// Obtener el código del rubro elegido (peliculas, etc.)
		let rubro_url = req.originalUrl.slice(1)
		// Obtener el título
		let rubros_BD = leer(ruta_nombre_rubros);
		let rubro_objeto = rubros_BD.find(n => n.codigo == rubro_url);
		let título = rubro_objeto.título;
		// Definir variables a enviar a la vista
		grupo= "Opciones-1 (Rubro elegido)".slice(0,10)
		let opciones_BD = leer(ruta_nombre_opciones);
		// Ir a la vista
		res.render('00-PlantillaPelis', {
			título,
			grupo,
			rubro_url,
			opciones_BD,
		});
	},

	opcion: (req, res) => {
		// Obtener el código de la opción elegida (listado, cfc, vpc, etc.)
		let opcion_url = req.url.slice(1) 
		// Obtener el código del rubro elegido (en esta caso: peliculas)
		let rubro_url = req.originalUrl				
		rubro_url = rubro_url.slice(1,rubro_url.lastIndexOf("/"))
		// Obtener el título (rubro + opción)
		let opciones_BD = leer(ruta_nombre_opciones);
		let opcion_objeto = opciones_BD.find(n => n.codigo == opcion_url);
		let título = opcion_objeto.título;
		// Definir variables a enviar a la vista
		grupo= "Opciones-2 (Opción elegida)".slice(0,10)
		let tipos_BD = leer(ruta_nombre_tipos).filter(n => n.opcion == opcion_url);
		// Ir a la vista
		// return res.send(tipos_BD)
		res.render('00-PlantillaPelis', {
			título,
			grupo,
			rubro_url,
			opcion_objeto,
			tipos_BD,
		});
	},

	tipo: (req, res) => {
		// Obtener el código de la opción elegida (listado, cfc, vpc, etc.)
		let tipo_url = req.url.slice(1)
		res.send(tipo_url)
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

