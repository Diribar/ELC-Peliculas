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
			campo = inputs[i].name;
			valor = inputs[i].value;
			errores = await fetch(
				"/peliculas/agregar/api/validar-datos-duros/?" +
					campo +
					"=" +
					valor
			).then((n) => n.json());
			mensaje = errores[campo];
			mensajeError[i].innerHTML = mensaje;
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
	});
});
