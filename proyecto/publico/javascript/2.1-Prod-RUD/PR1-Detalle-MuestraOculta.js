"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		imagen: document.querySelector("#imgDerecha #centro img"),
		links: document.querySelector("#imgDerecha #centro #links"),
		conjuntoIconos: document.querySelector("#imgDerecha #conjuntoIconos"),
	};

	// Event listeners
	DOM.imagen.addEventListener("click", () => {
		// Toggles 'conjuntoIconos', 'centro links'
		DOM.links.classList.toggle("ocultar");
		DOM.conjuntoIconos.classList.toggle("invisible");
	});
});
