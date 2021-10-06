window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("#data_entry");
	let button = document.querySelector("#data_entry button[type='submit']");
	let inputs = document.querySelectorAll(".form-grupo .input");
	let iconoError = document.querySelectorAll(".form-grupo .fa-times-circle");
	let mensajeError = document.querySelectorAll(".form-grupo .mensajeError");

	// Hacer visible el mensaje de error del Avatar al iniciar
	grupoAvatar = mensajeError.length - 1;
	mensajeError[grupoAvatar].innerHTML = "Necesitamos que agregues la imagen";
	iconoError[grupoAvatar].classList.remove("ocultar");

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
			console.log("mensaje");
			if (mensaje) {
				console.log("errores");
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
