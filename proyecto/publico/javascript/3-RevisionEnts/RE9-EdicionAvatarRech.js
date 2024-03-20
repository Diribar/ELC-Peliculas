"use strict";
window.addEventListener("load", () => {
	let DOM = {
		// Iconos
		accesoAlCartelRechazo: document.querySelector("#mostrarMotivos"),

		// Borrar
		todoElMain: document.querySelector("#todoElMain"),
		tapaElFondo: document.querySelector("#tapaElFondo"),
		cartelRechazo: document.querySelector("#cartelRechazo"),
		motivoRechazo: document.querySelector("#cartelRechazo select"),
		cancelar: document.querySelector("#cartelRechazo .iconos .fa-circle-left"),
		rechazar: document.querySelector("#cartelRechazo .iconos button"),
	};

	// Muestra el menú "motivos para borrar"
	DOM.accesoAlCartelRechazo.addEventListener("click", () => {
		DOM.todoElMain.classList.remove("ocultar");
		DOM.tapaElFondo.classList.remove("ocultar");
		DOM.cartelRechazo.classList.remove("ocultar");
	});

	// Oculta el menú "motivos para borrar"
	DOM.cancelar.addEventListener("click", () => {
		DOM.todoElMain.classList.add("ocultar");
		DOM.tapaElFondo.classList.add("ocultar");
		DOM.cartelRechazo.classList.add("ocultar");
	});

	// Elegi motivo rechazo
	DOM.motivoRechazo.addEventListener("change", () => {
		if (DOM.motivoRechazo.value) DOM.rechazar.classList.remove("inactivo");
		else DOM.rechazar.classList.add("inactivo");
	});

	// Rechazar
	DOM.rechazar.addEventListener("click", (e) => {
		if (!DOM.motivoRechazo.value) e.preventDefault();
	});
});
