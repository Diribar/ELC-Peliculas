"use strict";
window.addEventListener("load", () => {
	// VARIABLES GENERALES -----------------------------------------------------------------------
	// Datos del formulario
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll("form .inputError .input");
	// OK/Errores
	let iconosOK = document.querySelectorAll("form .inputError .fa-circle-check");
	let iconosError = document.querySelectorAll("form .inputError .fa-circle-xmark");
	let mensajesError = document.querySelectorAll("form .inputError .mensajeError");
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
		// Variables
		let campo = inputs[i].name;
		let valor = encodeURIComponent(inputs[i].value);
		// Particularidad para 'avatar'
		if (campo.includes("avatar") && e) valor += "&tamano=" + e.target.files[0].size;
		// Averiguar los errores
		let errores = await fetch(ruta_api + campo + "=" + valor).then((n) => n.json());
		// Fin
		return [errores, campo];
	};
	let consecuenciaError = (error, campo, indice) => {
		// Guarda el mensaje de error
		let mensaje = error[campo];
		// Reemplaza el mensaje, con particularidad para 'avatar'
		mensaje =
			campo != "docum_avatar" || mensaje || inputs[indice].value
				? mensaje
				: mensajesError[indice].innerHTML;
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
			if (tarea == "login") document.querySelector(".resultadoInvalido").classList.add("ocultar");
			let campo = inputs[i].name;
			if (
				tarea == "documento" &&
				(campo == "docum_numero" || campo == "docum_pais_id") &&
				document.querySelector("#credencialesInvalidas")
			)
				document.querySelector("#credencialesInvalidas").classList.add("ocultar");
			// Detecta si hay errores
			let errores;
			[errores, campo] = await detectaErrores(i, e);
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
