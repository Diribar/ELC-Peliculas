window.addEventListener("load", () => {
	let inputs = document.querySelectorAll(".input[disabled]");
	let avisos = document.querySelectorAll(".aviso");
	mensaje1 = "Podrás editar este campo más adelante.";
	mensaje2 = "Al terminar, se te explicará cómo.";

	// Agregarle el mensaje a los avisos
	for (let i = 0; i < inputs.length; i++) {
		avisos[i].innerHTML="<p>"+mensaje1+"</p><p>"+mensaje2+"</p>"
	}

	// Acciones si se detecta un click en un input
	window.addEventListener("click", (e) => {
		for (let i = 0; i < inputs.length; i++) {
			e.target == inputs[i]
				? avisos[i].classList.toggle("ocultar")
				: avisos[i].classList.add("ocultar");
		}
	});
});
