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
			let camposDA = variables.camposDA
			campos = [...camposDD, ...camposDA].map((n) => n.nombre);
		}
		// Averigua si hay errores de validación DD y DA
		let erroresDD = await validaProd.datosDuros(campos, datos);
		let erroresDA = await validaProd.datosAdics(campos, datos);
		// Terminar
		let errores = {...erroresDD, ...erroresDA};
		errores.hay = erroresDD.hay || erroresDA.hay;
		return errores;
	},
};
