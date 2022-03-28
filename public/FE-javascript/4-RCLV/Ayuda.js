"use strict";
window.addEventListener("load", () => {
	// Variables
	let iconosAyuda = document.querySelectorAll(".fa-circle-question");
	let mensajesAyuda = document.querySelectorAll(".mensajeAyuda");

	// Mensajes de ayuda
	window.onclick = (e) => {
		for (let i = 0; i < iconosAyuda.length; i++) {
			iconosAyuda[i].parentNode.children[0] == e.target.parentNode.children[0] &&
			e.target.className.includes("fa-circle-question")
				? mensajesAyuda[i].classList.toggle("ocultar")
				: mensajesAyuda[i].classList.add("ocultar");
		}
	};
});
