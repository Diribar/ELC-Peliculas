window.addEventListener("load", () => {
	// Variables
	let taparElFondo = document.querySelector("#tapar-el-fondo");
	let cartelAdvertencia = document.querySelector("#cartelAdvertencia");
	let cancelar = document.querySelector("#cartelAdvertencia .fa-circle-left");

	cancelar.addEventListener("click", () => {
		taparElFondo.classList.add("ocultar");
		cartelAdvertencia.classList.add("ocultar");
	});

	window.addEventListener("keydown", (e) => {
		if (e.key == "Escape") {
			taparElFondo.classList.add("ocultar");
			cartelAdvertencia.classList.add("ocultar");
		}
	});
});
