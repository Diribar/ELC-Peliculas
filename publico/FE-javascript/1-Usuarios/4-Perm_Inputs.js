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
	let errores;

	// FUNCIONES ---------------------------------------------
	let erroresAciertos = async (indice) => {
		let campo = inputs[indice].name;
		let valor = inputs[indice].value;
		errores = {
			...errores,
			...(await fetch("/usuarios/api/validar-validarIdentidad/?" + campo + "=" + valor).then((n) => n.json())),
		};
	};
	let mensajes = (indice) => {
		let campo = inputs[indice].name;
		// Guarda el mensaje de error
		let mensaje = errores[campo];
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
	let startUp = async () => {
		// Mostrar todos los errores y aciertos
		for (let i = 0; i < inputs.length; i++) {
			await erroresAciertos(i);
		}
		botonGuardar();
	};

	// EVENT LISTENERS ---------------------------------------
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("change", async () => {
			await erroresAciertos(i);
			mensajes(i);
			botonGuardar(); // Activa/Desactiva el botón 'Guardar'
		});
	}

	form.addEventListener("submit", async (e) => {
		//e.preventDefault();
		if (button.classList.contains("inactivo")) {
			// Bloquear el 'submit'
			e.preventDefault();
			// Continuar
			await startUp();
			for (let i = 0; i < inputs.length; i++) {
				mensajes(i);
			}
		}
	});

	// Start-up
	startUp();
});
