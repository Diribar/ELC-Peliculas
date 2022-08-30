"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let inputs = document.querySelectorAll("#dataEntry .input");
	// Variables de errores
	let iconosError = document.querySelectorAll(".fa-circle-xmark");
	let iconosOK = document.querySelectorAll(".fa-circle-check");
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
		mensaje ? iconosError[i].classList.remove("ocultar") : iconosError[i].classList.add("ocultar");
		// IconosOK
		mensaje ? iconosOK[i].classList.add("ocultar") : iconosOK[i].classList.remove("ocultar");
		// Fin
		return;
	};
	let actualizaBotonSubmit = () => {
		if (iconosError[0].className.includes("ocultar") && iconosError[1].className.includes("ocultar"))
			botonSubmit.classList.remove("inactivo");
		else botonSubmit.classList.add("inactivo");
	};

	// Revisa el data-entry modificado y comunica si está OK o no
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("input", async () => {
			// Desactiva el cartel de 'credenciales inválidas'
			resultadoInvalido.classList.add("ocultar");
			// Averigua los errores
			await averiguaLosErrores();
			// Realiza acciones sobre el input cambiado
			consecuenciaDeError(i);
			// Actualiza el botón submit
			actualizaBotonSubmit();
		});
	}

	// Submit
	form.addEventListener("submit", (e) => {
		if (botonSubmit.className.includes("inactivo")) e.preventDefault();
	});
});
