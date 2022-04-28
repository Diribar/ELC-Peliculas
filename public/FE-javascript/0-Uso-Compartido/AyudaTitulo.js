"use strict";
window.addEventListener("load", () => {
	// Variables
	let iconoAyuda = document.querySelector("main #titulo .fa-circle-question");
	let mensajeAyuda = document.querySelector("main #titulo .mensajeAyuda");

	// Mensajes de ayuda
	window.addEventListener("click", (e) => {
		e.target == iconoAyuda
			? mensajeAyuda.classList.toggle("ocultar")
			: mensajeAyuda.classList.add("ocultar");
	});
});
