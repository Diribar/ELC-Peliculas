"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		form: document.querySelector("form"),
		eliminar: document.querySelector("form #eliminar"),
	};
	let rutas = {
		calificacionGuardada:""
	};
	let v = {};

	// Funciones
	let revisaErrores = () => {};

	let activaInactivaBoton = {
		guardar: () => {},
		eliminar: () => {},
	};

	// Input
	DOM.form.addEventListener("input", (e) => {});
	DOM.form.addEventListener("submit", () => {
		if (button.classList.contains("inactivo")) e.preventDefault();
		return;
	});
	DOM.eliminar.addEventListener("click", () => {
		// Si no está activo, termina la función
		if (DOM.eliminar.classList.contains("inactivo")) return;

		// Elimina la calificación

		// Recarga la vista
		location.reload();
	});
});
