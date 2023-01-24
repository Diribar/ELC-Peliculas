"use strict";
// Definir variables
const variables = require("../../funciones/3-Procesos/Variables");
const validaProd = require("../2.1-Prod-Agregar/PA-FN-Validar");

module.exports = {
	// ControllerAPI (validaEdicion_changes)
	// ControllerVista (Edicion - Form + Grabar)
	consolidado: async (campos, datos) => {
		// Obtiene la entidad
		let entidad = datos.entidad;
		// Obtiene los campos
		if (!campos) {
			let camposDD = variables.camposDD.filter((n) => n[entidad]);
			let camposDP = variables.camposDP
			campos = [...camposDD, ...camposDP].map((n) => n.nombre);
		}
		// Averigua si hay errores de validación DD y DP
		let erroresDD = await validaProd.datosDuros(campos, datos);
		let erroresDP = await validaProd.datosPers(campos, datos);
		// Terminar
		let errores = {...erroresDD, ...erroresDP};
		errores.hay = erroresDD.hay || erroresDP.hay;
		return errores;
	},
};
