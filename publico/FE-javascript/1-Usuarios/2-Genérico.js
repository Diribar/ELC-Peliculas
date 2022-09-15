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
	// Varias
	let tarea = window.location.pathname;
	tarea = tarea.slice(tarea.lastIndexOf("/") + 1);
	let tareas = {
		login: {ruta: "login", evento: "input"},
		"datos-perennes": {ruta: "perennes", evento: "input"},
		"datos-editables": {ruta: "editables", evento: "input"},
		documento: {ruta: "documento", evento: "input"},
	};
	if (!tareas[tarea]) return;
	let ruta_api = "/usuarios/api/validar-" + tareas[tarea].ruta;
	let evento = tareas[tarea].evento;

	// FUNCIONES --------------------------------------------------------------
	let detectaErrores = async (i) => {
		let campo = inputs[i].name;
		let valor = inputs[i].value;
		let errores = await fetch(ruta_api + "/?" + campo + "=" + valor).then((n) => n.json());
		// Fin
		return [errores, campo];
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

	// EVENT LISTENERS ---------------------------------------
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener(evento, async () => {
			// Desactiva el cartel de 'credenciales inválidas'
			if (tarea == "login") document.querySelector(".resultadoInvalido").classList.add("ocultar");
			// Detecta si hay errores
			let [errores, campo] = await detectaErrores(i);
			// Comunica los aciertos y errores
			consecuenciaError(errores, campo, i);
			// Activa/Desactiva el botón 'Guardar'
			botonGuardar();
		});
	}
	form.addEventListener("submit", async (e) => {
		if (button.classList.contains("inactivo")) {
			e.preventDefault();
			for (let i = 0; i < inputs.length; i++) {
				let [errores, campo] = await detectaErrores(i);
				consecuenciaError(errores, campo, i);
			}
			botonGuardar();
		}
	});
});
