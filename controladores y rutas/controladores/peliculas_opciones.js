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
		let opcion_url=null
		let tipo_url=null
		// Obtener el título
		let rubros_BD = leer(ruta_nombre_rubros);
		let rubro_objeto = rubros_BD.find(n => n.codigo == rubro_url);
		let opcion_objeto= {"grupo": "Opciones"};
		let titulo = rubro_objeto.titulo;
		// Definir variables a enviar a la vista
		let opciones_BD = leer(ruta_nombre_opciones);
		// Ir a la vista
		res.render('10-PEL-Opciones', {
			titulo,
			rubro_url,
			opcion_url,
			tipo_url,
			opcion_objeto,
			opciones_BD,
		});
	},

	opcion: (req, res) => {
		// Obtener el código de la opción elegida (listado, cfc, vpc, etc.)
		let opcion_url = req.url.slice(1) 
		let tipo_url=null
		// Obtener el código del rubro elegido (en esta caso: peliculas)
		let rubro_url = req.originalUrl				
		rubro_url = rubro_url.slice(1,rubro_url.lastIndexOf("/"))
		// Obtener el título (rubro + opción)
		let opciones_BD = leer(ruta_nombre_opciones);
		let opcion_objeto = opciones_BD.find(n => n.codigo == opcion_url);
		let titulo = "Películas-" + opcion_objeto.titulo;
		// Definir variables a enviar a la vista
		let tipos_BD = leer(ruta_nombre_tipos).filter(n => n.opcion == opcion_url);
		// Ir a la vista
		res.render('10-PEL-Opciones', {
			titulo,
			rubro_url,
			opcion_url,
			tipo_url,
			opcion_objeto,
			opciones_BD,
			tipos_BD,
		});
	},

	tipo: (req, res) => {
		// Obtener el código de Rubro, Opción, Tipo
		let url = req.originalUrl.slice(1)
		let rubro_url = url.slice(0,url.indexOf("/"))
		let opcion_url = url.slice(url.indexOf("/")+1, url.lastIndexOf("/"))
		let tipo_url = url.slice(url.lastIndexOf("/")+1)
		// Obtener el título (rubro + opción)
		let opciones_BD = leer(ruta_nombre_opciones);
		let opcion_objeto = opciones_BD.find(n => n.codigo == opcion_url);
		let titulo = "Películas-" + opcion_objeto.titulo;
		// Obtener el tipo_objeto
		let tipos_BD = leer(ruta_nombre_tipos).filter(n => n.opcion == opcion_url);
		let tipo_objeto = tipos_BD.find(n => n.codigo == tipo_url);
		// Definir variables a enviar a la vista
		// Ir a la vista
		res.render('10-PEL-Opciones', {
			titulo,
			rubro_url,
			opcion_url,
			tipo_url,
			opcion_objeto,
			tipo_objeto,
			opciones_BD,
			tipos_BD,
		});
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
		//	res.render('pagina-de-resultados', results);
	},
};

