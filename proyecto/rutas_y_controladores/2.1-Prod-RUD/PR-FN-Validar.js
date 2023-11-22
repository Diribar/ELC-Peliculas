"use strict";
// Variables
const validaProd = require("../2.1-Prod-Agregar/PA-FN3-Validar");

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
		if (datos.entidad != "capitulos" && datos.statusRegistro_id != creado_id) {
			if (datos.publico) errores.publico_id = !datos.publico_id ? variables.selectVacio : "";
			if (datos.epocaOcurrencia) errores.epocaOcurrencia_id = !datos.epocaOcurrencia_id ? variables.selectVacio : "";
		}

		// Consolida si hay un error
		errores.hay = !!erroresDD.hay || !!erroresDA.hay || !!errores.publico_id || !!errores.epocaOcurrencia_id;
		console.log(41, errores);
		delete erroresDD.hay;
		delete erroresDA.hay;
		for (let campo in errores)
			if (
				campo != "hay" &&
				errores[campo] &&
				errores[campo] != variables.selectVacio &&
				!errores[campo].startsWith(variables.inputVacio) &&
				errores[campo] != "Necesitamos que respondas alguna de las opciones"
			)
				errores.sensible = true;

		// Fin
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
