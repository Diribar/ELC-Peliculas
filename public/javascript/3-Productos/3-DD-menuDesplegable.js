window.addEventListener("load", () => {
	let inputs = document.querySelectorAll(".input[disabled]");
	let avisos = document.querySelectorAll(".aviso");

	// Acciones si se detecta un click en un input
	window.addEventListener("click", (e) => {
		for (let i = 0; i < inputs.length; i++) {
			e.target == inputs[i]
				? avisos[i].classList.toggle("ocultar")
				: avisos[i].classList.add("ocultar");
		}
	});
});
