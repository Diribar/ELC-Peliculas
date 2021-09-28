window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("#data_entry");
	let button = document.querySelector("#data_entry button[type='submit']");
	let inputs = document.querySelectorAll(".formulario-grupo .input");
	let asterisco = document.querySelectorAll(
		".formulario-grupo .fa-times-circle"
	);
	let mensajes = document.querySelectorAll(".formulario-grupo .mensajeError");

	for (let i = 0; i < inputs.length; i++) {
		// Anular 'submit' si hay algún error
		!asterisco[i].classList.contains("ocultar")
			? button.classList.add("botonSinLink")
			: "";
		// Acciones si se realizan cambios
		inputs[i].addEventListener("change", async () => {
			campo = inputs[i].name;
			valor = inputs[i].value;
			errores = await fetch(
				"/peliculas/agregar/api/validarDatosDuros/?" +
					campo +
					"=" +
					valor
			).then((n) => n.json());
			mensaje = errores[campo];
			mensajes[i].innerHTML = mensaje;
			if (mensaje) {
				asterisco[i].classList.remove("ocultar");
				button.classList.add("botonSinLink");
			} else {
				asterisco[i].classList.add("ocultar");
				button.classList.remove("botonSinLink");
				for (let j = 0; j < inputs.length; j++) {
					mensajes[j].innerHTML
						? button.classList.add("botonSinLink")
						: "";
				}
			}
		});
	}
	form.addEventListener("submit", (e) => {
		button.classList.contains("botonSinLink") ? e.preventDefault() : "";
	});
});
