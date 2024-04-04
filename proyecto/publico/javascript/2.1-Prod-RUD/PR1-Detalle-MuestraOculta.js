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
		imagen: DOM.imgDerecha.querySelector("img"),
		links: DOM.imgDerecha.querySelector("#links"),
		sectorIconos: DOM.imgDerecha.querySelector("#sectorIconos"),
	};
	DOM = {
		...DOM,

		// Íconos
		muestraDL: DOM.sectorIconos.querySelector("#muestraDL"),
		muestraDB: DOM.sectorIconos.querySelector("#muestraDB"),
	};
	if (window.matchMedia("(orientation: landscape)").matches) DOM.datosLargos.classList.remove("toggle"); // inicialmente visibles en acostados

	// Event listeners - Start-up / Sólo la imagen
	DOM.imagen.addEventListener("click", () => {
		DOM.links.classList.toggle("ocultar"); // inicialmente visibles siempre
		DOM.sectorIconos.classList.toggle("ocultar"); // inicialmente visibles siempre
		DOM.datosLargos.classList.add("toggle"); // oculto
		DOM.datosBreves.classList.add("toggle"); // oculto
	});

	// Event listeners - Muestra datosLargos
	DOM.muestraDL.addEventListener("click", () => {
		DOM.datosLargos.classList.toggle("toggle");
		DOM.datosBreves.classList.add("toggle"); // oculto
	});

	// Event listeners - Muestra datosBreves
	DOM.muestraDB.addEventListener("click", () => {
		if (DOM.muestraDB.className.includes("inactivo")) return;
		DOM.datosBreves.classList.toggle("toggle");
		DOM.datosLargos.classList.add("toggle"); // oculto
	});
});
