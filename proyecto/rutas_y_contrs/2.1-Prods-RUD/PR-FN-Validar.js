"use strict";

module.exports = {
	calificar: (datos) => {
		// Variables
		let errores = {};

		// Verifica que ninguno esté vacío
		for (let atributo in datos) errores[atributo] = !datos[atributo] ? "Necesitamos que respondas este atributo" : "";

		// Consolida la información
		errores.hay = Object.values(datos).some((n) => !n);

		// Fin
		return errores;
	},
};
