"use strict";

window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		tituloRegs: document.querySelectorAll(".bloques .temas h3"),
		bloqueRegs: document.querySelectorAll(".bloques .temas .bloqueRegs"),
	};
	const actualizaVisibles = "/revision/api/actualiza-visibles/?datos=";
	const circuito = location.pathname.replace("tablero-de-", "");

	// Muestra u oculta
	DOM.tituloRegs.forEach((tituloReg, i) => {
		// Revisa para cada bloque
		tituloReg.addEventListener("click", () => {
			// Genera los datos a exportar
			const titulo = tituloReg.id;
			const familias = titulo.split("_")[0];
			const desplegar = DOM.bloqueRegs[i].className.includes("ocultar"); // si están ocultos, se deben desplegar
			const datos = {circuito, familias, titulo, desplegar};

			// Exporta los datos
			fetch(actualizaVisibles + JSON.stringify(datos));

			// Muestra u oculta el bloque de registros
			DOM.bloqueRegs[i].classList.toggle("ocultar");
		});
	});
});
