"use strict";
window.addEventListener("load", () => {
	// Tareas
	let tarea = location.pathname;
	tarea = tarea.slice(tarea.lastIndexOf("/") + 1);

	// Variables
	const form = document.querySelector("form");
	let DOM = {
		// OK/Errores
		iconosOK: form.querySelectorAll(".inputError .fa-circle-check"),
		ocultaOK_imagen: form.querySelector(".inputError .fa-circle-check.ocultaOK_imagen"),
		iconosError: form.querySelectorAll(".inputError .fa-circle-xmark"),
		mensajesError: form.querySelectorAll(".inputError .mensajeError"),
		credenciales: form.querySelector("#credenciales"),

		// Temas de avatar
		imgAvatar: form.querySelector(".inputError label img"),
		inputAvatar: form.querySelector(".inputError input[name='avatar']"),

		// Varios
		button: form.querySelector("button[type='submit']"),
		inputs: form.querySelectorAll(".inputError .input"),
		olvidoContr: form.querySelector(".iconos #olvidoContr"),
	};
	let v = {
		inputs: Array.from(DOM.inputs).map((n) => n.name),
		avatarInicial: DOM.imgAvatar ? DOM.imgAvatar.src : "",
		esImagen: false,
		imgOpcional: tarea == "editables",
		rutaApi: "api/us-valida-" + tarea + "/?",
	};

	// Funciones
	let FN = {
		averiguaLosErrores: async (indice) => {
			// Variables
			const campo = DOM.inputs[indice].name;
			let valor = encodeURIComponent(DOM.inputs[indice].value);

			// Particularidad para 'avatar'
			if (campo.includes("avatar")) {
				valor += "&imgOpcional=" + (v.imgOpcional ? "SI" : "NO");
				if (DOM.inputAvatar.value) {
					valor += "&esImagen=" + (v.esImagen ? "SI" : "NO");
					valor += "&tamano=" + DOM.inputAvatar.files[0].size;
				}
			}

			// Averigua los errores
			let errores =
				campo != "avatar" || // no es un avatar
				DOM.inputs[indice].value || // tiene un valor
				!v.esImagen || // no es una imagen
				(tarea == "documento" && DOM.imgAvatar.src.includes("imagenes/Avatar")) // es un documento con el avatar genérico
					? await fetch(v.rutaApi + campo + "=" + valor).then((n) => n.json())
					: "";

			// Fin
			return errores;
		},
		muestraLosErrores: (error, indice) => {
			// Variables
			const campo = DOM.inputs[indice].name;
			let mensaje = error[campo];

			// Reemplaza el mensaje, con particularidad para 'avatar'
			DOM.mensajesError[indice].innerHTML = mensaje;

			// Acciones en función de si hay o no mensajes de error
			mensaje ? DOM.iconosError[indice].classList.remove("ocultar") : DOM.iconosError[indice].classList.add("ocultar");
			mensaje ? DOM.iconosOK[indice].classList.add("ocultar") : DOM.iconosOK[indice].classList.remove("ocultar");
		},
		actualizaBotonGuardar: () => {
			// Variables
			const OK = Array.from(DOM.iconosOK)
				.map((n) => n.className)
				.every((n) => !n.includes("ocultar"));
			const error = Array.from(DOM.iconosError)
				.map((n) => n.className)
				.every((n) => n.includes("ocultar"));

			// Fin
			OK && error ? DOM.button.classList.remove("inactivo") : DOM.button.classList.add("inactivo");
		},
		actualizaVarios: async function (indice) {
			// Detecta si hay errores
			let errores = await this.averiguaLosErrores(indice);

			// Comunica los aciertos y errores
			this.muestraLosErrores(errores, indice);

			// Activa/Desactiva el botón 'Guardar'
			this.actualizaBotonGuardar();
		},
		startUp: async function () {
			// Averigua y muestra los errores
			for (let indice = 0; indice < DOM.inputs.length; indice++) {
				let errores = await this.averiguaLosErrores(indice);
				this.muestraLosErrores(errores, indice);
			}
			// Botón guardar
			this.actualizaBotonGuardar();
		},
	};

	// Eventos - Redirige a 'olvido-contrasena'
	if (DOM.olvidoContr)
		DOM.olvidoContr.addEventListener("click", (e) => (location.href = "olvido-contrasena/?email=" + DOM.inputs[0].value));

	// Eventos - Input
	form.addEventListener("input", async (e) => {
		// Variables
		const input = e.target;
		const campo = input.name;
		const valor = input.value;
		const indice = v.inputs.indexOf(campo);
		const posicCursor = input.selectionStart;

		// Desactiva el cartel de 'credenciales inválidas'
		if (DOM.credenciales) DOM.credenciales.classList.add("ocultar");

		// Primera letra en mayúscula
		if (tarea != "login" && input.localName == "input" && input.type == "text") {
			input.value = valor.slice(0, 1).toUpperCase() + valor.slice(1);
			input.selectionEnd = posicCursor;
		} else if (tarea == "login" && campo == "email") {
			// e-mail en minúscula
			input.value = input.value.toLowerCase();
			input.selectionEnd = posicCursor;

			// Le agrega el mail al href para olvido de contraseña
			DOM.olvidoContr.href = v.olvidoContrHref + "/?email=" + valor;
		}

		// Acciones si se cambió el avatar
		if (campo == "avatar") await revisaAvatar({DOM, v, FN, indice});
		// Acciones para los demás campos
		else if (indice > -1) await FN.actualizaVarios(indice);
	});

	// Eventos - Submit
	form.addEventListener("submit", async (e) => {
		if (DOM.button.className.includes("inactivo")) {
			e.preventDefault();
			FN.startUp();
		}
	});
});
