"use strict";
window.addEventListener("load", () => {
	// VARIABLES GENERALES -----------------------------------------------------------------------
	// Datos del formulario
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll("form .input-error .input");
	// OK/Errores
	let iconosOK = document.querySelectorAll("form .input-error .fa-circle-check");
	let iconosError = document.querySelectorAll("form .input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll("form .input-error .mensajeError");
	// Varias
	let tarea = window.location.pathname;
	tarea = tarea.slice(tarea.lastIndexOf("/") + 1);
	let tareas = {
		login: "login",
		"datos-perennes": "perennes",
		"datos-editables": "editables",
		documento: "documento",
	};
	if (!tareas[tarea]) return;
	let ruta_api = "/usuarios/api/validar-" + tareas[tarea] + "/?";

	// FUNCIONES --------------------------------------------------------------
	let detectaErrores = async (i, e) => {
		let campo = inputs[i].name;
		let valor = encodeURIComponent(inputs[i].value);
		if (campo.includes("avatar") && e) valor += "&tamano=" + e.target.files[0].size;
		let errores = await fetch(ruta_api + campo + "=" + valor).then((n) => n.json());
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
		inputs[i].addEventListener("input", async (e) => {
			// Desactiva el cartel de 'credenciales inválidas'
			if (tarea == "login" || tarea == "documento")
				document.querySelector(".resultadoInvalido").classList.add("ocultar");
			// Detecta si hay errores
			let [errores, campo] = await detectaErrores(i, e);
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
				if (campo.includes("avatar")) console.log(errores);
				consecuenciaError(errores, campo, i);
			}
			botonGuardar();
		}
	});
});
