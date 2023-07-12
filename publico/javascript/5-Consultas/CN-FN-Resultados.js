"use strict";

let resultados = {
	obtiene: async function () {
		console.log(5);
		// Busca la información en el BE
		v.infoResultados =
			configCons.entidad == "productos"
				? await fetch(ruta + "obtiene-los-productos/?configCons=" + JSON.stringify(configCons)).then((n) => n.json())
				: await fetch(ruta + "obtiene-los-rclvs/?configCons=" + JSON.stringify(configCons)).then((n) => n.json());

		// Fin
		this.contador()
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
