"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		form: document.querySelector("form"),
		button: document.querySelector("form button[type='submit']"),
		email: document.querySelector(".inputError .input[name='email']"),
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
		documNumero: document.querySelector(".inputError .input#documNumero"),
		documPais_id: document.querySelector(".inputError .input#documPais_id"),
	};

	// Funciones -----------------------------
	let mostrarIconos = (mensaje, i) => {
		DOM.mensajesError[i].innerHTML = mensaje;
		if (mensaje) {
			DOM.iconosError[i].classList.remove("ocultar");
			DOM.iconosOK[i].classList.add("ocultar");
		} else {
			DOM.iconosError[i].classList.add("ocultar");
			DOM.iconosOK[i].classList.remove("ocultar");
		}

		// Botón Submit
		botonSubmit();

		// Fin
		return;
	};
	let botonSubmit = () => {
		let OK = Array.from(DOM.iconosOK)
			.map((n) => n.className)
			.every((n) => !n.includes("ocultar"));

		let error = Array.from(DOM.iconosError)
			.map((n) => n.className)
			.every((n) => n.includes("ocultar"));

		OK && error ? DOM.button.classList.remove("inactivo") : DOM.button.classList.add("inactivo");
	};

	// Acciones si se realizan cambios en el mail
	DOM.email.addEventListener("input", async () => {
		let campo = DOM.email.name;
		let valor = DOM.email.value;
		let errores = await fetch("/usuarios/api/valida-mail/?" + campo + "=" + valor).then((n) => n.json());
		let mensaje = errores[campo];
		mostrarIconos(mensaje, 0);
	});

	// Acciones si se realizan cambios en el n° de codumento o país
	if (DOM.documNumero && DOM.documPais_id) {
		DOM.documNumero.addEventListener("input", () => {
			// Impide los caracteres que no son válidos
			DOM.documNumero.value = DOM.documNumero.value.toUpperCase().replace(/[^A-Z\d]/g, "");
			let mensaje = !DOM.documNumero.value ? "Necesitamos que completes este campo" : "";
			mostrarIconos(mensaje, 1);
		});
		DOM.documPais_id.addEventListener("input", () => {
			let mensaje = !DOM.documPais_id.value ? "Necesitamos que elijas un país" : "";
			mostrarIconos(mensaje, 2);
		});
	}

	// Submit
	DOM.form.addEventListener("submit", (e) => {
		if (DOM.button.className.includes("inactivo")) e.preventDefault();
		DOM.button.classList.add("inactivo");
	});

	// Start-up: anula 'submit' si hay algún error
	botonSubmit();
});
