"use strict";
// Definir variables
const BD_varias = require("../../funciones/BD/varias");

module.exports = {
	home: async (req, res) => {
		tema = "productos";
		res.render("Home", {
			tema,
			opcion: null,
			titulo: "ELC-Películas",
			opciones,
			opcionElegida: null,
		});
	},

	opcion: async (req, res) => {
		tema = "productos";
		// Averiguar la opción elegida
		let opcion = req.url.slice(1);
		let opcionElegida = opciones.find((n) => n.opcion == opcion);
		// Obtener los tipos para la opción elegida y el título
		let [tipos, titulo] = await datosVista(opcion);
		// Ir a la vista
		// return res.send([tema, opcion, titulo, opciones, tipos, opcionElegida]);
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
		tema = "productos";
		// Obtener el código de Opción y Tipo
		let url = req.url.slice(1);
		// Obtener la opción, los tipos para la opción elegida y el título
		let opcion = url.slice(0, url.indexOf("/"));
		let [tipos, titulo] = await datosVista(opcion);
		// Obtener la Opción Elegida y el Tipo Elegido
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
		tema = "productos";
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
			? tiposListado
			: await BD_varias.obtenerTodos("subcategorias", "orden", opcion)
					.then((n) => n.filter((m) => m.categoria_id == opcion.toUpperCase()))
					.then((n) =>
						n.map((m) => {
							return {nombre: m.nombre, url: m.url};
						})
					);
	// obtener el Título de la opción elegida
	let titulo = "Películas - " + opciones.find((n) => n.opcion == opcion).titulo;
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

let tiposListado = [
	{nombre: "Sugeridas para el momento del año", url: "listado/sugeridas"},
	{nombre: "Por orden de calificación en nuestra página", url: "listado/calificacion"},
	{nombre: "Por año de estreno", url: "listado/estreno"},
	{nombre: "Por orden de incorporación a nuestra BD", url: "listado/incorporacion"},
	{nombre: "Por orden de visita", url: "listado/visita"},
];
