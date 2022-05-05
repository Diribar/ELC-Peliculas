"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");
const variables = require("./Variables");

module.exports = {
	datosVista: async (opcion) => {
		// Obtener todos los campos de la opción elegida
		let opcionElegida_campos = variables.menuOpciones().find((n) => n.url == opcion);
		// obtener el Título de la opción elegida
		let opcionElegida_titulo = "Películas - " + opcionElegida_campos.titulo;
		// Obtener los Tipos de la opción elegida
		let menuSubOpciones =
			opcion == "listado" || opcion == "sugeridas"
				? variables.menuSubOpciones()
				: await BD_genericas.obtenerTodos("subcategorias", "orden")
						.then((n) => n.filter((m) => m.categoria_id == opcion.toUpperCase()))
						.then((n) =>
							n.map((m) => {
								let subCategoria=m.url.slice
								return {nombre: m.nombre, url: m.url};
							})
						);
		// Exportar los datos
		return [opcionElegida_campos, opcionElegida_titulo, menuSubOpciones];
	},
};
