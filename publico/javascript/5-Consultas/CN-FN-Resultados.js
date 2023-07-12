"use strict";

let resultados = {
	obtiene: async function () {
		console.log("obtiene");
		return

		//
		v.infoResultados =
			configCons.entidad == "productos"
				? fetch(ruta + "" + JSON.stringify(configCons))
				: fetch(ruta + "" + JSON.stringify(configCons));

		// Fin
		return;
	},
	contador: () => {
		// Fin
		return;
	},
	muestra: () => {
		// Cartel comencemos
		v.mostrarComencemos = false;
		DOM.comencemos.classList.add("ocultar");

		console.log("muestra");

		// Fin
		DOM.vistaProds.classList.remove("ocultar");
		return;
	},
};
