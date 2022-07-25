"use strict";
window.addEventListener("load", () => {
	// Variables
	let iconoAyuda = document.querySelector("main #tituloConAyuda .fa-circle-question");
	let mensajeAyuda = document.querySelector("main #tituloConAyuda .mensajeAyuda");
	console.log(iconoAyuda);
	
	// Mensajes de ayuda
	window.addEventListener("click", (e) => {
		e.target == iconoAyuda
			? mensajeAyuda.classList.toggle("ocultar")
			: mensajeAyuda.classList.add("ocultar");
	});
});
