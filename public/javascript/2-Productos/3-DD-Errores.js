window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("#data_entry");
	let button = document.querySelector("#data_entry button[type='submit']");
	let inputs = document.querySelectorAll(".input-error .input");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let mensajeError = document.querySelectorAll(".input-error .mensajeError");

	// Revisar el data-entry y comunicar los aciertos y errores
	for (let i = 0; i < inputs.length; i++) {
		// Status inicial
		!iconoError[i].classList.contains("ocultar")
			? button.classList.add("botonSinLink")
			: "";
		// Acciones ante cambios en el input
		inputs[i].addEventListener("input", async () => {
			// Averiguar si hay algún error
			campo = inputs[i].name;
			valor = inputs[i].value;
			errores = await fetch(
				"/agregar/productos/api/validar-datos-duros/?" +
					campo +
					"=" +
					valor
			).then((n) => n.json());
			mensaje = errores[campo];
			// Verificar que el año de fin sea mayor o igual que el de estreno
			if (!mensaje && campo == "ano_fin") {
				inputs.forEach((input, index) => {
					if (input.name == "ano_estreno") indice = index;
				});
				ano_estreno = inputs[indice].value;
				valor < ano_estreno
					? (mensaje =
							"El año de finalización debe ser igual o mayor que el año de estreno")
					: "";
			}
			mensajeError[i].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			if (mensaje) {
				iconoError[i].classList.remove("ocultar");
				button.classList.add("botonSinLink");
			} else {
				iconoError[i].classList.add("ocultar");
				button.classList.remove("botonSinLink");
				for (let j = 0; j < inputs.length; j++) {
					mensajeError[j].innerHTML
						? button.classList.add("botonSinLink")
						: "";
				}
			}
		});
	}

	// Submit
	form.addEventListener("submit", (e) => {
		button.classList.contains("botonSinLink") ? e.preventDefault() : "";
		button.classList.add("botonSinLink");
	});
});
