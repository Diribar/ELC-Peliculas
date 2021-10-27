window.addEventListener("load", () => {
	let inputs = document.querySelectorAll(".input[disabled]");
	let mensajes = document.querySelectorAll(".mensajeAyuda");

	// Acciones si se detecta un click en un input
	window.addEventListener("click", (e) => {
		for (let i = 0; i < inputs.length; i++) {
			e.target == inputs[i]
				? mensajes[i].classList.toggle("ocultar")
				: mensajes[i].classList.add("ocultar");
		}
	});
});
