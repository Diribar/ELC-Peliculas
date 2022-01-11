window.addEventListener("load", () => {
	// Variables
	let inputs = document.querySelectorAll(".input[disabled]");
	let mensajesAyuda = document.querySelectorAll(".mensajeAyuda");

	// Acciones si se detecta un click en un input
	window.addEventListener("click", (e) => {
		for (let i = 0; i < inputs.length; i++) {
			e.target == inputs[i]
				? mensajesAyuda[i].classList.toggle("ocultar")
				: mensajesAyuda[i].classList.add("ocultar");
		}
	});
});
