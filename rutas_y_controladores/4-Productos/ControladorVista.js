// ************ Requires ************
let BD_varias = require("../../funciones/BD/varias");

// *********** Controlador ***********
module.exports = {
	home: async (req, res) => {
		tema = "opciones";
		res.render("Home", {
			tema,
			titulo: "ELC-Películas",
			opciones: opciones(),
			opcionesListado: opcionesListado(),
			opcionElegida: null,
		});
	},

	opcion: async (req, res) => {
		tema = "opciones";
		// Averiguar la opción elegida
		let opcion = req.url.slice(1);
		// // Obtener las Opciones, la Opción elegida, los Tipos para la opción elegida y el título
		let [opciones_BD, opcionElegida, tipos_BD, titulo] = await vistas(opcion);
		// Ir a la vista
		res.render("Home", {
			tema,
			titulo,
			opciones_BD,
			tipos_BD,
			opcionElegida,
			tipoElegido: null,
		});
	},

	tipo: async (req, res) => {
		tema = "opciones";
		// Obtener el código de Opción y Tipo
		let url = req.url.slice(1);
		// // Obtener las Opciones, la Opción elegida, los Tipos para la opción elegida y el título
		let opcion = url.slice(0, url.indexOf("/"));
		let [opciones_BD, opcionElegida, tipos_BD, titulo] = await vistas(opcion);
		// Obtener el Tipo elegido
		let tipoElegido = tipos_BD.filter((n) => n.url == url)[0];
		// Ir a la vista
		res.render("Home", {
			tema,
			titulo,
			opciones_BD,
			tipos_BD,
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

// Obtener info para las vistas
let vistas = async (opcion) => {
	// Obtener las Opciones
	let opciones_BD = await BD_varias.obtenerTodos("menu_opciones", "id");
	let opcionElegida = opciones_BD.filter((n) => n.url == opcion)[0];
	// Obtener los Tipos de la opción elegida
	if (opcion == "listado") {
		tipos_BD = await BD_varias.obtenerTodos("listado_peliculas", "id");
	} else {
		tipos_BD = await BD_varias.filtrarPorParametro(
			"subcategorias",
			"categoria_id",
			opcion.toUpperCase()
		);
	}
	// obtener el Título de la opción elegida
	let titulo =
		"Películas - " +
		(await BD_varias.filtrarPorParametro("menu_opciones", "url", opcion).then(
			(n) => n[0].titulo
		));
	// Exportar los datos
	return [opciones_BD, opcionElegida, tipos_BD, titulo];
};

let opciones = () => {
	return [
		{
			nombre: "Listado de Películas",
			url: "listado",
			titulo: "Listado",
			vista: "1-Listado",
			comentario: "Todas las películas de nuestra Base de Datos",
		},
		{
			nombre: "Un paseo por CFC",
			url: "cfc",
			titulo: "CFC",
			vista: "2-CFC",
			comentario: "Películas Centradas en la Fe Católica (CFC)",
		},
		{
			nombre: "Un paseo por VPC",
			url: "vpc",
			titulo: "VPC",
			vista: "3-VPC",
			comentario: "Películas con Valores Presentes en nuestra Cultura (VPC)",
		},
	];
};

let opcionesListado = () => {
	return [
		{nombre: "Sugeridas para el momento del año", url: "listado/sugeridas"},
		{nombre: "Por orden de calificación en nuestra página", url: "listado/calificacion"},
		{nombre: "Por año de estreno", url: "listado/estreno"},
		{nombre: "Por orden de incorporación a nuestra BD", url: "listado/incorporacion"},
		{nombre: "Por orden de visita", url: "listado/visita"},
	];
};
