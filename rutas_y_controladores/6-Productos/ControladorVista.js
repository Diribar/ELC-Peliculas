"use strict";
// Definir variables
const procesar = require("../../funciones/3-Procesos/9-Miscelaneas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	home: async (req, res) => {
		res.render("0-VistaEstandar", {
			tema: "productos",
			opcion: null,
			titulo: "ELC-Películas",
			opciones,
			opcionElegida: null,
		});
	},

	opcion: async (req, res) => {
		// Averiguar la opción elegida
		let opcion = req.url.slice(1);
		// Obtener datos en función de la opción elegida
		let [opcionElegida_campos, opcionElegida_titulo] = await procesar.datosVista(opcion);
		// Ir a la vista
		// return res.send([tema, opcion, titulo, opciones, tipos, opcionCampos]);
		res.render("0-VistaEstandar", {
			tema: "productos",
			opcion,
			subOpcion: null,
			opcionElegida_campos,
			titulo: opcionElegida_titulo,
			subOpcionElegida_campos: null,
			menuOpciones: variables.menuOpciones(),
			menuSubOpciones: req.session.menuSubOpciones,
		});
	},

	subOpcion: async (req, res) => {
		// Averiguar la sub-opción elegida
		let url = req.url.slice(1);
		let opcion = url.slice(0, url.indexOf("/"));
		let subOpcion = url.slice(opcion.length + 1);

		return res.send(subOpcion);
		// Obtener datos en función de la opción elegida
		let [opcionCampos, titulo, menuSubOpciones] = await procesar.datosVista(opcion);
		// Obtener la Opción Elegida y el Tipo Elegido
		let subOpcionCampos = menuSubOpciones.find((n) => n.url == url);
		// Ir a la vista
		//return res.send([tema, titulo, opciones, tipos, opcionElegida, tipoElegido]);
		res.render("0-VistaEstandar", {
			tema: "productos",
			opcion,
			titulo,
			opciones,
			tipos,
			opcionElegida,
			tipoElegido,
		});
	},

	filtros: (req, res) => {
		let tema = "productos";
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
