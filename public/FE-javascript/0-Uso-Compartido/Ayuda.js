window.addEventListener("load", () => {
	// Variables
	let iconosAyuda = document.querySelectorAll("main .fa-circle-question");
	let mensajesAyuda = document.querySelectorAll("main .mensajeAyuda");

	// Mensajes de ayuda
	window.addEventListener("click", (e) => {
		for (let i = 0; i < iconosAyuda.length; i++) {
			e.target == iconosAyuda[i]
				? mensajesAyuda[i].classList.toggle("ocultar")
				: mensajesAyuda[i].classList.add("ocultar");
		}
	});
});
