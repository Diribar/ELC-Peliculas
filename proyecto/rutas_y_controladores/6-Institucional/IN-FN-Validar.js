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
		if (campos.includes("asunto"))
			if (!datos.asunto) errores.asunto = "Necesitamos que elijas un asunto";
			else if (!variables.asuntosContactanos.find((n) => n.codigo == datos.asunto))
				errores.asunto = "Necesitamos que elijas un asunto válido";

		// Comentario
		if (campos.includes("comentario")) {
			let respuesta = !datos.comentario ? "Necesitamos que nos escribas un comentario" : "";
			if (!respuesta) respuesta = comp.validacs.longitud(datos.comentario, 5, 100);
			if (!respuesta) respuesta = comp.validacs.castellano.completo(datos.comentario);
			if (!respuesta) respuesta = comp.validacs.inicial.completo(datos.comentario);
			if (respuesta) errores.comentario = respuesta;
		}

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
};
