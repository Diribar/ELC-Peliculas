"use strict";
// Variables
const procesos = require("./PA-FN4-Procesos");

module.exports = {
	// ControllerAPI (validaPalabrasClave)
	palabrasClave: (dato) => {
		// Campo palabrasClave
		let errores = {};
		let longitud = dato ? comp.validacs.longitud(dato, 3, 55) : "";
		errores.palabrasClave = !dato ? variables.inputVacio : longitud ? longitud : "";
		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	// ControllerAPI (validaIngresoFA)
	IM: (datos) => {
		let errores = {};
		// Final
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	// ControllerAPI (validaIngresoFA)
	FA: (datos) => {
		// Variables
		let errores = {};

		// Dirección
		let url = datos.url;
		errores.url = !url
			? variables.inputVacio
			: !url.includes("www.filmaffinity.com/") ||
			  url.indexOf("www.filmaffinity.com/") + 21 >= url.indexOf("/film") ||
			  url.indexOf("/film") + 5 >= url.indexOf(".html")
			? "No parece ser una dirección de Film Affinity"
			: "";

		// Avatar
		errores.avatarUrl = !datos.avatarUrl
			? "Necesitamos que agregues una imagen"
			: !datos.avatarUrl.includes("pics.filmaffinity.com/")
			? "No parece ser una imagen de FilmAffinity"
			: !datos.avatarUrl.includes("large.jpg")
			? "Necesitamos que consigas el link de la imagen grande"
			: "";

		// Contenido
		let contenido = datos.contenido ? procesos.FA.contenidoFA(datos.contenido) : {};
		errores.contenido = !datos.contenido
			? variables.inputVacio
			: !Object.keys(contenido).length
			? "No se obtuvo ningún dato"
			: "";

		// Ajustes finales
		errores.hay = Object.values(errores).some((n) => !!n);
		errores.campos = Object.keys(contenido).length;

		// Final
		return errores;
	},
};

