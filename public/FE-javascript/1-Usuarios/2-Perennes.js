"use strict";
window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll(".input-error .input");
	let asteriscos = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajes = document.querySelectorAll(".input-error .mensajeError");

	for (let i = 0; i < inputs.length; i++) {
		// Anular 'submit' si hay algún error
		!asteriscos[i].classList.contains("ocultar")
			? button.classList.add("inactivo")
			: "";
		// Acciones si se realizan cambios
		inputs[i].addEventListener("change", async () => {
			let campo = inputs[i].name;
			let valor = inputs[i].value;
			let errores = await fetch(
				"/usuarios/api/validar-perennes/?" +
					campo +
					"=" +
					valor
			).then((n) => n.json());
			let mensaje = errores[campo];
			mensajes[i].innerHTML = mensaje;
			if (mensaje) {
				asteriscos[i].classList.remove("ocultar");
				button.classList.add("inactivo");
			} else {
				asteriscos[i].classList.add("ocultar");
				button.classList.remove("inactivo");
				for (let j = 0; j < inputs.length; j++) {
					mensajes[j].innerHTML
						? button.classList.add("inactivo")
						: "";
				}
			}
		});
	}
	form.addEventListener("submit", (e) => {
		button.classList.contains("inactivo") ? e.preventDefault() : "";
	});
});
