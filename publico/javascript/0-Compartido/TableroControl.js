"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		mostrarOcultar: document.querySelectorAll(".bloques .temas h3"),
		bloqueRegistros: document.querySelectorAll(".bloques .temas .bloqueRegistros"),
	};
	let ruta = {
		actualizarVisibles: "/crud/api/actualiza-visibles/?circuito=",
	};
	let circuito = location.pathname.slice(1);
	const indice = circuito.indexOf("/");
	if (indice != -1) circuito = circuito.slice(0, indice);

	// Muestra u oculta
	DOM.mostrarOcultar.forEach((mostrarOcultar, i) => {
		// Revisa para cada bloque
		mostrarOcultar.addEventListener("click", () => {
			DOM.bloqueRegistros[i].classList.toggle("ocultar");
			const desplegar = !DOM.bloqueRegistros[i].className.includes("ocultar");
			console.log(ruta.actualizarVisibles + circuito + "&desplegar=" + desplegar);
			fetch(ruta.actualizarVisibles + circuito + "&desplegar=" + desplegar);
		});
	});
});
