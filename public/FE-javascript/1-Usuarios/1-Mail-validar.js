window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let input = document.querySelector(".form-grupo .input");
	let asterisco = document.querySelector(".form-grupo .fa-times-circle");
	let mensajes = document.querySelector(".form-grupo .mensajeError");

	// Anular 'submit' si hay algún error
	if (!asterisco.classList.contains("ocultar")) button.classList.add("botonInactivado")
	// Acciones si se realizan cambios
	input.addEventListener("change", async () => {
		campo = input.name;
		valor = input.value;
		errores = await fetch(
			"/usuarios/api/validarMail/?" + campo + "=" + valor
		).then((n) => n.json());
		mensaje = errores[campo];
		mensajes.innerHTML = mensaje;
		if (mensaje) {
			asterisco.classList.remove("ocultar");
			button.classList.add("botonInactivado");
		} else {
			asterisco.classList.add("ocultar");
			button.classList.remove("botonInactivado");
		}
	});

	form.addEventListener("submit", (e) => {
		button.classList.contains("botonInactivado") ? e.preventDefault() : "";
	});
});
