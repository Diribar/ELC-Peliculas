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
		centro: DOM.imgDerecha.querySelector("#centro img"),
		conjuntoIconos: DOM.imgDerecha.querySelector("#conjuntoIconos"),

	};
	DOM = {
		...DOM,

		// Centro
		imagen: centro.querySelector("img"),
		links: centro.querySelector("#links"),
		infoMobileParado: centro.querySelector("#marcoInfo"),

		// Íconos
		mostrarInfo: DOM.conjuntoIconos.querySelector("#mostrarInfo"),
		mostrarCalif: DOM.conjuntoIconos.querySelector("#mostrarCalif"),
	};

	// Event listeners - Toggles 'conjuntoIconos', 'centro links'
	DOM.imagen.addEventListener("click", () => {
		DOM.links.classList.toggle("ocultar");
		DOM.conjuntoIconos.classList.toggle("invisible");
	});

	// Event listeners - Muestra la info
	DOM.mostrarInfo.addEventListener("click",()=>{
		DOM.datosLargos.classList.toggle("ocultar")
		DOM.infoMobileParado.classList.toggle("toggle")
	})
});
