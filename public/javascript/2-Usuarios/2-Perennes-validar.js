window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let inputs = document.querySelectorAll(".form-grupo .input");
	let asteriscos = document.querySelectorAll(".form-grupo .fa-times-circle");
	let mensajes = document.querySelectorAll(".form-grupo .mensajeError");

	for (let i = 0; i < inputs.length; i++) {
		// Anular 'submit' si hay algún error
		!asteriscos[i].classList.contains("ocultar")
			? button.classList.add("botonSinLink")
			: "";
		// Acciones si se realizan cambios
		inputs[i].addEventListener("change", async () => {
			campo = inputs[i].name;
			valor = inputs[i].value;
			errores = await fetch(
				"/usuarios/api/validarperennes/?" +
					campo +
					"=" +
					valor
			).then((n) => n.json());
			mensaje = errores[campo];
			mensajes[i].innerHTML = mensaje;
			if (mensaje) {
				asteriscos[i].classList.remove("ocultar");
				button.classList.add("botonSinLink");
			} else {
				asteriscos[i].classList.add("ocultar");
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
