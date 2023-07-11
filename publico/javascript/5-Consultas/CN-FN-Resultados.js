"use strict";

let resultados = {
	obtiene: async function () {
		console.log(configCons);
		// return

		//
		v.infoResultados =
			configCons.entidad == "productos"
				? await fetch(ruta + "obtiene-los-productos/?configCons=" + JSON.stringify(configCons)).then((n) => n.json())
				: await fetch(ruta + "obtiene-los-rclvs/?configCons=" + JSON.stringify(configCons)).then((n) => n.json());

		console.log(v.infoResultados);

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
