"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		cuerpo: document.querySelector("#cuerpo #datos"),
		imgDerecha: document.querySelector("#imgDerecha"),
	};

	// Sector Cuerpo
	if (DOM.cuerpo) {
		DOM.datosLargos = DOM.cuerpo.querySelector("#datosLargos");
		DOM.datosBreves = DOM.cuerpo.querySelector("#datosBreves");
	}

	// Sector Imagen Derecha
	DOM = {
		...DOM,
		imagen: DOM.imgDerecha.querySelector("img"),
		links: DOM.imgDerecha.querySelector("#links"),
		sectorIconos: DOM.imgDerecha.querySelector("#sectorIconos"),
	};

	// Íconos
	if (DOM.sectorIconos) {
		DOM.muestraDL = DOM.sectorIconos.querySelector("#muestraDL");
		DOM.muestraDB = DOM.sectorIconos.querySelector("#muestraDB");
	}
	if (window.matchMedia("(orientation: landscape)").matches) DOM.datosLargos.classList.remove("toggle"); // inicialmente visibles en acostados

	// Event listeners - Start-up / Sólo la imagen
	DOM.imagen.addEventListener("click", () => {
		if (DOM.links) DOM.links.classList.toggle("ocultar"); // inicialmente visibles siempre
		if (DOM.sectorIconos) DOM.sectorIconos.classList.remove("ocultar"); // inicialmente visibles siempre
		if (DOM.datosLargos) DOM.datosLargos.classList.add("toggle"); // oculto
		if (DOM.datosBreves) DOM.datosBreves.classList.add("toggle"); // oculto
	});

	// Event listeners - Muestra datosLargos
	if (DOM.muestraDL)
		DOM.muestraDL.addEventListener("click", () => {
			DOM.datosLargos.classList.toggle("toggle");
			DOM.datosBreves.classList.add("toggle"); // oculto
		});

	// Event listeners - Muestra datosBreves
	if (DOM.muestraDB)
		DOM.muestraDB.addEventListener("click", () => {
			if (DOM.muestraDB && DOM.muestraDB.className.includes("inactivo")) return;
			DOM.datosBreves.classList.toggle("toggle");
			DOM.datosLargos.classList.add("toggle"); // oculto
		});
});
