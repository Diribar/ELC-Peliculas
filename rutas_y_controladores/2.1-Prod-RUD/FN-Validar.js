"use strict";
// Definir variables
const variables = require("../../funciones/3-Procesos/Variables");
const validarProd = require("../2.1-Prod-Agregar/FN-Validar");

module.exports = {
	// ControllerAPI (validarEdicion_changes)
	// ControllerVista (Edicion - Form + Grabar)
	consolidado: async (campos, datos) => {
		// Obtiene la entidad
		let entidad = datos.entidad;
		// Obtiene los campos
		if (!campos) {
			let camposDD = variables.camposDD.filter((n) => n[entidad]);
			let camposDP = await variables.camposDP().then((n) => n.filter((m) => m.grupo != "calificala"));
			campos = [...camposDD, ...camposDP].map((n) => n.nombre);
		}
		// Averiguar si hay errores de validación DD y DP
		let erroresDD = await validarProd.datosDuros(campos, datos);
		let erroresDP = await validarProd.datosPers(campos, datos);
		// Terminar
		let errores = {...erroresDD, ...erroresDP};
		errores.hay = erroresDD.hay || erroresDP.hay;
		return errores;
	},
};
