"use strict";
// Variables
const validaProd = require("../2.1-Prod-Agregar/PA-FN3-Validar");

module.exports = {
	// ControllerAPI (validaEdicion_changes)
	// ControllerVista (Edicion - Form + Grabar)
	consolidado: async ({campos, datos}) => {
		// Obtiene la entidad
		const entidad = datos.entidad;
		// Obtiene los campos
		if (!campos) {
			const camposDD = variables.camposDD.filter((n) => n[entidad] || n.productos);
			const camposDA = variables.camposDA;
			campos = [...camposDD, ...camposDA].map((n) => n.nombre);
		}
		// Averigua si hay errores de validación DD y DA
		const erroresDD = await validaProd.datosDuros(campos, datos);
		const erroresDA = validaProd.datosAdics(campos, datos);
		let errores = {...erroresDD, ...erroresDA};

		// Si corresponde, agrega campos particulares
		errores.publico_id = !datos.publico_id ? variables.selectVacio : "";
		errores.epocaOcurrencia_id = !datos.epocaOcurrencia_id ? variables.selectVacio : "";

		// Lleva los errores a su mínima expresión
		for (let prop in errores) if (!errores[prop]) delete errores[prop];

		// Obtiene errores 'sensible'
		delete errores.hay;
		for (let prop in errores)
			if (![variables.inputVacio, variables.selectVacio, variables.rclvSinElegir].includes(errores[prop]))
				errores.sensible = true;

		// Resumen de errores
		errores.sensible = !!errores.sensible; // se usa para guardar una edición
		errores.hay = !!erroresDD.hay || !!erroresDA.hay || !!errores.publico_id || !!errores.epocaOcurrencia_id; // se usa para cambiar de status a 'aprobado'
		errores.impideAprobado = entidad != "capitulos" ? errores.hay : errores.sensible;

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
