"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let inputs = document.querySelectorAll("#dataEntry input");
	let iconoError = document.querySelectorAll(".fa-circle-xmark");
	let iconoOK = document.querySelectorAll(".fa-circle-check");
	let mensajesError = document.querySelectorAll(".mensajeError");
	let button = document.querySelector("form button[type='submit']");
	let statusInicial = true;
	let resultadoInvalido = document.querySelector("#resultadoInvalido");

	// Fórmulas ----------------------------------------------------
	// Revisa todos los inputs y devuelve todos los errores
	let averiguarErrores = () => {
		let url = "?";
		for (let i = 0; i < inputs.length; i++) {
			if (i > 0) url += "&";
			url += inputs[i].name;
			url += "=";
			url += encodeURIComponent(inputs[i].value);
		}
		return fetch("/usuarios/api/validar-login/" + url).then((n) => n.json());
	};

	// Anula/activa el botón 'Submit', muestra el ícono de error/acierto
	let accionesSiHayErrores = (i, errores) => {
		// Averiguar si hay un error
		let campo = inputs[i].name;
		let mensaje = errores[campo];
		mensajesError[i].innerHTML = mensaje;
		// En caso de error
		if (mensaje) {
			iconoError[i].classList.remove("ocultar");
			iconoOK[i].classList.add("ocultar");
			button.classList.add("inactivo");
		} else {
			// En caso de que no haya error
			iconoError[i].classList.add("ocultar");
			iconoOK[i].classList.remove("ocultar");
			let sinErrores = true;
			for (let j = 0; j < inputs.length; j++) {
				iconoOK[j].classList.contains("ocultar") || !resultadoInvalido.classList.contains("ocultar")
					? (sinErrores = false)
					: "";
			}
			sinErrores ? button.classList.remove("inactivo") : button.classList.add("inactivo");
		}
	};

	// Revisa el data-entry modificado y comunica si está OK o no
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("change", async () => {
			resultadoInvalido.classList.add("ocultar");
			let errores = await averiguarErrores();
			// Realiza acciones sobre el input cambiado
			accionesSiHayErrores(i, errores);
		});
	}

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("inactivo")) e.preventDefault();
	});

	// Status inicial
	if (statusInicial) {
		let errores = await averiguarErrores();
		// Revisa los errores en los inputs
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value != "" ? accionesSiHayErrores(i, errores) : "";
		}
		statusInicial = false;
	}
});
