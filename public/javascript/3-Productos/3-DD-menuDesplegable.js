window.addEventListener("load", () => {
	let inputs = document.querySelectorAll(".input[disabled]");
	let avisos = document.querySelectorAll(".aviso");

	window.addEventListener("click", (e) => {
		console.log(e.target)
		for (let i = 0; i < inputs.length; i++) {
			e.target == inputs[i]
				? avisos[i].classList.toggle("ocultar")
				: avisos[i].classList.add("ocultar");
		}
	});
});
