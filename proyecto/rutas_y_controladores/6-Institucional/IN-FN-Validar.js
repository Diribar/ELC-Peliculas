"use strict";
// Variables
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");

module.exports = {
	// ControllerAPI (validaLinks)
	contactanos: async (datos) => {
		// Variables
		let campos = Object.keys(datos);
		let errores = {};

		// Asunto
		if (campos.includes("asunto")) errores.asunto = !datos.asunto ? variables.selectVacio : "";

		// Comentario
		if (campos.includes("comentario")) {
			let respuesta = !datos.comentario ? variables.inputVacio : "";
			if (!respuesta) respuesta = comp.validacs.longitud(datos.comentario, 5, 100);
			if (!respuesta) respuesta = comp.validacs.castellano.completo(datos.comentario);
			if (!respuesta) respuesta = comp.validacs.inicial.completo(datos.comentario);
			errores.comentario = respuesta
		}

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
};
