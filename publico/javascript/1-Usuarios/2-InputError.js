"use strict";
window.addEventListener("load", () => {
	// Tareas
	let tarea = window.location.pathname;
	tarea = tarea.slice(tarea.lastIndexOf("/") + 1);
	let tareas = {
		login: "login",
		"datos-perennes": "perennes",
		"datos-editables": "editables",
		documento: "documento",
	};
	if (!tareas[tarea]) return;

	// VARIABLES GENERALES -----------------------------------------------------------------------
	// Datos del formulario
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll("form .inputError .input");
	// OK/Errores
	let iconosOK = document.querySelectorAll("form .inputError .fa-circle-check");
	let ocultarOK_imagen = document.querySelector("form .inputError .fa-circle-check.ocultarOK_imagen");
	let iconosError = document.querySelectorAll("form .inputError .fa-circle-xmark");
	let mensajesError = document.querySelectorAll("form .inputError .mensajeError");
	let credencialesInvalidas = document.querySelector("#credencialesInvalidas");
	// Temas de avatar
	let imgAvatar = document.querySelector("form .inputError label img");
	let inputAvatar = document.querySelector("form .inputError input[name='avatar']");
	const imgInicial = imgAvatar ? imgAvatar.src : "";
	let esImagen = true;
	// Varias
	let ruta_api = "/usuarios/api/validar-" + tareas[tarea] + "/?";

	// FUNCIONES --------------------------------------------------------------
	let FN = {
		averiguaLosErrores: async (indice) => {
			// Variables
			let campo = inputs[indice].name;
			let valor = encodeURIComponent(inputs[indice].value);
			// Particularidad para 'avatar'
			if (campo.includes("avatar")) {
				valor += "&esImagen=" + (esImagen ? "SI" : "NO");
				if (inputAvatar.value) valor += "&tamano=" + inputAvatar.files[0].size;
			}
			// Averigua los errores
			let errores =
				// Corre la rutina, siempre que no sea una avatar opcional vacío
				tarea != "datos-editables" || campo != "avatar" || inputs[indice].value || !esImagen
					? await fetch(ruta_api + campo + "=" + valor).then((n) => n.json())
					: "";
			// Fin
			return errores;
		},
		muestraLosErrores: (error, indice) => {
			// Variables
			let campo = inputs[indice].name;
			let mensaje = error[campo];
			// Reemplaza el mensaje, con particularidad para 'avatar'
			mensajesError[indice].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			mensaje
				? iconosError[indice].classList.remove("ocultar")
				: iconosError[indice].classList.add("ocultar");
			mensaje
				? iconosOK[indice].classList.add("ocultar")
				: iconosOK[indice].classList.remove("ocultar");
		},
		actualizaBotonGuardar: () => {
			let OK = Array.from(iconosOK)
				.map((n) => n.className)
				.every((n) => !n.includes("ocultar"));
			// < iconosOK.length;
			let error = Array.from(iconosError)
				.map((n) => n.className)
				.every((n) => n.includes("ocultar"));
			OK && error ? button.classList.remove("inactivo") : button.classList.add("inactivo");
		},
		actualizaVarios: async function (indice) {
			// Detecta si hay errores
			let errores = await this.averiguaLosErrores(indice);
			// Comunica los aciertos y errores
			this.muestraLosErrores(errores, indice);
			// Activa/Desactiva el botón 'Guardar'
			this.actualizaBotonGuardar();
		},
		revisaAvatarNuevo: function (indice) {
			// 1. Si se omitió ingresar un archivo, vuelve a la imagen original
			if (!inputAvatar.value) {
				// Actualiza el avatar
				imgAvatar.src = imgInicial;
				// Oculta el iconoOK
				if (ocultarOK_imagen) ocultarOK_imagen.classList.add("ocultarOK_imagen");
				// Actualiza los errores
				esImagen = true;
				this.actualizaVarios(indice);
				// Fin
				return;
			}
			// 2. De lo contrario, actualiza los errores y el avatar
			let reader = new FileReader();
			reader.readAsDataURL(inputAvatar.files[0]);
			reader.onload = () => {
				let image = new Image();
				image.src = reader.result;
				// Acciones si es realmente una imagen
				image.onload = () => {
					// Actualiza la imagen del avatar en la vista
					imgAvatar.src = reader.result;
					// Muestra el iconoOK
					if (ocultarOK_imagen) ocultarOK_imagen.classList.remove("ocultarOK_imagen");
					// Actualiza los errores
					esImagen = true;
					FN.actualizaVarios(indice);
					// Fin
					return;
				};
				// Acciones si no es una imagen
				image.onerror = () => {
					// Limpia el avatar
					imgAvatar.src = "/imagenes/0-Base/sinAfiche.jpg";
					// Limpia el input
					inputAvatar.value = "";
					// Actualiza los errores
					esImagen = false;
					FN.actualizaVarios(indice);
					// Fin
					return;
				};
			};
		},
	};

	// EVENT LISTENERS ---------------------------------------
	inputs.forEach((input, indice) => {
		input.addEventListener("input", async () => {
			// Variables
			let campo = input.name;
			// Desactiva el cartel de 'credenciales inválidas'
			if (
				tarea == "login" ||
				(tarea == "documento" &&
					(campo == "docum_numero" || campo == "docum_pais_id") &&
					credencialesInvalidas)
			)
				credencialesInvalidas.classList.add("ocultar");

			// Acciones si se cambió el avatar
			if (campo == "avatar") FN.revisaAvatarNuevo(indice);
			else await FN.actualizaVarios(indice);
		});
	});

	form.addEventListener("submit", async (e) => {
		if (button.classList.contains("inactivo")) {
			e.preventDefault();
			for (let indice = 0; indice < inputs.length; indice++) {
				let errores = await FN.averiguaLosErrores(indice);
				FN.muestraLosErrores(errores, indice);
			}
			FN.actualizaBotonGuardar();
		}
	});
});
