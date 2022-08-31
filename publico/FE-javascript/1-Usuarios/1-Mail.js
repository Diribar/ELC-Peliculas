"use strict";
window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let input = document.querySelector(".input-error .input");
	let iconoError = document.querySelector(".input-error .fa-circle-xmark");
	let mensajes = document.querySelector(".input-error .mensajeError");

	// Anular 'submit' si hay algún error
	if (!iconoError.classList.contains("ocultar")) button.classList.add("inactivo");
	// Acciones si se realizan cambios
	input.addEventListener("input", async () => {
		let campo = input.name;
		let valor = input.value;
		let errores = await fetch("/usuarios/api/validar-mail/?" + campo + "=" + valor).then((n) => n.json());
		let mensaje = errores[campo];
		mensajes.innerHTML = mensaje;
		if (mensaje) {
			iconoError.classList.remove("ocultar");
			button.classList.add("inactivo");
		} else {
			iconoError.classList.add("ocultar");
			button.classList.remove("inactivo");
		}
	});

	form.addEventListener("submit", (e) => {
		if (button.classList.contains("inactivo")) e.preventDefault();
		button.classList.add("inactivo");
	});
});
