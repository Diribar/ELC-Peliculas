"use strict";
window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let input = document.querySelector(".input-error .input");
	let iconoError = document.querySelector(".input-error .fa-circle-xmark");
	let iconoOK = document.querySelector(".input-error .fa-circle-check");
	let mensajes = document.querySelector(".input-error .mensajeError");

	// Acciones si se realizan cambios
	input.addEventListener("input", async () => {
		let campo = input.name;
		let valor = input.value;
		let errores = await fetch("/usuarios/api/validar-mail/?" + campo + "=" + valor).then((n) => n.json());
		let mensaje = errores[campo];
		mensajes.innerHTML = mensaje;
		if (mensaje) {
			iconoError.classList.remove("ocultar");
			iconoOK.classList.add("ocultar");
			button.classList.add("inactivo");
		} else {
			iconoError.classList.add("ocultar");
			iconoOK.classList.remove("ocultar");
			button.classList.remove("inactivo");
		}
	});

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("inactivo")) e.preventDefault();
		button.classList.add("inactivo");
	});

	// Start-up: anular 'submit' si hay algún error
	if (!iconoError.classList.contains("ocultar")) button.classList.add("inactivo");

});
