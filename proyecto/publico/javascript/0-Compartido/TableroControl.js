"use strict";

window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		mostrarOcultar: document.querySelectorAll(".bloques .temas h3"),
		bloqueRegistros: document.querySelectorAll(".bloques .temas .bloqueRegistros"),
	};
	const actualizaVisibles = "/revision/api/actualiza-visibles/?datos=";
	const tablero="tablero-de-"
	let circuito = location.pathname;
	const indice = circuito.indexOf(tablero);
	if (indice != -1) circuito = circuito.slice(indice).replace(tablero,"");

	// Muestra u oculta
	DOM.mostrarOcultar.forEach((mostrarOcultar, i) => {
		// Revisa para cada bloque
		mostrarOcultar.addEventListener("click", () => {
			// Muestra u oculta el bloque de registros
			DOM.bloqueRegistros[i].classList.toggle("ocultar");

			// Genera los datos a exportar
			const familias = DOM.mostrarOcultar[i].parentNode.parentNode.children[0].children[0].innerText.toLowerCase();
			let titulo = DOM.mostrarOcultar[i].innerHTML.toLowerCase();
			titulo = titulo.slice(0, titulo.indexOf("(") - 1);
			const desplegar = !DOM.bloqueRegistros[i].className.includes("ocultar");
			const datos = {circuito, familias, titulo, desplegar};

			// Exporta los datos
			fetch(actualizaVisibles + JSON.stringify(datos));
		});
	});
});
