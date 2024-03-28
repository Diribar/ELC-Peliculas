"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		cuerpo: document.querySelector("#cuerpo #datos"),
		imgDerecha: document.querySelector("#imgDerecha"),
	};
	DOM = {
		...DOM,

		// Sector Cuerpo
		datosLargos: DOM.cuerpo.querySelector("#datosLargos"),
		datosBreves: DOM.cuerpo.querySelector("#datosBreves"),

		// Sector Imagen Derecha
		centro: DOM.imgDerecha.querySelector("#centro"),
		sectorIconos: DOM.imgDerecha.querySelector("#sectorIconos"),
	};
	DOM = {
		...DOM,

		// Centro
		imagen: centro.querySelector("img"),
		links: centro.querySelector("#links"),

		// Íconos
		muestraDL: DOM.sectorIconos.querySelector("#muestraDL"),
		muestraDB: DOM.sectorIconos.querySelector("#muestraDB"),
	};

	// Event listeners - Toggles 'sectorIconos', 'centro links'
	DOM.imagen.addEventListener("click", () => {
		DOM.links.classList.toggle("ocultar"); // inicialmente visibles
		DOM.sectorIconos.classList.toggle("ocultar"); // inicialmente visibles
		DOM.datosLargos.classList.add("toggle"); // inicialmente ocultos
		DOM.datosBreves.classList.add("toggle"); // inicialmente ocultos
	});

	// Event listeners - Muestra la datosLargos
	DOM.muestraDL.addEventListener("click", () => {
		DOM.datosLargos.classList.toggle("toggle"); // Toggle 'datosLargos'
		DOM.datosBreves.classList.add("toggle"); // Oculta 'datosBreves'
	});

	// Event listeners - Muestra la calificación
	DOM.muestraDB.addEventListener("click", () => {
		DOM.datosBreves.classList.toggle("toggle"); // Toggle 'datosBreves'
		DOM.datosLargos.classList.add("toggle"); // Oculta 'datosLargos'
	});
});
