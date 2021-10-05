window.addEventListener("load", () => {
	// Acciones cuando se hace click
	let form = document.querySelector("#data_entry");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll("#data_entry .input");
	console.log(inputs)
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let mensajesError = document.querySelectorAll(".mensajeError");
	let mensajesAyuda = document.querySelectorAll(".mensajeAyuda");
	let iconoOK = document.querySelectorAll(".fa-check-circle");
	let iconosAyuda = document.querySelectorAll(".fa-question-circle");
	let resultado = document.querySelector("#resultado");

	// Fórmulas
	let revisarInput = async (i) => {
		// Averiguar si hay un error
		campo = inputs[i].name;
		valor = encodeURIComponent(inputs[i].value);
		let errores = await fetch(
			"/peliculas/agregar/api/validar-copiar-fa/?" + campo + "=" + valor
		).then((n) => n.json());
		mensaje = errores[campo];
		mensajesError[i].innerHTML = mensaje;
		// Agregar comentario en 'contenido'
		campo == "contenido" ? comentarioContenido(errores.campos, valor) : "";
		// En caso de error
		if (mensaje) {
			iconoError[i].classList.remove("ocultar");
			iconoOK[i].classList.add("ocultar");
			button.classList.add("botonSinLink");
		} else {
			// En caso de que no haya error
			iconoError[i].classList.add("ocultar");
			iconoOK[i].classList.remove("ocultar");
			button.classList.remove("botonSinLink");
			for (let j = 0; j < inputs.length; j++) {
				mensajesError[j].innerHTML
					? button.classList.add("botonSinLink")
					: "";
			}
		}
	};
	let comentarioContenido = (campos, valor) => {
		resultado.classList.remove(...resultado.classList);
		// Formatos
		campos
			? resultado.classList.add("resultadoExitoso")
			: valor != ""
			? resultado.classList.add("resultadoInvalido")
			: "";
		// Mensaje
		resultado.innerHTML = campos
			? campos == 1
				? "Se obtuvo 1 solo dato"
				: "Se obtuvieron " + campos + " datos"
			: valor != ""
			? "No se obtuvo ningún dato"
			: "<br>";
	};

	// Status inicial
	for (let i = 0; i < iconoError.length; i++) {
		iconoError[i].classList.contains("ocultar") &&
		iconoOK[i].classList.contains("ocultar") &&
		inputs[i].value != ""
			? revisarInput(i)
			: "";
	}

	// Mensajes de ayuda y status inicial
	window.onclick = (e) => {
		// Mensajes de ayuda
		for (let i = 0; i < iconosAyuda.length; i++) {
			e.target.matches("#" + iconosAyuda[i].id)
				? mensajesAyuda[i].classList.toggle("ocultar")
				: mensajesAyuda[i].classList.add("ocultar");
		}
	};

	// Revisar el data-entry y comunicar los aciertos y errores
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("input", async () => {
			await revisarInput(i);
		});
	}

	// Submit
	form.addEventListener("submit", (e) => {
		button.classList.contains("botonSinLink") ? e.preventDefault() : "";
	});
});
