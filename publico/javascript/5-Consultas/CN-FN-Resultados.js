"use strict";

let resultados = {
	obtiene: async function () {
		// Fecha actual
		const ahora = new Date();
		const dia = ahora.getDate();
		const mes = ahora.getMonth() + 1;

		// Arma los datos
		const datos = {dia, mes, configCons};

		// Busca la información en el BE
		v.infoResultados =
			entidad == "productos"
				? await fetch(ruta + "obtiene-los-productos/?datos=" + JSON.stringify(datos)).then((n) => n.json())
				: await fetch(ruta + "obtiene-los-rclvs/?datos=" + JSON.stringify(datos)).then((n) => n.json());

		// Fin
		this.contador();
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
