"use strict";
window.addEventListener("load", () => {
	// Declaración de variables
	let url = document.querySelector("form #segundaColumna #url");

	// Copiar al portapapeles
	if (url && url.innerHTML) {
		let preview = document.querySelector("form #segundaColumna #preview");
		preview.addEventListener("click", () => {
			navigator.clipboard.writeText(url.innerHTML);
		});
	}
});
