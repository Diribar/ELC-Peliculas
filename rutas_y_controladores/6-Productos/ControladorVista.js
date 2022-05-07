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
		let opcionElegida_campos = req.session.menuOpciones.find((n) => n.url == opcion);
		let opcionElegida_titulo = "Películas - " + opcionElegida_campos.titulo;
		// Ir a la vista
		// return res.send([tema, opcion, titulo, opciones, tipos, opcionCampos]);
		res.render("0-VistaEstandar", {
			tema: "productos",
			opcion,
			titulo: opcionElegida_titulo,
			menuOpciones: req.session.menuOpciones,
			subOpcion: null,
			opcionElegida_campos,
			subOpcionElegida_campos: null,
			menuSubOpciones: req.session.menuSubOpciones_algunas,
		});
	},

	subOpcion: async (req, res) => {
		// Averiguar la sub-opción elegida
		let url = req.url.slice(1);
		let opcion = url.slice(0, url.indexOf("/"));
		let opcionSubOpcion = req.url.slice(1);
		// Obtener datos en función de la opción elegida
		let opcionElegida_campos = req.session.menuOpciones.find((n) => n.url == opcion);
		let opcionElegida_titulo = "Películas - " + opcionElegida_campos.titulo;
		let subOpcionElegida_campos = req.session.menuSubOpciones_algunas.find(
			(n) => n.url == opcionSubOpcion
		);
		// Ir a la vista
		//return res.send([tema, titulo, opciones, tipos, opcionElegida, tipoElegido]);
		res.render("0-VistaEstandar", {
			tema: "productos",
			opcion,
			titulo: opcionElegida_titulo,
			menuOpciones: req.session.menuOpciones,
			subOpcion: opcionSubOpcion,
			opcionElegida_campos,
			subOpcionElegida_campos,
			menuSubOpciones: req.session.menuSubOpciones_algunas,
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
