"use strict";

let resultados = {
	obtiene: async function () {
		// Fecha actual
		const ahora = new Date();
		const dia = ahora.getDate();
		const mes = ahora.getMonth() + 1;

		// Arma los datos
		let datos = {configCons};
		if (configCons.orden_id == 1) datos = {...datos, dia, mes};

		// Busca la información en el BE
		v.infoResultados =
			entidad == "productos"
				? await fetch(ruta + "obtiene-los-productos/?datos=" + JSON.stringify(datos)).then((n) => n.json())
				: await fetch(ruta + "obtiene-los-rclvs/?datos=" + JSON.stringify({configCons, entidad})).then((n) => n.json());

		// Output
		console.log(v.infoResultados && v.infoResultados.length > 10 ? v.infoResultados.length : v.infoResultados);

		// Fin
		this.contador();
		return;
	},
	contador: () => {
		// Variables
		v.total = v.infoResultados ? v.infoResultados.length : 0;
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
