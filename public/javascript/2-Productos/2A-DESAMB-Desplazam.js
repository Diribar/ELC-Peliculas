window.addEventListener("load", async () => {
	// Definir variables
	let resultado = document.querySelector("#resultadoDesamb");
	let form = document.querySelectorAll("#resultadoDesamb form");
	let anchoTotal = resultado.scrollWidth;
	let anchoVisible = resultado.offsetWidth;
	let anchoForm = form[0].clientWidth;
	let desplazamiento = parseInt(anchoVisible / anchoForm) * anchoForm;

	// Desplazamiento por teclado
	window.addEventListener("keydown", (e) => {
		//console.log(e.key);
		if (e.key == "Home") resultado.scrollTo(0, 0);
		if (e.key == "End") resultado.scrollTo(anchoTotal, 0);
		if (e.key == "PageDown")
			resultado.scrollTo(
				parseInt(resultado.scrollLeft / desplazamiento) * desplazamiento + desplazamiento,
				0
			);
		if (e.key == "PageUp")
			resultado.scrollTo(
				parseInt(resultado.scrollLeft / desplazamiento + 0.99) * desplazamiento -
					desplazamiento,
				0
			);
		if (e.key == "ArrowDown" || e.key == "ArrowRight")
			resultado.scrollTo(
				parseInt(resultado.scrollLeft / anchoForm) * anchoForm + anchoForm,
				0
			);
		if (e.key == "ArrowUp" || e.key == "ArrowLeft")
			resultado.scrollTo(
				parseInt(resultado.scrollLeft / anchoForm + 0.99) * anchoForm - anchoForm,
				0
			);
	});
});
