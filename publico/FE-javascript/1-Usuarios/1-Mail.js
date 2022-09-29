"use strict";
window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let email = document.querySelector(".inputError .input[name='email']");
	let iconosError = document.querySelectorAll(".inputError .fa-circle-xmark");
	let iconosOK = document.querySelectorAll(".inputError .fa-circle-check");
	let mensajes = document.querySelectorAll(".inputError .mensajeError");

	// Funciones -----------------------------
	let mostrarIconos = (mensaje, i) => {
		mensajes[i].innerHTML = mensaje;
		if (mensaje) {
			iconosError[i].classList.remove("ocultar");
			iconosOK[i].classList.add("ocultar");
		} else {
			iconosError[i].classList.add("ocultar");
			iconosOK[i].classList.remove("ocultar");
		}
		// Botón Submit
		botonSubmit();
		// Fin
		return;
	};
	let botonSubmit = () => {
		let OK = Array.from(iconosOK)
			.map((n) => n.className)
			.every((n) => !n.includes("ocultar"));
		// < iconosOK.length;
		let error = Array.from(iconosError)
			.map((n) => n.className)
			.every((n) => n.includes("ocultar"));
		OK && error ? button.classList.remove("inactivo") : button.classList.add("inactivo");
	};

	// Acciones si se realizan cambios
	email.addEventListener("input", async () => {
		let campo = email.name;
		let valor = email.value;
		let errores = await fetch("/usuarios/api/validar-mail/?" + campo + "=" + valor).then((n) => n.json());
		let mensaje = errores[campo];
		mostrarIconos(mensaje, 0);
	});
	let docum_numero = document.querySelector(".inputError .input#docum_numero");
	let docum_pais_id = document.querySelector(".inputError .input#docum_pais_id");
	if (docum_numero && docum_pais_id) {
		docum_numero.addEventListener("input", () => {
			// Impide los caracteres que no son válidos
			docum_numero.value = docum_numero.value.toUpperCase().replace(/[^A-Z\d]/g, "");
			let mensaje = !docum_numero.value ? "Necesitamos que completes este campo" : "";
			mostrarIconos(mensaje, 1);
		});
		docum_pais_id.addEventListener("input", () => {
			let mensaje = !docum_pais_id.value ? "Necesitamos que elijas un país" : "";
			mostrarIconos(mensaje, 2);
		});
	}

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("inactivo")) e.preventDefault();
		button.classList.add("inactivo");
	});

	// Start-up: anular 'submit' si hay algún error
	botonSubmit();
});
