"use strict";

window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		tituloRegs: document.querySelectorAll(".bloques .temas h3"),
		registros: document.querySelectorAll(".bloques .temas .registros"),
	};
	const actualizaVisibles = "/revision/api/re-actualiza-visibles/?datos=";
	const circuito = location.pathname.split("tablero-de-")[1];

	// Muestra u oculta
	DOM.tituloRegs.forEach((tituloReg, i) => {
		// Variables
		const clave = tituloReg.id;

		// Revisa para cada bloque
		tituloReg.addEventListener("click", () => {
			// Genera los datos a exportar
			const [familias, titulo] = clave.split("_");
			const desplegar = DOM.registros[i].className.includes("ocultar"); // si están ocultos, se deben desplegar
			const datos = {circuito, familias, titulo, desplegar};

			// Exporta los datos
			fetch(actualizaVisibles + JSON.stringify(datos));

			// Muestra u oculta los registros
			DOM.registros[i].classList.toggle("ocultar");
		});
	});
});
