"use strict";
// Definir variables

module.exports = {
	home: async (req, res) => {
		res.render("CMP-0Estructura", {
			tema: "consultas",
			titulo: "ELC-Películas",
			menuOpciones,
		});
	},

	opcion: async (req, res) => {
		// Averiguar la opción elegida
		let opcion = menuOpciones.find((n) => req.params.opcion ==  n.url);
		// Va a la vista
		res.render("CMP-0Estructura", {
			tema: "consultas",
			titulo: "Películas - " + opcion.titulo,
			opcion,
			menuOpciones,
			menuSubOpciones: menusSubOpciones[opcion.url],
		});
	},

	subOpcion: async (req, res) => {
		// Averiguar la opción elegida
		let opcion = menuOpciones.find((n) => req.params.opcion ==  n.url);
		// Averiguar la sub-opción elegida
		let subOpcion = menusSubOpciones[opcion.url].find((n) => req.params.subOpcion == n.url);
		// Va a la vista
		res.render("CMP-0Estructura", {
			tema: "consultas",
			titulo: "Películas - " + opcion.titulo,
			opcion,
			subOpcion,
			menuOpciones,
			menuSubOpciones: menusSubOpciones[opcion.url],
		});
	},

	filtros: (req, res) => {
		const tema = "productos";
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
