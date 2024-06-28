"use strict";

window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		tituloRegs: document.querySelectorAll(".bloques .temas h3"),
		bloqueRegs: document.querySelectorAll(".bloques .temas .bloqueRegs"),
	};
	const actualizaVisibles = "/revision/api/actualiza-visibles/?datos=";
	const circuito = location.pathname.split("tablero-de-")[1];

	// Muestra u oculta
	DOM.tituloRegs.forEach((tituloReg, i) => {
		// Variables
		const clave = tituloReg.id;

		// Revisa para cada bloque
		tituloReg.addEventListener("click", () => {
			// Genera los datos a exportar
			const [familias, titulo] = clave.split("_");
			const desplegar = DOM.bloqueRegs[i].className.includes("ocultar"); // si están ocultos, se deben desplegar
			const datos = {circuito, familias, titulo, desplegar};

			// Exporta los datos
			fetch(actualizaVisibles + JSON.stringify(datos));

			// Muestra u oculta el bloque de registros
			DOM.bloqueRegs[i].classList.toggle("ocultar");
		});
	});
});
