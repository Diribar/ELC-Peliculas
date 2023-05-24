"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		mostrarOcultar: document.querySelectorAll(".bloques .temas h3"),
		bloqueRegistros: document.querySelectorAll(".bloques .temas .bloqueRegistros"),
	};

	let ruta = {
		actualizarVisibles: "/crud/api/actualiza-visibles/?datos=",
	};
	let circuito = location.pathname.slice(1);
	const indice = circuito.indexOf("/");
	if (indice != -1) circuito = circuito.slice(0, indice);

	// Muestra u oculta
	DOM.mostrarOcultar.forEach((mostrarOcultar, i) => {
		// Revisa para cada bloque
		mostrarOcultar.addEventListener("click", () => {
			// Muestra u oculta el bloque de registros
			DOM.bloqueRegistros[i].classList.toggle("ocultar");

			// Genera los datos a exportar
			const familia = DOM.mostrarOcultar[i].parentNode.parentNode.children[0].children[0].innerText.toLowerCase();
			let titulo = DOM.mostrarOcultar[i].innerHTML.toLowerCase();
			titulo = titulo.slice(0, titulo.indexOf("(") - 1);
			const desplegar = !DOM.bloqueRegistros[i].className.includes("ocultar");
			const datos = {circuito, familia, titulo, desplegar};

			// Exporta los datos
			fetch(ruta.actualizarVisibles + JSON.stringify(datos));
		});
	});
});
