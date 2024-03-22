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
		acostado: {
			info: DOM.cuerpo.querySelector("#datosLargos"),
			calif: DOM.cuerpo.querySelector("#datosBreves"),
		},

		// Sector Imagen Derecha
		centro: DOM.imgDerecha.querySelector("#centro img"),
		conjuntoIconos: DOM.imgDerecha.querySelector("#conjuntoIconos"),
	};
	DOM = {
		...DOM,

		// Centro
		imagen: centro.querySelector("img"),
		links: centro.querySelector("#links"),
		parado: {
			info: centro.querySelector("#marcoInfo"),
			calif: centro.querySelector("#recuadroDB"),
		},

		// Íconos
		muestraInfo: DOM.conjuntoIconos.querySelector("#muestraInfo"),
		muestraCalif: DOM.conjuntoIconos.querySelector("#muestraCalif"),
	};

	// Event listeners - Toggles 'conjuntoIconos', 'centro links'
	DOM.imagen.addEventListener("click", () => {
		DOM.parado.info.classList.add("toggle"); // información
		DOM.parado.calif.classList.add("toggle");// calificación
		DOM.links.classList.toggle("ocultar"); // links de la película
		DOM.conjuntoIconos.classList.toggle("invisible"); // íconos
	});

	// Event listeners - Muestra la info
	DOM.muestraInfo.addEventListener("click", () => {
		// Toggle 'info' para parado
		DOM.parado.info.classList.toggle("toggle");

		// Muestra 'info' para acostado
		DOM.acostado.info.classList.remove("ocultar");

		// Oculta 'calif'
		DOM.acostado.calif.classList.add("toggle");
		DOM.parado.calif.classList.add("toggle");
	});

	// Event listeners - Muestra la calificación
	DOM.muestraCalif.addEventListener("click", () => {
		// Toggle 'calif' para parado
		DOM.parado.calif.classList.toggle("toggle");

		// Muestra 'calif' para acostado
		DOM.acostado.calif.classList.remove("toggle");

		// Oculta 'info'
		DOM.acostado.info.classList.add("ocultar");
		DOM.parado.info.classList.add("toggle");
	});
});
