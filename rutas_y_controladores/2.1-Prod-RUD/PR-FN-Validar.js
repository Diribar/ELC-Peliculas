"use strict";
// Definir variables
const variables = require("../../funciones/2-Procesos/Variables");
const validaProd = require("../2.1-Prod-Agregar/PA-FN-Validar");

module.exports = {
	// ControllerAPI (validaEdicion_changes)
	// ControllerVista (Edicion - Form + Grabar)
	consolidado: async ({campos, datos}) => {
		// Obtiene la entidad
		let entidad = datos.entidad;
		// Obtiene los campos
		if (!campos) {
			let camposDD = variables.camposDD.filter((n) => n[entidad] || n.productos);
			let camposDA = variables.camposDA;
			campos = [...camposDD, ...camposDA].map((n) => n.nombre);
		}
		// Averigua si hay errores de validación DD y DA
		let erroresDD = await validaProd.datosDuros(campos, datos);
		let erroresDA = validaProd.datosAdics(campos, datos);
		let errores = {...erroresDD, ...erroresDA};

		// Si corresponde, agrega campos particulares
		if (datos.epocaOcurrencia) errores.epocaOcurrencia_id = !datos.epocaOcurrencia_id ? variables.selectVacio : "";
		if (datos.publico) errores.publico_id = !datos.publico_id ? variables.selectVacio : "";

		// Terminar
		errores.hay = erroresDD.hay || erroresDA.hay || !!errores.publico_id;
		return errores;
	},
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
