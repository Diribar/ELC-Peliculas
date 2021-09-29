window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("#data_entry");
	let button = document.querySelector("#data_entry button[type='submit']");
	let input = document.querySelector(".form-grupo .input");
	let asterisco = document.querySelectorAll(".form-grupo .fa-times-circle");
	let mensaje = document.querySelectorAll(".form-grupo .mensajeError");

		// Anular 'submit' si hay algún error
		!asterisco.classList.contains("ocultar")
			? button.classList.add("botonSinLink")
			: "";
		// Acciones si se realizan cambios
		input.addEventListener("change", async () => {
			campo = input.name;
			valor = input.value;
			errores = await fetch(
				"/usuarios/api/validarMail/?" +
					campo +
					"=" +
					valor
			).then((n) => n.json());
			mensaje = errores[campo];
			mensaje.innerHTML = mensaje;
			if (mensaje) {
				asterisco.classList.remove("ocultar");
				button.classList.add("botonSinLink");
			} else {
				asterisco.classList.add("ocultar");
				button.classList.remove("botonSinLink");
				for (let j = 0; j < input.length; j++) {
					mensaje[j].innerHTML
						? button.classList.add("botonSinLink")
						: "";
				}
			}
		});
	
	form.addEventListener("submit", (e) => {
		button.classList.contains("botonSinLink") ? e.preventDefault() : "";
	});
});
