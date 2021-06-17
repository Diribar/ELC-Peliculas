// ************ Requires ************
const tablasVarias = require("../../modelos/BD_varios");

// *********** Controlador ***********
module.exports = {
	home: async (req, res) => {
		// Obtener las opciones
		let opciones_BD = await tablasVarias.ObtenerTodos("menu_opciones");
		//res.send(opciones_BD);
		res.render("0-Opciones", {
			titulo: "Películas",
			opciones_BD,
			opcionElegida: null,
		});
	},

	opcion: async (req, res) => {
		// Averiguar la opción elegida
		let opcion = req.url.slice(1);
		// // Obtener las Opciones, la Opción elegida, los Tipos para la opción elegida y el título
		let [opciones_BD, opcionElegida, tipos_BD, titulo] = await vistas(opcion);
		// Ir a la vista
		res.render("0-Opciones", {
			titulo,
			opciones_BD,
			tipos_BD,
			opcionElegida,
			tipoElegido: null,
		});
	},

	tipo: async (req, res) => {
		// Obtener el código de Opción y Tipo
		let url = req.url.slice(1);
		// // Obtener las Opciones, la Opción elegida, los Tipos para la opción elegida y el título
		let opcion = url.slice(0, url.indexOf("/"));
		let [opciones_BD, opcionElegida, tipos_BD, titulo] = await vistas(opcion);
		// Obtener el Tipo elegido
		let tipoElegido = tipos_BD.filter((n) => n.url == url)[0];
		// Ir a la vista
		res.render("0-Opciones", {
			titulo,
			opciones_BD,
			tipos_BD,
			opcionElegida,
			tipoElegido,
		});
	},

	filtros: (req, res) => {
		return res.send("Filtros");
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

// Obtener info para las vistas
const vistas = async (opcion) => {
	// Obtener las Opciones
	let opciones_BD = await tablasVarias.ObtenerTodos("menu_opciones");
	let opcionElegida = opciones_BD.filter((n) => n.url == opcion)[0];
	// Obtener los Tipos de la opción elegida
	if (opcion == "listado") {
		tipos_BD = await tablasVarias.ObtenerTodos("listado_peliculas");
	} else {
		tipos_BD = await tablasVarias.ObtenerFiltrandoPorCampo(
			"subcategorias",
			"categoria_id",
			opcion.toUpperCase()
		);
	}
	// Obtener el Título de la opción elegida
	let titulo = "Películas - " + await tablasVarias
		.ObtenerFiltrandoPorCampo("menu_opciones", "url", opcion)
		.then((n) => n[0].titulo);
	// Exportar los datos
	return [opciones_BD, opcionElegida, tipos_BD, titulo];
};
