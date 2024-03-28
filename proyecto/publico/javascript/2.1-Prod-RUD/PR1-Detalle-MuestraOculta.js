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
		DOM.links.classList.toggle("ocultar"); // inicialmente visibles siempre
		DOM.sectorIconos.classList.toggle("ocultar"); // inicialmente visibles siempre
		DOM.datosLargos.classList.add("toggle"); // inicialmente visibles en acostados
		DOM.datosBreves.classList.add("toggle"); // inicialmente visibles en Laptop
	});

	// Event listeners - Muestra la datosLargos
	DOM.muestraDL.addEventListener("click", () => {
		DOM.datosLargos.classList.toggle("toggle"); // inicialmente visibles en acostados
		DOM.datosBreves.classList.add("toggle"); // inicialmente visibles en Laptop
	});

	// Event listeners - Muestra la calificación
	DOM.muestraDB.addEventListener("click", () => {
		DOM.datosLargos.classList.add("toggle"); // inicialmente visibles en acostados
		DOM.datosBreves.classList.toggle("toggle"); // inicialmente visibles en Laptop
	});
});
