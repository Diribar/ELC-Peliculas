"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let inputs = document.querySelectorAll("#dataEntry .input");
	// Variables de errores
	let iconoError = document.querySelectorAll(".fa-circle-xmark");
	let iconoOK = document.querySelectorAll(".fa-circle-check");
	let resultadoInvalido = document.querySelector(".resultadoInvalido");
	let mensajesError = document.querySelectorAll(".mensajeError");
	// Varias
	let botonSubmit = document.querySelector("form button[type='submit']");
	let submit = document.querySelector("form button[type='submit'] .icono");
	let errores = {};

	// Fórmulas ----------------------------------------------------
	// Devuelve todos los errores
	let averiguaLosErrores = async () => {
		let datos = "";
		inputs.forEach((input) => {
			if (datos) datos += "&";
			datos += input.name + "=" + encodeURIComponent(input.value);
		});
		// Obtener los errores
		errores = await fetch("/usuarios/api/validar-login/?" + datos).then((n) => n.json());
		// Fin
		return;
	};
	// Muestra el ícono de error/acierto
	let consecuenciaDeError = (i) => {
		// Averiguar si hay un error
		let campo = inputs[i].name;
		let mensaje = errores[campo];
		mensajesError[i].innerHTML = mensaje;
		// IconosError
		mensaje ? iconoError[i].classList.remove("ocultar") : iconoError[i].classList.add("ocultar");
		// IconosOK
		mensaje ? iconoOK[i].classList.add("ocultar") : iconoOK[i].classList.remove("ocultar");
		// Fin
		actualizaBotonSubmit();
		return;
	};
	// Anula/activa el botón 'Submit'
	let actualizaBotonSubmit = () => {
		if (errores.hay || !resultadoInvalido.className.includes("ocultar")) {
			botonSubmit.classList.add("inactivo");
			submit.classList.add("inactivo");
		} else {
			botonSubmit.classList.remove("inactivo");
			submit.classList.remove("inactivo");
		}
		return;
	};

	// Desactiva el cartel de 'credenciales inválidas'
	form.addEventListener("input", () => resultadoInvalido.classList.add("ocultar"));

	// Revisa el data-entry modificado y comunica si está OK o no
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("input", async () => {
			await averiguaLosErrores();
			console.log(errores);
			// Realiza acciones sobre el input cambiado
			consecuenciaDeError(i);
		});
	}

	// Submit
	form.addEventListener("submit", async (e) => {
		await averiguaLosErrores();
		if (!errores.hay) e.preventDefault();
		else return;
	});

	// Status inicial
	// Revisa los errores en los inputs
	await averiguaLosErrores();
	// Consecuencia de los errores
	for (let i = 0; i < inputs.length; i++) {
		if (inputs[i].value) consecuenciaDeError(i);
	}
});
