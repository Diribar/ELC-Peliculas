window.addEventListener("load", () => {
	// Variables generales
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let input = document.querySelector(".form-grupo .input");
	let asterisco = document.querySelector(".form-grupo .fa-circle-xmark");
	let mensajes = document.querySelector(".form-grupo .mensajeError");

	// Anular 'submit' si hay algún error
	if (!asterisco.classList.contains("ocultar")) button.classList.add("inactivo")
	// Acciones si se realizan cambios
	input.addEventListener("change", async () => {
		campo = input.name;
		valor = input.value;
		errores = await fetch(
			"/usuarios/api/validar-mail/?" + campo + "=" + valor
		).then((n) => n.json());
		mensaje = errores[campo];
		mensajes.innerHTML = mensaje;
		if (mensaje) {
			asterisco.classList.remove("ocultar");
			button.classList.add("inactivo");
		} else {
			asterisco.classList.add("ocultar");
			button.classList.remove("inactivo");
		}
	});

	form.addEventListener("submit", (e) => {
		button.classList.contains("inactivo") ? e.preventDefault() : "";
	});
});
