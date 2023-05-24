"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		mostrarOcultar: document.querySelectorAll(".bloques .temas h3"),
		bloqueRegistros: document.querySelectorAll(".bloques .temas .bloqueRegistros"),
	};

	// Muestra u oculta
	DOM.mostrarOcultar.forEach((mostrarOcultar, i) => {
		// Revisa para cada bloque
		mostrarOcultar.addEventListener("click", () => {
			DOM.bloqueRegistros[i].classList.toggle("ocultar");
		});
	});
});
