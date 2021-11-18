window.addEventListener("load", async () => {
	// Variables
	let iconosAyuda = document.querySelectorAll(".fa-question-circle");
	let mensajesAyuda = document.querySelectorAll(".mensajeAyuda");

	// Mensajes de ayuda
	window.onclick = (e) => {
		for (let i = 0; i < iconosAyuda.length; i++) {
			e.target.matches("#" + iconosAyuda[i].id)
				? mensajesAyuda[i].classList.toggle("ocultar")
				: mensajesAyuda[i].classList.add("ocultar");
		}
	};
});
