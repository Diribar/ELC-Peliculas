"use strict";
window.addEventListener("load", () => {
	// VARIABLES GENERALES -----------------------------------------------------------------------
	// Datos del formulario
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll(".input-error .input");
	// OK/Errores
	let iconosOK = document.querySelectorAll(".input-error .fa-circle-check");
	let iconosError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");

	// EVENT LISTENERS ---------------------------------------
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("change", async () => {
			let campo = inputs[i].name;
			let valor = inputs[i].value;
			let errores = await fetch("/usuarios/api/validar-editables/?" + campo + "=" + valor).then((n) =>
				n.json()
			);
			consecuenciaError(errores, campo, i);
			botonGuardar(); // Activa/Desactiva el botón 'Guardar'
		});
	}
	form.addEventListener("submit", (e) => {
		button.classList.contains("inactivo") ? e.preventDefault() : "";
	});

	// FUNCIONES --------------------------------------------------------------
	let botonGuardar = () => {
		let OK = Array.from(iconosOK)
			.map((n) => n.className)
			.every((n) => !n.includes("ocultar"));
		// < iconosOK.length;
		let error = Array.from(iconosError)
			.map((n) => n.className)
			.every((n) => n.includes("ocultar"));
		OK && error ? button.classList.remove("inactivo") : button.classList.add("inactivo");
	};
	let consecuenciaError = (error, campo, indice) => {
		// Guarda el mensaje de error
		let mensaje = error[campo];
		// Reemplaza el mensaje
		mensajesError[indice].innerHTML = mensaje;
		// Acciones en función de si hay o no mensajes de error
		mensaje
			? iconosError[indice].classList.remove("ocultar")
			: iconosError[indice].classList.add("ocultar");
		if (indice < iconosOK.length)
			!mensaje
				? iconosOK[indice].classList.remove("ocultar")
				: iconosOK[indice].classList.add("ocultar");
	};

	// STARTUP ----------------------------------------------------------------
	botonGuardar();
});
