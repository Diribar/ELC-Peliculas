"use strict";
window.addEventListener("load", async () => {
	console.log("SI");
	// Variables
	let DOM = {
		desplegar: document.querySelectorAll(".bloques .temas .desplegar"),
		replegar: document.querySelectorAll(".bloques .temas .replegar"),
		bloqueRegistros: document.querySelectorAll(".bloques .temas .bloqueRegistros"),
	};
	let varios = {
		alturas: [],
	};

	// Fórmulas - Obtiene las alturas
	for (let i = 0; i < DOM.bloqueRegistros.length; i++) {
		DOM.bloqueRegistros[i].classList.remove("ocultar");
		varios.alturas[i] = DOM.bloqueRegistros[i].offsetHeight;
		DOM.bloqueRegistros[i].style.height = 0;
	}

	// Eventos - Desplegar
	DOM.desplegar.forEach((desplegar, i) => {
		desplegar.addEventListener("click", () => {
			// Oculta el ícono y muestra el de replegar
			desplegar.classList.add("ocultar");
			DOM.replegar[i].classList.remove("ocultar");

			// Despliega
			let altura = 0;
			DOM.bloqueRegistros[i].style.height = altura;
			DOM.bloqueRegistros[i].classList.remove("ocultar");
			console.log(varios.alturas[i]);
			while (altura < varios.alturas[i]) {
				// Cambia la altura
				altura++;
				DOM.bloqueRegistros[i].style.height = altura + "px";
			}
		});
	});
	// Eventos - Replegar
	DOM.replegar.forEach((replegar, i) => {
		replegar.addEventListener("click", () => {
			// Oculta el ícono y muestra el de replegar
			replegar.classList.add("ocultar");
			DOM.desplegar[i].classList.remove("ocultar");

			// Despliega
			let altura = varios.alturas[i];
			DOM.bloqueRegistros[i].style.height = altura;
			DOM.bloqueRegistros[i].classList.remove("ocultar");
			while (altura > 0) {
				altura--;
				DOM.bloqueRegistros[i].style.height = altura + "px";
			}
		});
	});
});
