window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#data_entry");
	let button = document.querySelector("#data_entry button[type='submit']");
	let inputs = document.querySelectorAll(".input-error .input");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let mensajesError = document.querySelectorAll(".mensajeError");
	let mensajesAyuda = document.querySelectorAll(".mensajeAyuda");
	let statusInicial = true;

	// Anula/activa el botón 'Submit', muestra el ícono de error/acierto
	let revisarInput = (i, errores) => {
		// Averiguar si hay un error
		campo = inputs[i].name;
		valor = encodeURIComponent(inputs[i].value);
		mensaje = errores[campo];
		mensajesError[i].innerHTML = mensaje;
		// En caso de error
		if (mensaje) {
			iconoError[i].classList.remove("ocultar");
			iconoOK[i].classList.add("ocultar");
			button.classList.add("botonSinLink");
		} else {
			// En caso de que no haya error
			iconoError[i].classList.add("ocultar");
			iconoOK[i].classList.remove("ocultar");
			sinErrores = true;
			for (let j = 0; j < inputs.length; j++) {
				iconoOK[j].classList.contains("ocultar")
					? (sinErrores = false)
					: "";
			}
			sinErrores
				? button.classList.remove("botonSinLink")
				: button.classList.add("botonSinLink");
		}
	};

	// Funciones para revisar todos los inputs, devuelve los errores
	let validarDataEntry = () => {
		url = "?";
		for (let i = 0; i < inputs.length; i++) {
			i > 0 ? (url += "&") : "";
			url += inputs[i].name;
			url += "=";
			url += encodeURIComponent(inputs[i].value);
		}
		return fetch("/productos/agregar/api/validar-datos-pers/" + url).then(
			(n) => n.json()
		);
	};

	// Status inicial
	if (statusInicial) {
		errores = await validarDataEntry();
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value != "" ? revisarInput(i, errores) : "";
		}
		statusInicial = false;
	}

	// Revisa un data-entry en particular (el modificado) y comunica si está OK o no
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("input", async () => {
			errores = await validarDataEntry();
			revisarInput(i, errores);
		});
	}

	// Submit
	form.addEventListener("submit", async (e) => {
		if (button.classList.contains("botonSinLink")) {
			e.preventDefault();
			errores = await validarDataEntry();
			for (let i = 0; i < inputs.length; i++) {
				revisarInput(i, errores);
			}
		}
	});

	// Mensajes de ayuda
	window.onclick = (e) => {
		// Mensajes de ayuda
		for (let i = 0; i < iconosAyuda.length; i++) {
			e.target.matches("#" + iconosAyuda[i].id)
				? mensajesAyuda[i].classList.toggle("ocultar")
				: mensajesAyuda[i].classList.add("ocultar");
		}
	};
});
