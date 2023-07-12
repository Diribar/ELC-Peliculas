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
				: await fetch(ruta + "obtiene-los-rclvs/?datos=" + JSON.stringify({...datos, entidad})).then((n) => n.json());

		// Fin
		this.contador();
		return;
	},
	contador: () => {
		// Variables
		v.total = v.infoResultados.length;
		v.parcial = Math.min(4, v.total);

		// Actualiza el contador
		DOM.contadorDeProds.innerHTML = v.parcial + " / " + v.total;

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
