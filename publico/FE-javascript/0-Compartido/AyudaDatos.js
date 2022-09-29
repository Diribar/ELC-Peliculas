"use strict";
window.addEventListener("load", () => {
	// Variables
	let iconosAyuda = document.querySelectorAll("main .inputError .fa-circle-question");
	let mensajesAyuda = document.querySelectorAll("main .inputError .mensajeAyuda");

	// Mensajes de ayuda
	window.addEventListener("click", (e) => {
		for (let i = 0; i < iconosAyuda.length; i++) {
			e.target == iconosAyuda[i] && !iconosAyuda[i].classList.contains("inactivo")
				? mensajesAyuda[i].classList.toggle("ocultar")
				: mensajesAyuda[i].classList.add("ocultar");
		}
	});
});
