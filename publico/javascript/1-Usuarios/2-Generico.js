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
	let iconosError = document.querySelectorAll("form .inputError .fa-circle-xmark");
	let mensajesError = document.querySelectorAll("form .inputError .mensajeError");
	// Temas de avatar
	let imgAvatar = document.querySelector("form .inputError label img");
	let inputAvatar = document.querySelector("form .inputError input[name='avatar']");
	let imgInicial = imgAvatar.src;
	let esImagen = true;
	let leyendaNoEsImagen= "El archivo no es una imagen"
	// Varias
	let ruta_api = "/usuarios/api/validar-" + tareas[tarea] + "/?";

	// FUNCIONES --------------------------------------------------------------
	let FN = {
		averiguaLosErrores: async (i) => {
			// Variables
			let campo = inputs[i].name;
			let valor = encodeURIComponent(inputs[i].value);
			// Particularidad para 'avatar'
			if (campo.includes("avatar")) {
				if (inputAvatar.value)valor += "&tamano=" + inputAvatar.files[0].size;

			}
			// Averigua los errores
			let errores = await fetch(ruta_api + campo + "=" + valor).then((n) => n.json());
			// Fin
			return errores;
		},
		muestraLosErrores: (error, indice) => {
			// Variables
			let campo = inputs[i].name;
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
		actualizaVarios: async function (i) {
			// Detecta si hay errores
			let errores = await this.averiguaLosErrores(i);
			// Comunica los aciertos y errores
			this.muestraLosErrores(errores, i);
			// Activa/Desactiva el botón 'Guardar'
			this.actualizaBotonGuardar();
		},
		revisaAvatarNuevo:function (i) {
			// 1. Si se omitió ingresar un archivo, vuelve a la imagen original
			console.dir(inputAvatar);
			if (!inputAvatar.value) {
				// Actualiza el avatar
				imgAvatar.src = imgInicial;
				// Actualiza los errores
				esImagen = true;
				this.actualizaVarios(i);
				// Fin
				return;
			}
			// 2. De lo contrario, actualiza los errores y el avatar
			let reader = new FileReader();
			reader.readAsDataURL(inputAvatar.files[0]);
			reader.onload = () => {
				var image = new Image();
				image.src = reader.result;
				// Acciones si es realmente una imagen
				image.onload = async () => {
					// Actualiza la imagen del avatar en la vista
					imgAvatar.src = reader.result;
					// Actualiza los errores
					esImagen = true;
					FN.actualizaVarios(i);
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
					v.esImagen = false;
					FN.actualizaVarios(i);
					// Fin
					return;
				};
			};
		},
	};

	// EVENT LISTENERS ---------------------------------------
	inputs.forEach((input, i) => {
		input.addEventListener("input", async () => {
			// Variables
			let campo = input.name;
			// Desactiva el cartel de 'credenciales inválidas'
			if (
				tarea == "login" ||
				(tarea == "documento" &&
					(campo == "docum_numero" || campo == "docum_pais_id") &&
					document.querySelector("#credencialesInvalidas"))
			)
				document.querySelector("#credencialesInvalidas").classList.add("ocultar");

			// Acciones si se cambió el avatar
			if (campo == "avatar") await FN.revisaAvatarNuevo(i);
			else await FN.actualizaVarios(i);
		});
	});

	form.addEventListener("submit", async (e) => {
		if (button.classList.contains("inactivo")) {
			e.preventDefault();
			for (let i = 0; i < inputs.length; i++) {
				let errores = await FN.averiguaLosErrores(i);
				FN.muestraLosErrores(errores, i);
			}
			FN.actualizaBotonGuardar();
		}
	});
});
