"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let inputs = document.querySelectorAll("#dataEntry input");
	// Variables de errores
	let iconoError = document.querySelectorAll(".fa-circle-xmark");
	let iconoOK = document.querySelectorAll(".fa-circle-check");
	let resultadoInvalido = document.querySelector("#resultadoInvalido");
	let mensajesError = document.querySelectorAll(".mensajeError");
	// Varias
	let button = document.querySelector("form button[type='submit']");
	let errores;

	// Fórmulas ----------------------------------------------------
	// Devuelve todos los errores
	let averiguaLosErrores = async () => {
		let url;
		inputs.forEach((input, i) => {
			if (i) url += "&";
			url += inputs[i].name + "=" + encodeURIComponent(inputs[i].value);
		});
		// Obtener los errores
		errores = await fetch("/usuarios/api/validar-login/?" + url).then((n) => n.json());
		// Fin
		return;
	};
	// Anula/activa el botón 'Submit', muestra el ícono de error/acierto
	let consecuenciasDeErrores = (i, errores) => {
		// Averiguar si hay un error
		let campo = inputs[i].name;
		let mensaje = errores[campo];
		mensajesError[i].innerHTML = mensaje;
		// IconosError
		mensaje ? iconoError[i].classList.remove("ocultar") : iconoError[i].classList.add("ocultar");
		// IconosOK
		mensaje ? iconoOK[i].classList.add("ocultar") : iconoOK[i].classList.remove("ocultar");
	};
	let botonSubmit = () => {
		// En caso de error
		if (mensaje) {
			button.classList.add("inactivo");
		} else {
			// En caso de que no haya error
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
			let errores = await averiguaLosErrores();
			// Realiza acciones sobre el input cambiado
			consecuenciasDeErrores(i, errores);
		});
	}

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("inactivo")) e.preventDefault();
	});

	// Status inicial
	await averiguaLosErrores();
	// Revisa los errores en los inputs
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].value != "" ? consecuenciasDeErrores(i, errores) : "";
	}
});
