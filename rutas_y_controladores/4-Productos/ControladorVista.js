// ************ Requires ************
let BD_varias = require("../../funciones/BD/varias");

// *********** Controlador ***********
module.exports = {
	home: async (req, res) => {
		tema = "opciones";
		res.render("Home", {
			tema,
			opcion: null,
			titulo: "ELC-Películas",
			opciones,
			opcionesListado,
			opcionElegida: null,
			tipoElegido: null,
		});
	},

	opcion: async (req, res) => {
		tema = "opciones";
		// Averiguar la opción elegida
		let opcion = req.url.slice(1);
		//return res.send(opcion);
		// // Obtener las Opciones, la Opción elegida, los Tipos para la opción elegida y el título
		let [tipos, titulo] = await datosVista(opcion);
		// Obtener la Opción
		let opcionElegida = opciones.find((n) => n.opcion == opcion);
		// Ir a la vista
		res.render("Home", {
			tema,
			opcion,
			titulo,
			opciones,
			tipos,
			opcionElegida,
			tipoElegido: null,
		});
	},

	tipo: async (req, res) => {
		tema = "opciones";
		// Obtener el código de Opción y Tipo
		let url = req.url.slice(1);
		// Obtener las Opciones, la Opción elegida, los Tipos para la opción elegida y el título
		let opcion = url.slice(0, url.indexOf("/"));
		let [tipos, titulo] = await datosVista(opcion);
		// Obtener la Opción y el Tipo elegido
		let opcionElegida = opciones.find((n) => n.opcion == opcion);
		let tipoElegido = tipos.find((n) => n.url == url);
		// Ir a la vista
		//return res.send([tema, titulo, opciones, tipos, opcionElegida, tipoElegido]);
		res.render("Home", {
			tema,
			opcion,
			titulo,
			opciones,
			tipos,
			opcionElegida,
			tipoElegido,
		});
	},

	filtros: (req, res) => {
		tema = "opciones";
		return res.send("Filtros");
		//	let user_entry = req.query;
		//	let results = [];
		//	for (let i=0; i < pelis.length; i++) {
		//		if (BD[i].nombre.toLowerCase().includes(user_entry.palabrasClave.toLowerCase())) {
		//			results.push(BD[i])
		//		}
		//	};
		//	res.send(results);
		//	res.render('pagina-de-resultados', results);
	},
};

// Obtener info para la vista
let datosVista = async (opcion) => {
	// Obtener los Tipos de la opción elegida
	let tipos =
		opcion == "listado"
			? opcionesListado
			: await BD_varias.obtenerPorCampo("subcategorias", "categoria_id", opcion).then((n) => {
					return {nombre: n.nombre, url: n.url};
			  });

	// obtener el Título de la opción elegida
	let titulo = "Películas - ";
	titulo += opciones.find((n) => n.opcion == opcion).titulo;
	// Exportar los datos
	return [tipos, titulo];
};

// Variables
let opciones = [
	{
		nombre: "Listado de Películas",
		opcion: "listado",
		titulo: "Listado",
		vista: "1-Listado",
		comentario: "Todas las películas de nuestra Base de Datos",
	},
	{
		nombre: "Un paseo por CFC",
		opcion: "cfc",
		titulo: "CFC",
		vista: "2-CFC",
		comentario: "Películas Centradas en la Fe Católica (CFC)",
	},
	{
		nombre: "Un paseo por VPC",
		opcion: "vpc",
		titulo: "VPC",
		vista: "3-VPC",
		comentario: "Películas con Valores Presentes en nuestra Cultura (VPC)",
	},
];

let opcionesListado = [
	{nombre: "Sugeridas para el momento del año", url: "listado/sugeridas"},
	{nombre: "Por orden de calificación en nuestra página", url: "listado/calificacion"},
	{nombre: "Por año de estreno", url: "listado/estreno"},
	{nombre: "Por orden de incorporación a nuestra BD", url: "listado/incorporacion"},
	{nombre: "Por orden de visita", url: "listado/visita"},
];
