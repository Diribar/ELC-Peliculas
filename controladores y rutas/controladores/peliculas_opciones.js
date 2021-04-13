// ************ Requires ************
const fs = require('fs');
const path = require('path')

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// ************ Variables ************
const ruta_nombre_opciones = path.join(__dirname, '../../bases_de_datos/tablas/menuOpciones.json');
const ruta_nombre_tipos = path.join(__dirname, '../../bases_de_datos/tablas/menuTipos.json');
//const ruta_nombre_pelis = path.join(__dirname, '../../bases_de_datos/tablas/BDpeliculas.json');

// *********** Controlador ***********
module.exports = {

	rubro: (req,res) => {
		// Ir a la vista
		res.render('0-Opciones', {
			titulo: "Películas",
			rubro_url: "peliculas",
			opcion_url: null,
			tipo_url: null,
			opcion_objeto: {"grupo": "Opciones"},
			opciones_BD: leer(ruta_nombre_opciones),
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
		res.render('0-Opciones', {
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
		// Ir a la vista
		res.render('0-Opciones', {
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

